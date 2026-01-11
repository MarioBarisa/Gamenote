import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCardSizeStore = defineStore('cardSize', () => {
  const cardSize = ref('medium');

  // localStorage pri inicijalizaciji
  const initCardSize = () => {
    const saved = localStorage.getItem('gamenote_card_size');
    if (saved && ['small', 'medium', 'large'].includes(saved)) {
      cardSize.value = saved;
    } else {
      // zadana vrijednost ->  'medium' za sve ekrane
      cardSize.value = 'medium';
      saveCardSize(cardSize.value);
    }
  };

  // save localStorage
  const saveCardSize = (size) => {
    if (['small', 'medium', 'large'].includes(size)) {
      cardSize.value = size;
      localStorage.setItem('gamenote_card_size', size);
    }
  };

  // Postavke za svaku veličinu - mobilne i desktop
  const getSizeConfig = (size) => {
    const configs = {
      small: {
        container: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7',
        gap: 'gap-2 sm:gap-3',
        imageHeight: 'h-24 sm:h-28 md:h-32',
        titleSize: 'text-xs sm:text-sm',
        badgeSize: 'text-[8px] sm:text-[10px]',
        padding: 'p-1 sm:p-1.5',
        cardBody: 'p-1 sm:p-1.5'
      },
      medium: {
        container: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        gap: 'gap-3 sm:gap-4 md:gap-6',
        imageHeight: 'h-36 sm:h-40 md:h-48',
        titleSize: 'text-sm sm:text-base md:text-lg',
        badgeSize: 'text-xs sm:text-sm',
        padding: 'p-2 sm:p-3 md:p-4',
        cardBody: 'p-2 sm:p-3 md:p-4'
      },
      large: {
        container: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        gap: 'gap-4 sm:gap-6 md:gap-8',
        imageHeight: 'h-48 sm:h-56 md:h-64',
        titleSize: 'text-base sm:text-lg md:text-xl',
        badgeSize: 'text-sm sm:text-base',
        padding: 'p-3 sm:p-4 md:p-6',
        cardBody: 'p-3 sm:p-4 md:p-6'
      }
    };

    return configs[size] || configs.medium;
  };

  return {
    cardSize,
    initCardSize,
    saveCardSize,
    getSizeConfig
  };
});
