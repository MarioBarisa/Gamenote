import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const availableThemes = [
    { name: 'light', label: '☀️ Light' },
    { name: 'dark', label: '🌙 Dark' },
    { name: 'cupcake', label: '🧁 Cupcake' },
    { name: 'bumblebee', label: '🐝 Bumblebee' },
    { name: 'emerald', label: '💚 Emerald' },
    { name: 'corporate', label: '🏢 Corporate' },
    { name: 'synthwave', label: '🌆 Synthwave' },
    { name: 'retro', label: '📼 Retro' },
    { name: 'cyberpunk', label: '🤖 Cyberpunk' },
    { name: 'valentine', label: '💕 Valentine' },
    { name: 'halloween', label: '👻 Halloween' },
    { name: 'garden', label: '🌻 Garden' },
    { name: 'forest', label: '🌲 Forest' },
    { name: 'aqua', label: '🌊 Aqua' },
    { name: 'lofi', label: '🎧 Lofi' },
    { name: 'pastel', label: '🎨 Pastel' },
    { name: 'fantasy', label: '✨ Fantasy' },
    { name: 'wireframe', label: '📐 Wireframe' },
    { name: 'black', label: '⚫ Black' },
    { name: 'luxury', label: '👑 Luxury' },
    { name: 'dracula', label: '🧛 Dracula' },
    { name: 'cmyk', label: '🖨️ CMYK' },
    { name: 'autumn', label: '🍂 Autumn' },
    { name: 'business', label: '💼 Business' },
    { name: 'acid', label: '🔋 Acid' },
    { name: 'lemonade', label: '🍋 Lemonade' },
    { name: 'night', label: '🌃 Night' },
    { name: 'coffee', label: '☕ Coffee' },
    { name: 'winter', label: '❄️ Winter' },
    { name: 'dim', label: '🌑 Dim' },
    { name: 'nord', label: '🏔️ Nord' },
    { name: 'sunset', label: '🌅 Sunset' }
  ];

  // Učitaj temu iz localStorage
  const savedTheme = localStorage.getItem('gamenote-theme') || 'dark';
  const currentTheme = ref(savedTheme);

  const setTheme = (themeName) => {
    console.log('🔄 Setting theme to:', themeName);
    
    const themeExists = availableThemes.some(t => t.name === themeName);
    if (!themeExists) {
      console.error('❌ Theme does not exist:', themeName);
      return;
    }

    // Postavi temu
    currentTheme.value = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('gamenote-theme', themeName);
    
    console.log('✅ Theme applied:', themeName);
    console.log('📍 HTML data-theme:', document.documentElement.getAttribute('data-theme'));
  };
  const initTheme = () => {
    console.log('🚀 Initializing theme:', currentTheme.value);
    setTheme(currentTheme.value);
  };

  return {
    availableThemes,
    currentTheme,
    setTheme,
    initTheme
  };
});
