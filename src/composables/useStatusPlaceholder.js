import { t } from '../i18n/index.js';
import { computed, onMounted, onUnmounted, ref } from 'vue';

export function useStatusPlaceholder() {
  const compact = ref(false);
  let media;

  function update() {
    compact.value = media.matches;
  }

  onMounted(() => {
    media = window.matchMedia('(max-width: 639px)');
    update();
    media.addEventListener('change', update);
  });
  onUnmounted(() => media?.removeEventListener('change', update));

  return computed(() => compact.value ? t('common.choose') : t('useStatusPlaceholder.chooseAStatus'));
}
