<template>
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Dostupne teme</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="theme in themeStore.availableThemes"
            :key="theme.name"
            class="rounded-lg"
          >
            <div
              @click="switchTheme(theme.name)"
              :data-theme="theme.name"
              class="card cursor-pointer hover:scale-105 transition-all duration-300 border-2 bg-base-100 shadow-md overflow-hidden"
              :class="{ 
                'border-primary shadow-xl scale-105 ring-2 ring-primary': themeStore.currentTheme === theme.name, 
                'border-base-300 hover:border-primary': themeStore.currentTheme !== theme.name 
              }"
            >
              <div class="card-body p-4">
                <div class="font-bold text-sm mb-3 text-base-content">{{ theme.label }}</div>
                
                <div class="flex gap-1 mb-2">
                  <div class="bg-primary rounded flex-1 h-8"></div>
                  <div class="bg-secondary rounded flex-1 h-8"></div>
                  <div class="bg-accent rounded flex-1 h-8"></div>
                </div>
  
                <div class="grid grid-cols-4 gap-1 mb-2">
                  <div class="bg-success rounded h-6 flex items-center justify-center text-xs text-success-content font-bold">OK</div>
                  <div class="bg-warning rounded h-6 flex items-center justify-center text-xs text-warning-content font-bold">!</div>
                  <div class="bg-error rounded h-6 flex items-center justify-center text-xs text-error-content font-bold">X</div>
                  <div class="bg-info rounded h-6 flex items-center justify-center text-xs text-info-content font-bold">i</div>
                </div>
  
                <div class="bg-base-200 rounded p-2 mb-2">
                  <div class="bg-base-300 rounded p-1 text-xs text-base-content text-center">
                    Background
                  </div>
                </div>
  
                <div class="flex gap-1">
                  <button class="btn btn-primary btn-xs flex-1">Primary</button>
                  <button class="btn btn-ghost btn-xs flex-1">Ghost</button>
                </div>
  
                <div v-if="themeStore.currentTheme === theme.name" class="mt-2 badge badge-primary badge-sm w-full">
                  ✓ Odabrano
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  

      <div class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span><strong>💡 Savjet:</strong> Tvoja tema se automatski sprema u pregledniku.</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useThemeStore } from '../stores/theme';
  
  const themeStore = useThemeStore();
  
  const getCurrentThemeLabel = () => {
    const theme = themeStore.availableThemes.find(t => t.name === themeStore.currentTheme);
    return theme ? theme.label : 'Nepoznata tema';
  };
  
  const getCurrentThemeDescription = () => {
    const theme = themeStore.availableThemes.find(t => t.name === themeStore.currentTheme);
    return theme ? theme.description : 'Nema opisa';
  };
  
  const switchTheme = (themeName) => {
    console.log('🎨 Klikam na temu:', themeName);
    themeStore.setTheme(themeName);
  };
  </script>
  