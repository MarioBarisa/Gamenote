import { getGamerCardStats } from './gamerCard.js';

export function getProfileAchievements(games) {
  const stats = getGamerCardStats(games);
  let topRated = 0;
  for (const game of games) {
    if (Number(game.rating) === 5) topRated++;
  }

  const achievements = [
    { id: 'beginner', title: 'Beginner', description: 'Dodaj prvu igru', icon: 'banner', iconColor: 'text-success', unlocked: stats.total >= 1 },
    { id: 'collector', title: 'Kolekcionar', description: '50+ igara', icon: 'bookmark', iconColor: 'text-accent', unlocked: stats.total >= 50 },
    { id: 'completion', title: 'Completion master', description: 'Završi 25 igara', icon: 'check', iconColor: 'text-emerald-600', unlocked: stats.completed >= 25 },
    { id: 'speed', title: 'Brzinski', description: '100+ sati', icon: 'lightning', iconColor: 'text-yellow-600', unlocked: stats.hours >= 100 },
    { id: 'hardcore', title: 'Hardcore', description: '1000+ sati', icon: 'fire', iconColor: 'text-red-500', unlocked: stats.hours >= 1000 },
    { id: 'legend', title: 'Legend', description: '3000+ sati', icon: 'crown', iconColor: 'text-violet-500', unlocked: stats.hours >= 3000 },
    { id: 'goty', title: 'GOTY enjoyer', description: '10+ igara s ocjenom 5/5', icon: 'medal', iconColor: 'text-amber-300', unlocked: topRated >= 10 },
  ];

  let platinumUnlocked = true;
  for (const achievement of achievements) {
    if (!achievement.unlocked) {
      platinumUnlocked = false;
      break;
    }
  }
  achievements.splice(6, 0, {
    id: 'platinum', title: 'Gamenote Platinum', description: '100% Gamenote Completion',
    icon: 'trophy', iconColor: 'text-slate-400', unlocked: platinumUnlocked,
  });
  return achievements;
}
