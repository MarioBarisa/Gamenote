import { t } from '../i18n/index.js';
import { getGamerCardStats } from './gamerCard.js';

export function getProfileAchievements(games, totpEnabled = false) {
  const stats = getGamerCardStats(games);
  let topRated = 0;
  for (const game of games) {
    if (Number(game.rating) === 5) topRated++;
  }

  const achievements = [
    { id: 'beginner', title: 'Beginner', description: t('profileAchievements.addYourFirstGame'), icon: 'banner', iconColor: 'text-success', unlocked: stats.total >= 1 },
    { id: 'collector', title: t('profileAchievements.collector'), description: t('profileAchievements.gamesMilestone', { threshold: 50 }), icon: 'bookmark', iconColor: 'text-accent', unlocked: stats.total >= 50 },
    { id: 'completion', title: 'Completion master', description: t('profileAchievements.complete25Games'), icon: 'check', iconColor: 'text-emerald-600', unlocked: stats.completed >= 25 },
    { id: 'speed', title: t('profileAchievements.speedrunner'), description: t('profileAchievements.hoursMilestone', { threshold: 100 }), icon: 'lightning', iconColor: 'text-yellow-600', unlocked: stats.hours >= 100 },
    { id: 'hardcore', title: 'Hardcore', description: t('profileAchievements.hoursMilestone', { threshold: 1000 }), icon: 'fire', iconColor: 'text-red-500', unlocked: stats.hours >= 1000 },
    { id: 'legend', title: 'Legend', description: t('profileAchievements.hoursMilestone', { threshold: 3000 }), icon: 'crown', iconColor: 'text-violet-500', unlocked: stats.hours >= 3000 },
    { id: 'goty', title: 'GOTY enjoyer', description: t('profileAchievements.topRatingsMilestone'), icon: 'medal', iconColor: 'text-amber-300', unlocked: topRated >= 10 },
    { id: 'totp', title: t('mfa.achievement'), description: t('mfa.achievementHint'), icon: 'shield-star', iconColor: 'text-info', unlocked: totpEnabled },
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
