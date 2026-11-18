import { onMounted, onUnmounted, ref } from 'vue';

export function useStatusPlaceholder() {
  const placeholder = ref('Odaberi status');
  let media;

  function update() {
    placeholder.value = media.matches ? 'Odaberi' : 'Odaberi status';
  }

  onMounted(() => {
    media = window.matchMedia('(max-width: 639px)');
    update();
    media.addEventListener('change', update);
  });
  onUnmounted(() => media?.removeEventListener('change', update));

  return placeholder;
}
