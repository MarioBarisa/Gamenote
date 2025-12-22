import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const availableThemes = [
    { name: 'light', label: '☀️ Light', description: 'Svijetla tema' },
    { name: 'dark', label: '🌙 Dark', description: 'Tamna tema' },
    { name: 'cupcake', label: '🧁 Cupcake', description: 'Slatka, pastelna tema' },
    { name: 'bumblebee', label: '🐝 Bumblebee', description: 'Žuta i crna' },
    { name: 'emerald', label: '💚 Emerald', description: 'Smaragdno zelena' },
    { name: 'corporate', label: '🏢 Corporate', description: 'Poslovni stil' },
    { name: 'synthwave', label: '🌆 Synthwave', description: 'Retro-futuristička' },
    { name: 'retro', label: '📼 Retro', description: '80-ih godina' },
    { name: 'cyberpunk', label: '🤖 Cyberpunk', description: 'Futuristička' },
    { name: 'valentine', label: '💕 Valentine', description: 'Ljubavna tema' },
    { name: 'halloween', label: '👻 Halloween', description: 'Strašna tema' },
    { name: 'garden', label: '🌻 Garden', description: 'Prirodna, vrtna tema' },
    { name: 'forest', label: '🌲 Forest', description: 'Šumska tema' },
    { name: 'aqua', label: '🌊 Aqua', description: 'Vodena tema' },
    { name: 'lofi', label: '🎧 Lofi', description: 'Lo-fi muzička tema' },
    { name: 'pastel', label: '🎨 Pastel', description: 'Pastelne boje' },
    { name: 'fantasy', label: '✨ Fantasy', description: 'Fantastična tema' },
    { name: 'wireframe', label: '📐 Wireframe', description: 'Minimalistička' },
    { name: 'black', label: '⚫ Black', description: 'AMOLED crna' },
    { name: 'luxury', label: '👑 Luxury', description: 'Luksuzna tema' },
    { name: 'dracula', label: '🧛 Dracula', description: 'Tamna, dramatična' },
    { name: 'cmyk', label: '🖨️ CMYK', description: 'Ispis stil' },
    { name: 'autumn', label: '🍂 Autumn', description: 'Jesenstva boje' },
    { name: 'business', label: '💼 Business', description: 'Poslovni stil' },
    { name: 'acid', label: '🔋 Acid', description: 'Neonska tema' },
    { name: 'lemonade', label: '🍋 Lemonade', description: 'Hladna, osvježavajuća' },
    { name: 'night', label: '🌃 Night', description: 'Noćna tema' },
    { name: 'coffee', label: '☕ Coffee', description: 'Topla, kava boja' },
    { name: 'winter', label: '❄️ Winter', description: 'Zimska tema' },
    { name: 'dim', label: '🌑 Dim', description: 'Slabo osvjetljenje' },
    { name: 'nord', label: '🏔️ Nord', description: 'Nordijska boja' },
    { name: 'sunset', label: '🌅 Sunset', description: 'Zalazak sunca' }
  ];

  // Default tema
  const currentTheme = ref('dark');

  // Funkcija za postavljanje teme
  const setTheme = (themeName) => {
    console.log('🔄 Postavljam temu:', themeName);
    
    const themeExists = availableThemes.some(t => t.name === themeName);
    if (!themeExists) {
      console.error('❌ Tema ne postoji:', themeName);
      return false;
    }

    currentTheme.value = themeName;
    applyTheme(themeName);
    
    console.log('✅ Tema postavljena:', themeName);
    return true;
  };

  // Primjeni temu na HTML element
  const applyTheme = (themeName) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeName);
      console.log('📍 HTML data-theme:', document.documentElement.getAttribute('data-theme'));
    }
  };

  // Inicijalizacija teme
  const initTheme = () => {
    console.log('🚀 Inicijalizacija teme:', currentTheme.value);
    applyTheme(currentTheme.value);
  };

  // Watch za promjene teme
  watch(currentTheme, (newTheme) => {
    console.log('👀 Watch detektirao promjenu teme:', newTheme);
    applyTheme(newTheme);
  });

  const getThemeByName = (name) => {
    return availableThemes.find(t => t.name === name);
  };

  return {
    availableThemes,
    currentTheme,
    setTheme,
    initTheme,
    getThemeByName
  };
}, {
  // ✅ KLJUČNA IZMJENA: Dodaj persist za localStorage
  persist: {
    key: 'gamenote-theme',
    storage: localStorage,
    paths: ['currentTheme'] // Samo spremi currentTheme
  }
});
