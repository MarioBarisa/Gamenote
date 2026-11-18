export function handleTabKeys(event) {
  const current = event.target.closest('[role="tab"]');
  if (!current) return;
  const list = current.closest('[role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('[role="tab"]:not(:disabled)')];
  let index = tabs.indexOf(current);
  if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[index].focus();
  tabs[index].click();
}
