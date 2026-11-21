import { t } from '../i18n/index.js';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const availableThemes = computed(() => [
    { name: 'light', label: '☀️ Light', description: t('theme.lightTheme') },
    { name: 'dark', label: '🌙 Dark', description: t('theme.darkTheme') },
    { name: 'cupcake', label: '🧁 Cupcake', description: t('theme.sweetPastelTheme') },
    { name: 'bumblebee', label: '🐝 Bumblebee', description: t('theme.yellowAndBlack') },
    { name: 'emerald', label: '💚 Emerald', description: t('theme.emeraldGreen') },
    { name: 'corporate', label: '🏢 Corporate', description: t('theme.businessStyle') },
    { name: 'synthwave', label: '🌆 Synthwave', description: t('theme.retroFuturistic') },
    { name: 'retro', label: '📼 Retro', description: t('theme.1980sStyle') },
    { name: 'cyberpunk', label: '🤖 Cyberpunk', description: t('theme.futuristic') },
    { name: 'valentine', label: '💕 Valentine', description: t('theme.loveTheme') },
    { name: 'halloween', label: '👻 Halloween', description: t('theme.spookyTheme') },
    { name: 'garden', label: '🌻 Garden', description: t('theme.naturalGardenTheme') },
    { name: 'forest', label: '🌲 Forest', description: t('theme.forestTheme') },
    { name: 'aqua', label: '🌊 Aqua', description: t('theme.waterTheme') },
    { name: 'lofi', label: '🎧 Lofi', description: t('theme.loFiMusicTheme') },
    { name: 'pastel', label: '🎨 Pastel', description: t('theme.pastelColors') },
    { name: 'fantasy', label: '✨ Fantasy', description: t('theme.fantasyTheme') },
    { name: 'wireframe', label: '📐 Wireframe', description: t('theme.minimalist') },
    { name: 'black', label: '⚫ Black', description: t('theme.amoledBlack') },
    { name: 'luxury', label: '👑 Luxury', description: t('theme.luxuryTheme') },
    { name: 'dracula', label: '🧛 Dracula', description: t('theme.darkAndDramatic') },
    { name: 'cmyk', label: '🖨️ CMYK', description: t('theme.printStyle') },
    { name: 'autumn', label: '🍂 Autumn', description: t('theme.autumnColors') },
    { name: 'business', label: '💼 Business', description: t('theme.businessStyle') },
    { name: 'acid', label: '🔋 Acid', description: t('theme.neonTheme') },
    { name: 'lemonade', label: '🍋 Lemonade', description: t('theme.coolAndRefreshing') },
    { name: 'night', label: '🌃 Night', description: t('theme.nightTheme') },
    { name: 'coffee', label: '☕ Coffee', description: t('theme.warmCoffeeTones') },
    { name: 'winter', label: '❄️ Winter', description: t('theme.winterTheme') },
    { name: 'dim', label: '🌑 Dim', description: t('theme.lowLight') },
    { name: 'nord', label: '🏔️ Nord', description: t('theme.nordicColors') },
    { name: 'sunset', label: '🌅 Sunset', description: t('theme.sunset') }
  ]);

  const currentTheme = ref('dark');
  const showNewsWidget = ref(false);
  const tcgMode = ref(false);
  // Funkcija za postavljanje teme
  const setTheme = (themeName) => {
    console.log('🔄 Postavljam temu:', themeName);
    
    const themeExists = availableThemes.value.some(t => t.name === themeName);
    if (!themeExists) {
      return false;
    }

    currentTheme.value = themeName;
    applyTheme(themeName);
    
    return true;
  };

  const applyTheme = (themeName) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  };


  const initTheme = () => {
    applyTheme(currentTheme.value);
  };

  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
  });

  const getThemeByName = (name) => {
    return availableThemes.value.find(t => t.name === name);
  };
  
  const setShowNewsWidget = (value) => {
    showNewsWidget.value = !!value;
  };

  const setTcgMode = (value) => {
    tcgMode.value = !!value;
  };

  return {
    availableThemes,
    currentTheme,
    showNewsWidget,
    tcgMode,
    setTheme,
    initTheme,
    getThemeByName,
    setShowNewsWidget,
    setTcgMode
  };
}, {
  persist: {
    key: 'gamenote-theme',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    paths: ['currentTheme', 'showNewsWidget', 'tcgMode'] // Samo spremi currentTheme
  }
});
