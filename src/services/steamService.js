import { supabase } from '../supabase';
import { normalizeSteamGames } from './steamImport';

const SNAPSHOT_KEY = 'gamenote.steam.snapshot.';

async function requestSteam(payload, signal) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Prijavi se za Steam uvoz.');
  let response;
  try {
    response = await fetch('/.netlify/functions/steam', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Steam uvoz nije dostupan. Provjeri vezu i pokušaj ponovno.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Dohvat sa Steama nije uspio.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function fetchSteamLibrary(profile, signal) {
  const data = await requestSteam({ action: 'library', profile }, signal);
  return { profile: data.profile, games: normalizeSteamGames(data.games), syncedAt: Date.now() };
}

export async function fetchSteamAchievements(steamId, appId, signal) {
  const data = await requestSteam({ action: 'achievements', profile: steamId, appId }, signal);
  return data.achievements;
}

export function saveSteamSnapshot(userId, snapshot) {
  try {
    localStorage.setItem(SNAPSHOT_KEY + userId, JSON.stringify(snapshot));
  } catch {
    // Uvoz radi i bez lokalnog spremnika.
  }
}

export function loadSteamSnapshot(userId) {
  try {
    const snapshot = JSON.parse(localStorage.getItem(SNAPSHOT_KEY + userId));
    if (/^7656119\d{10}$/.test(snapshot?.profile?.steamId) && Array.isArray(snapshot.games)) return snapshot;
  } catch {
    return null;
  }
  return null;
}

export function clearSteamSnapshot(userId) {
  try {
    localStorage.removeItem(SNAPSHOT_KEY + userId);
  } catch {
    // Spremnik možda nije dostupan.
  }
}
