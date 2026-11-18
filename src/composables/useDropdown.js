import { onMounted, onUnmounted, ref, watchEffect } from 'vue';

export function useDropdown() {
  const dropdown = ref(null);
  function close() {
    if (dropdown.value) dropdown.value.open = false;
  }
  function outside(event) {
    if (!dropdown.value?.contains(event.target)) close();
  }
  function keydown(event) {
    if (event.key !== 'Escape' || !dropdown.value?.open) return;
    event.preventDefault();
    event.stopPropagation();
    close();
    dropdown.value.querySelector('summary')?.focus();
  }
  onMounted(() => {
    document.addEventListener('pointerdown', outside);
  });
  watchEffect(onCleanup => {
    const element = dropdown.value;
    if (!element) return;
    element.addEventListener('keydown', keydown);
    onCleanup(() => element.removeEventListener('keydown', keydown));
  }, { flush: 'post' });
  onUnmounted(() => {
    document.removeEventListener('pointerdown', outside);
  });
  return { dropdown, close };
}
