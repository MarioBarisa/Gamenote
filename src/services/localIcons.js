import { addIcon } from '@iconify/vue';
import icons from '../assets/icons/ui.json';

for (const [name, icon] of Object.entries(icons)) addIcon(name, icon);
