export function hasAllAchievements(earned, total) {
  return Number.isFinite(earned) && Number.isFinite(total) && total > 0 && earned === total;
}

export function importerStatus(extras, earned, total) {
  const completed = hasAllAchievements(earned, total);
  if (extras.statusAutomatic === true || !extras.status) return completed ? 'completed' : 'backlog';
  if (extras.status === 'completed' && !completed) return 'backlog';
  return extras.status;
}
