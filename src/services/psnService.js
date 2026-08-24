// PSN sync u pregledniku; auth + trofeji preko stateless relayja.
import {
  getUserPlayedGames,
  getProfileFromAccountId
} from 'psn-api';
import { seal, unseal, isEnvelope, deleteKey } from './tokenVault';

const TOKENS_KEY = 'gamenote.psn.tokens';
const SNAPSHOT_KEY = 'gamenote.psn.snapshot';
const ACCOUNT_ID_KEY = 'gamenote.psn.accountId';
const ONLINE_ID_KEY = 'gamenote.psn.onlineId';
const AUTH_ENDPOINT = '/.netlify/functions/psn-auth';
const RELAY_ENDPOINT = '/.netlify/functions/psn-relay';
const PAGE_PACING_MS = 300;

export class PsnAuthRequiredError extends Error {
  constructor(message = 'PSN račun nije povezan ili je veza istekla.') {
    super(message);
    this.name = 'PsnAuthRequiredError';
  }
}

// ---------- localStorage ----------
let plaintextWarned = false;

async function readTokens() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(TOKENS_KEY)); } catch { raw = null; }
  if (!raw) return null;

  if (isEnvelope(raw)) {
    const t = await unseal(raw);
    if (!t) {
      localStorage.removeItem(TOKENS_KEY);
      console.warn('[psn] Tokeni se ne mogu dešifrirati — poveži se ponovno.');
    }
    return t;
  }

  // legacy plaintext → migriraj u šifriranu omotnicu
  if (raw.accessToken || raw.refreshToken) {
    const env = await seal(raw);
    localStorage.setItem(TOKENS_KEY, JSON.stringify(env ?? raw));
  }
  return raw;
}

async function writeTokens(t) {
  const env = await seal(t);
  if (env) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(env));
    return;
  }
  if (!plaintextWarned) {
    plaintextWarned = true;
    console.warn('[psn] Kriptografija nedostupna — tokeni se privremeno spremaju nešifrirano.');
  }
  localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
}

function clearTokens() {
  localStorage.removeItem(TOKENS_KEY);
}
export function hasPsnConnection() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(TOKENS_KEY)); } catch { raw = null; }
  if (!raw) return false;
  return Boolean(isEnvelope(raw) || raw.accessToken || raw.refreshToken);
}
export function disconnectPsn() {
  clearTokens();
  localStorage.removeItem(SNAPSHOT_KEY);
  localStorage.removeItem(ACCOUNT_ID_KEY);
  localStorage.removeItem(ONLINE_ID_KEY);
  deleteKey();
}

// ---------- identitet cache ----------
function readCachedAccountId() {
  return localStorage.getItem(ACCOUNT_ID_KEY) || null;
}
function writeCachedAccountId(id) {
  if (id) localStorage.setItem(ACCOUNT_ID_KEY, String(id));
}
function readSavedOnlineId() {
  return localStorage.getItem(ONLINE_ID_KEY) || null;
}

// ---------- snapshot cache ----------
export function saveSnapshot(snapshot) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ ...snapshot, syncedAt: Date.now() }));
}
export function loadSnapshot() {
  try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)); } catch { return null; }
}

// ---------- auth ----------
let idMigrationTried = false;

async function tokensFromResponse(data) {
  const stored = await readTokens();
  const now = Date.now();
  return {
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.expiresIn ? now + Number(data.expiresIn) * 1000 : now + 3_600_000,
    idToken: data.idToken ?? stored?.idToken ?? null,
    refreshToken: data.refreshToken ?? stored?.refreshToken ?? null,
    refreshTokenExpiresAt: data.refreshTokenExpiresIn ? now + Number(data.refreshTokenExpiresIn) * 1000 : now + 60 * 24 * 3_600_000
  };
}

async function exchangeRemote(body) {
  let res;
  try {
    res = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('PSN auth servis nije dostupan. Pokušaj ponovno.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && body.mode === 'refresh') throw new PsnAuthRequiredError(data?.error);
    throw new Error(data?.error || 'PSN autentikacija nije uspjela.');
  }
  return data;
}

async function ensureAuthorization({ forceRefresh = false } = {}) {
  const tokens = await readTokens();
  if (!tokens) throw new PsnAuthRequiredError();

  // tihi refresh za idToken migraciju
  const needsIdMigration = !tokens.idToken && !idMigrationTried;
  if (needsIdMigration) idMigrationTried = true;

  if (!forceRefresh && !needsIdMigration && tokens.accessToken && Date.now() < (tokens.accessTokenExpiresAt || 0) - 60_000) {
    return { accessToken: tokens.accessToken };
  }
  if (!tokens.refreshToken) throw new PsnAuthRequiredError();

  const fresh = await tokensFromResponse(await exchangeRemote({ mode: 'refresh', refreshToken: tokens.refreshToken }));
  await writeTokens(fresh);
  return { accessToken: fresh.accessToken };
}

// ---------- pozivi prema PSN-u (pacing + retry) ----------
let lastCallTs = 0;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function pace() {
  const wait = PAGE_PACING_MS - (Date.now() - lastCallTs);
  if (wait > 0) await sleep(wait);
  lastCallTs = Date.now();
}

async function psnCall(taskFn, attempts = 4) {
  let lastErr;
  let refreshed = false;
  for (let i = 0; i < attempts; i++) {
    try {
      const auth = await ensureAuthorization();
      await pace();
      return await taskFn(auth);
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || '');
      if (/unauthorized|expired|invalid token|authentication/i.test(msg)) {
        if (refreshed) throw new PsnAuthRequiredError(msg);
        refreshed = true;
        await ensureAuthorization({ forceRefresh: true });
        continue;
      }
      if (/too many requests|rate limit|429/i.test(msg)) {
        await sleep(1000 * 2 ** i);
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

// m.np vs legacy oblik stranice
const TROPHY_PAGE_LIMIT = 800;
function normalizeTrophyPage(resp, offset) {
  if (!resp || typeof resp !== 'object') return { titles: [], nextOffset: null };
  const raw = resp.titles ?? resp.trophyTitles ?? [];
  const titles = Array.isArray(raw) ? raw : [];
  // prazna stranica = kraj
  if (!titles.length) return { titles: [], nextOffset: null };
  let nextOffset = resp.nextOffset ?? null;
  if (nextOffset == null) {
    const total = resp.totalItemCount ?? resp.totalResultsCount ?? null;
    // napredak po stvarno duljini stranice
    if (total != null && offset + titles.length < Number(total)) nextOffset = offset + titles.length;
  }
  return { titles, nextOffset };
}

async function paginate(fetchPage, onPage) {
  let offset = 0;
  let all = [];
  for (;;) {
    const resp = await fetchPage(offset);
    all = all.concat(resp?.titles || []);
    onPage?.(all.length);
    if (resp?.nextOffset == null || resp.nextOffset <= offset) break;
    offset = resp.nextOffset;
  }
  return all;
}

// ---------- podaci ----------
function decodeJwtClaims(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch { return null; }
}

// idToken: 'sub', accessToken: 'account_id'
function accountIdFromTokens(tokens) {
  for (const t of [tokens?.idToken, tokens?.accessToken, tokens?.refreshToken]) {
    const claims = decodeJwtClaims(t);
    const id = claims && [claims.sub, claims.account_id].find(v => typeof v === 'string' && v);
    if (id) return id;
  }
  return null;
}

// offline fallback iz idTokena
function onlineIdFromTokens(tokens) {
  const claims = decodeJwtClaims(tokens?.idToken);
  return typeof claims?.online_id === 'string' && claims.online_id ? claims.online_id : null;
}

async function relayGet(path, accessToken) {
  let res;
  try {
    res = await fetch(`${RELAY_ENDPOINT}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } catch {
    throw new Error('PSN relay servis nije dostupan.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message ?? data?.error ?? 'Greška pri dohvaćanju PSN podataka.';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

// custom profilna prije klasičnih avatara
function pickAvatar(avatarList) {
  if (!Array.isArray(avatarList) || !avatarList.length) return null;
  const pick = (a) => a?.url || a?.avatarUrl || null;
  const sized = (s, pool) => pool.find(a => a?.size === s);
  const best = (pool) => pick(sized('xl', pool)) || pick(sized('l', pool)) || pick(sized('m', pool)) || pick(sized('s', pool)) || pick(pool[pool.length - 1]);
  const custom = avatarList.filter(a => { const u = pick(a); return u && !u.includes('static-resource.np.community.playstation.net'); });
  const url = best(custom) || best(avatarList);
  return url ? url.replace(/^http:/, 'https:') : null;
}

async function identityFallback() {
  return { onlineId: onlineIdFromTokens(await readTokens()), avatarUrl: null };
}

// universalSearch ide preko relayja
async function searchAccountId(onlineId) {
  const wanted = String(onlineId || '').trim().toLowerCase();
  if (!wanted) return null;
  const data = await psnCall(auth => fetch(`${RELAY_ENDPOINT}/api/search/v1/universalSearch`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchTerm: onlineId,
      domainRequests: [{ domain: 'SocialAllAccounts', pagination: { cursor: '', pageSize: 20 } }]
    })
  }).then(async res => {
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message || `Pretraga nije uspjela (${res.status}).`);
    return json;
  }));
  const results = data?.domainResponses?.[0]?.results || [];
  const match = results.find(x => String(x?.socialMetadata?.onlineId || '').toLowerCase() === wanted);
  return match?.socialMetadata?.accountId || null;
}

// lanac: JWT → cache → Online ID
async function resolveIdentity({ onlineId } = {}) {
  const fromJwt = accountIdFromTokens(await readTokens());
  if (fromJwt) {
    writeCachedAccountId(fromJwt);
    return fromJwt;
  }
  const cached = readCachedAccountId();
  if (cached) return cached;

  const handle = String(onlineId || '').trim() || readSavedOnlineId();
  if (!handle) return null;
  try {
    const found = await searchAccountId(handle);
    if (found) writeCachedAccountId(found);
    return found;
  } catch (e) {
    console.warn('[psn] Online ID pretraga nije uspjela:', e?.message);
    return null;
  }
}

async function fetchProfileSafe(accountId) {
  if (!accountId) return identityFallback();
  try {
    const res = await psnCall(auth => getProfileFromAccountId(auth, accountId));
    // flat oblik, legacy fallback
    const p = res?.onlineId !== undefined ? res : (res?.profile ?? {});
    console.info('[psn] Identitet dohvaćen:', p.onlineId || '(nepoznat)');
    return {
      onlineId: p.onlineId ?? null,
      avatarUrl: pickAvatar(p.avatars)
    };
  } catch (e) {
    console.warn('[psn] Profil nije dohvaćen:', e?.message);
    return identityFallback();
  }
}

// prima JSON ili sami token
export function extractNpsso(raw) {
  const s = String(raw || '').trim();
  if (s.startsWith('{')) {
    try {
      const j = JSON.parse(s);
      if (typeof j.npsso === 'string' && j.npsso.trim()) return j.npsso.trim();
    } catch { /* fallthrough */ }
  }
  const m = s.match(/"npsso"\s*:\s*"([A-Za-z0-9_-]{20,})"/i);
  if (m) return m[1];
  return s;
}

export async function connectWithNpsso(npsso) {
  const trimmedNpsso = extractNpsso(npsso);
  if (trimmedNpsso.length < 30) throw new Error('NPSSO token nije ispravnog formata.');
  const tokens = await tokensFromResponse(await exchangeRemote({ mode: 'npsso', npsso: trimmedNpsso }));
  await writeTokens(tokens);
  localStorage.removeItem(SNAPSHOT_KEY);

  const accountId = await resolveIdentity();
  if (!accountId) console.warn('[psn] accountId nije riješen — identitet se preskače.');
  return fetchProfileSafe(accountId);
}

export function normalizeTitle(s) {
  return String(s || '').normalize('NFD').toLowerCase()
    .replace(/[™®©]/g, '').replace(/[:\-–—_]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseISODurationToHours(iso) {
  if (!iso) return null;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  return Math.round((Number(m[1] || 0) + Number(m[2] || 0) / 60 + Number(m[3] || 0) / 3600) * 10) / 10;
}

function mergePlayedWithTrophies(playedGames, trophyTitles) {
  const trophyMap = new Map();
  for (const t of trophyTitles) {
    const key = normalizeTitle(t?.trophyTitleName);
    if (key && !trophyMap.has(key)) trophyMap.set(key, t);
  }

  const games = playedGames.map(g => {
    const name = g?.localizedName || g?.name;
    const t = trophyMap.get(normalizeTitle(name));
    const earned = t?.earnedTrophies ? Object.values(t.earnedTrophies).reduce((a, b) => a + Number(b), 0) : null;
    const total = t?.definedTrophies ? Object.values(t.definedTrophies).reduce((a, b) => a + Number(b), 0) : null;
    return {
      npCommunicationId: t?.npCommunicationId || null,
      psnTitleId: g?.titleId || null,
      name: name || 'Unknown',
      platformCategory: g?.category || 'unknown',
      hoursPlayed: parseISODurationToHours(g?.playDuration),
      imageUrl: g?.localizedImageUrl || g?.imageUrl || null,
      firstPlayed: g?.firstPlayedDateTime || null,
      lastPlayed: g?.lastPlayedDateTime || null,
      trophiesEarned: earned,
      trophiesTotal: total,
      trophyPercent: typeof t?.progress === 'number'
        ? Math.round(t.progress)
        : (earned != null && total > 0 ? Math.round(earned / total * 100) : null)
    };
  });

  games.sort((a, b) => new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0));
  return games;
}

export async function fetchSyncData(onStage) {
  await ensureAuthorization();

  onStage?.('Dohvaćam profil…');
  const accountId = await resolveIdentity();
  const profile = await fetchProfileSafe(accountId);
  if (!accountId) console.warn('[psn] accountId nije riješen — identitet iz idTokena/fallbacka.');

  onStage?.('Dohvaćam trofeje profila…');
  // level iz svježeg snapshot-a (<24h)
  const snap = loadSnapshot();
  const freshLevel = (snap?.syncedAt && Date.now() - snap.syncedAt < 86_400_000)
    ? snap?.profile?.trophyLevel ?? null
    : null;
  const summary = freshLevel != null
    ? { trophyLevel: freshLevel }
    : await psnCall(auth => relayGet(`/api/trophy/v1/users/${accountId || 'me'}/trophySummary`, auth.accessToken))
      .catch(() => null);

  onStage?.('Dohvaćam odigrane igre…');
  const playedGames = await paginate(
    (offset) => psnCall(auth => getUserPlayedGames(auth, accountId || 'me', {
      limit: 200,
      offset,
      categories: 'ps4_game,ps5_native_game'
    })),
    (count) => onStage?.(`Dohvaćam odigrane igre… (${count})`)
  );

  onStage?.('Dohvaćam trofeje po igrama…');
  const trophyTitles = await paginate(
    (offset) => psnCall(auth => relayGet(`/api/trophy/v1/users/${accountId || 'me'}/trophyTitles?limit=${TROPHY_PAGE_LIMIT}&offset=${offset}`, auth.accessToken))
      .then(resp => normalizeTrophyPage(resp, offset)),
    (count) => onStage?.(`Dohvaćam trofeje po igrama… (${count})`)
  );

  return {
    profile: {
      accountId,
      onlineId: profile.onlineId,
      avatarUrl: profile.avatarUrl,
      trophyLevel: summary?.trophyLevel ? Number(summary.trophyLevel) : null
    },
    games: mergePlayedWithTrophies(playedGames, trophyTitles)
  };
}
