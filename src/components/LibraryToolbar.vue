<template>
        <div class="library-toolbar flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full bg-base-200 p-4 rounded-box shadow-sm">
          
          <div class="flex items-center gap-3 w-full md:w-auto" :class="$slots.controls ? 'flex-wrap sm:flex-nowrap md:flex-1 min-w-0' : 'flex-col sm:flex-row'">
            <div class="relative w-full sm:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" 
                :placeholder="placeholder || $t('libraryToolbar.searchYourLibrary')" :aria-label="$t('common.searchGamesLabel')"
                class="input input-bordered input-sm sm:input-md w-full pl-10"
              />
            </div>
            
            <select class="select select-bordered sm:hidden" :class="$slots.controls ? 'flex-1 min-w-0 w-auto' : 'w-full'" :aria-label="$t('libraryToolbar.sortGames')"
              :value="sortValue" @change="selectSort($event.target.value)">
              <option value="title:asc">{{ $t('libraryToolbar.nameAZ') }}</option>
              <option value="title:desc">{{ $t('libraryToolbar.nameZA') }}</option>
              <option value="rating:desc">{{ $t('libraryToolbar.ratingHighest') }}</option>
              <option value="rating:asc">{{ $t('libraryToolbar.ratingLowest') }}</option>
              <option value="play_time:desc">{{ $t('libraryToolbar.playtimeMost') }}</option>
              <option value="created_at:desc">{{ $t('libraryToolbar.recentlyAdded') }}</option>
            </select>
            <details ref="sortDropdown" class="dropdown dropdown-bottom sm:dropdown-end hidden sm:block w-full sm:w-auto">
              <summary class="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {{ $t('libraryToolbar.sort') }}
              </summary>
              <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1" >
                <li><button type="button" @click="selectSort('title:asc')">{{ $t('libraryToolbar.nameAZ') }}</button></li>
                <li><button type="button" @click="selectSort('title:desc')">{{ $t('libraryToolbar.nameZA') }}</button></li>
                <li><button type="button" @click="selectSort('rating:desc')">{{ $t('libraryToolbar.ratingHighest') }}</button></li>
                <li><button type="button" @click="selectSort('rating:asc')">{{ $t('libraryToolbar.ratingLowest') }}</button></li>
                <li><button type="button" @click="selectSort('play_time:desc')">{{ $t('libraryToolbar.playtimeMost') }}</button></li>
                <li><button type="button" @click="selectSort('created_at:desc')">{{ $t('libraryToolbar.recentlyAdded') }}</button></li>
              </ul>
            </details>
            <slot name="controls" />
          </div>

          <slot />
        </div>
</template>
<script setup>
import { useDropdown } from '../composables/useDropdown.js';
defineProps({ modelValue: { type: String, default: '' }, sortValue: { type: String, default: 'title:asc' }, placeholder: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue', 'sort']);
const { dropdown: sortDropdown, close: closeSort } = useDropdown();
function selectSort(value) {
  emit('sort', value);
  closeSort();
  sortDropdown.value?.querySelector('summary')?.focus();
}
</script>
