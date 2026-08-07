<template>
  <Icon :icon="iconName" :class="className" :title="matchedTitle || undefined" />
</template>

<script>
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const GENRE_ICONS = [
  { keys: ['action'], icon: 'game-icons:boxing-glove' },
  { keys: ['adventure'], icon: 'icons8:adventures' },
  { keys: ['rpg', 'role-playing', 'roleplaying'], icon: 'streamline-freehand:role-playing-games-icon-weapon-equipment-crate-chest' },
  { keys: ['racing'], icon: 'at-icons:racing-circuit' },
  { keys: ['strategy'], icon: 'mdi:strategy' },
  { keys: ['arcade'], icon: 'game-icons:slot-machine' },
  { keys: ['casual'], icon: 'game-icons:gamepad' },
  { keys: ['gacha'], icon: 'game-icons:slot-machine' },
  { keys: ['shooter'], icon: 'game-icons:ray-gun' },
  { keys: ['fighting', 'fighting game'], icon: 'game-icons:fist' },
  { keys: ['sport', 'sports'], icon: 'fluent:sport-24-filled' },
  { keys: ['simulation', 'simulator'], icon: 'game-icons:vr-headset' },
  { keys: ['puzzle'], icon: 'mdi:puzzle-outline' },
  { keys: ['platform', 'platformer'], icon: 'game-icons:running-shoe' },
  { keys: ['indie'], icon: 'mdi:lightbulb-on-outline' },
  { keys: ['horror'], icon: 'game-icons:desert-skull' },
  { keys: ['mmo', 'massively multiplayer'], icon: 'game-icons:grouped-drops' },
  { keys: ['moba'], icon: 'game-icons:chess-queen' },
  { keys: ['card'], icon: 'game-icons:card-joker' },
  { keys: ['board'], icon: 'game-icons:castle' },
  { keys: ['educational'], icon: 'game-icons:open-book' },
  { keys: ['music'], icon: 'game-icons:guitar-head' },
  { keys: ['party'], icon: 'game-icons:party-popper' },
  { keys: ['first-person'], icon: 'game-icons:revolver' },
  { keys: ['logic'], icon: 'game-icons:abacus' },
  { keys: ['trivia'], icon: 'mdi:help-circle' },
  { keys: ['family'], icon: 'mdi:account-group' }
];

const FALLBACK_ICON = 'game-icons:gamepad';

export default {
  name: 'GenreIcon',
  components: { Icon },
  props: {
    genre: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const iconName = computed(() => {
      if (!props.genre) return FALLBACK_ICON;
      const genre = props.genre.toLowerCase();
      for (const entry of GENRE_ICONS) {
        if (entry.keys.some(key => genre.includes(key))) {
          return entry.icon;
        }
      }
      return FALLBACK_ICON;
    });

    const matchedTitle = computed(() => {
      const genre = props.genre
        .split(',')
        .map(g => g.trim())
        .filter(Boolean)[0];
      return genre || undefined;
    });

    return { iconName, matchedTitle };
  }
};
</script>