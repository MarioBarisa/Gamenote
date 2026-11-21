import { fetchUserRows } from './libraryData.js';

const columns = 'id,title,platform,status,currently_playing,rating,notes,genre,genres_list,publisher,play_time,start_date,end_date,created_at,image_url,background_image,progress_mode,progress_value,progress_total,progress_source,achievement_percent';
const cache = new Map();
const pending = new Map();
const listeners = new Set();
const connected = new Set();

export function getCachedGames(supabase, userId, { force = false } = {}) {
  const request = pending.get(userId);
  if (request) return request.promise;
  const cached = cache.get(userId);
  if (!force && cached && Date.now() - cached.fetchedAt < 300_000) return Promise.resolve(cached.rows);

  const load = { outdated: false, controller: new AbortController() };
  pending.set(userId, load);
  load.promise = (async () => {
    try {
      let rows;
      do {
        load.outdated = false;
        try {
          rows = await fetchUserRows(supabase, 'games', userId, { columns, signal: load.controller.signal });
        } catch (error) {
          if (!load.outdated || load.controller.signal.aborted) throw error;
        }
      } while (load.outdated && !load.controller.signal.aborted);
      if (!load.controller.signal.aborted) cache.set(userId, { rows, fetchedAt: Date.now() });
      return rows;
    } finally {
      if (pending.get(userId) === load) pending.delete(userId);
    }
  })();
  return load.promise;
}

export function invalidateGames(userId) {
  cache.delete(userId);
  const load = pending.get(userId);
  if (load) {
    load.outdated = true;
    return;
  }
  for (const listener of listeners) listener(userId);
}

export function onGamesInvalidated(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFreshGames(userId, { maxAge = 300_000, requireRealtime = true } = {}) {
  const cached = cache.get(userId);
  if ((!requireRealtime || connected.has(userId)) && cached && Date.now() - cached.fetchedAt < maxAge) return cached.rows;
  return null;
}

export function subscribeToGames(supabase, userId) {
  let active = true;
  const channel = supabase.channel(`library:${userId}`);
  const changes = { schema: 'public', table: 'games' };
  for (const event of ['INSERT', 'UPDATE']) {
    channel.on('postgres_changes', { ...changes, event, filter: `user_id=eq.${userId}` },
      () => { if (active) invalidateGames(userId); });
  }
  channel.on('postgres_changes', { ...changes, event: 'DELETE' }, ({ old }) => {
    if (active && (pending.has(userId) || cache.get(userId)?.rows.some(row => row.id === old?.id))) {
      invalidateGames(userId);
    }
  });
  channel.subscribe(status => {
    if (!active) return;
    if (status === 'SUBSCRIBED') {
      if (connected.has(userId)) return;
      connected.add(userId);
      if (cache.has(userId) || pending.has(userId)) invalidateGames(userId);
    } else {
      connected.delete(userId);
    }
  });

  return () => {
    active = false;
    connected.delete(userId);
    cache.delete(userId);
    pending.get(userId)?.controller.abort();
    pending.delete(userId);
    void supabase.removeChannel(channel);
  };
}
