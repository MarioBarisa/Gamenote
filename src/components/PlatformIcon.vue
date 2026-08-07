<template>
  <Icon :icon="iconName" class="platform-icon" />
</template>

<script>
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const PLATFORM_ICONS = {
  'playstation': 'simple-icons:playstation',
  'playstation 5': 'simple-icons:playstation5',
  'playstation 4': 'simple-icons:playstation4',
  'xbox': 'simple-icons:xbox',
  'xbox series x/s': 'simple-icons:xbox',
  'xbox one': 'simple-icons:xbox',
  'nintendo switch': 'simple-icons:nintendoswitch',
  'nintendo switch 2': 'simple-icons:nintendoswitch',
  'ios': 'simple-icons:apple',
  'ios/tvos': 'simple-icons:apple',
  'apple': 'simple-icons:apple',
  'android': 'simple-icons:android',
  'pc': 'mdi:desktop-classic',
  'steam': 'simple-icons:steam',
  'steamos': 'simple-icons:steam',
  'mac': 'simple-icons:apple',
  'macos': 'simple-icons:apple',
  'mac os': 'simple-icons:apple',
  'os x': 'simple-icons:apple',
  'linux': 'simple-icons:linux'
};

export default {
  name: 'PlatformIcon',
  components: { Icon },
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const iconName = computed(() => {
      if (!props.name) return 'game-icons:gamepad';
      const key = props.name.toLowerCase();
      return PLATFORM_ICONS[key] || 'game-icons:gamepad';
    });

    return { iconName };
  }
};
</script>