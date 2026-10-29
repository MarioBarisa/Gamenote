import { GAME_STATUS } from '../constants/gameStatus.js';

export const PLAYER_TITLES = [
  { hours: 0, label: 'Početnik' },
  { hours: 10, label: 'Znatiželjni igrač' },
  { hours: 50, label: 'Istraživač' },
  { hours: 200, label: 'Iskusni igrač' },
  { hours: 500, label: 'Veteran' },
  { hours: 1000, label: 'Majstor igre' },
  { hours: 2500, label: 'Spirit guide' },
  { hours: 5000, label: 'Archon' },
  { hours: 10000, label: 'Professional' },
  { hours: 20000, label: 'Oblivion caster' },
];

function playTime(game) {
  const hours = Number(game.play_time);
  return Number.isFinite(hours) && hours > 0 ? hours : 0;
}

export function getGamerCardStats(games) {
  let hours = 0;
  let completed = 0;
  let playing = 0;
  let favoriteGame = null;
  const genres = new Map();
  const statuses = GAME_STATUS.map(status => ({ ...status, count: 0 }));

  for (const game of games) {
    const time = playTime(game);
    hours += time;
    if (game.status === 'completed') completed++;
    if (game.status === 'playing') playing++;
    if (time > 0 && (!favoriteGame || time > playTime(favoriteGame))) favoriteGame = game;
    for (const status of statuses) {
      if (status.key === game.status) status.count++;
    }
    const gameGenres = new Set(String(game.genre || '').split(',').map(genre => genre.trim()).filter(Boolean));
    for (const name of gameGenres) {
      const genre = genres.get(name) || { name, count: 0 };
      genre.count++;
      genres.set(name, genre);
    }
  }

  let dominant = null;
  for (const status of statuses) {
    if (status.count > (dominant?.count || 0)) dominant = status;
  }
  let favoriteGenre = null;
  for (const genre of genres.values()) {
    if (!favoriteGenre || genre.count > favoriteGenre.count) favoriteGenre = genre;
  }
  let level = PLAYER_TITLES[0].label;
  for (const title of PLAYER_TITLES) {
    if (hours >= title.hours) level = title.label;
  }

  return {
    total: games.length, hours, completed, playing, favoriteGame, favoriteGenre, dominant, level,
    completionRate: games.length ? Math.round(completed / games.length * 100) : 0,
  };
}

export function formatCardNumber(value) {
  return Number(value).toLocaleString('hr-HR', { maximumFractionDigits: 1 });
}

export async function exportGamerCard(svg) {
  // Izvoz koristi isti SVG kao pregled.
  const copy = svg.cloneNode(true);
  const { width, height } = svg.viewBox.baseVal;
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('width', width * 2);
  copy.setAttribute('height', height * 2);
  const source = new XMLSerializer().serializeToString(copy);
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Karticu nije moguće pripremiti.'));
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
  });
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Preglednik ne podržava izvoz slike.');
  context.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Slika nije spremljena. Pokušaj ponovno.'));
    }, 'image/png');
  });
}
