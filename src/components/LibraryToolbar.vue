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
                :placeholder="placeholder" aria-label="Pretraži igre" 
                class="input input-bordered input-sm sm:input-md w-full pl-10"
              />
            </div>
            
            <select class="select select-bordered sm:hidden" :class="$slots.controls ? 'flex-1 min-w-0 w-auto' : 'w-full'" aria-label="Sortiranje igara"
              :value="sortValue" @change="selectSort($event.target.value)">
              <option value="title:asc">Naziv (A-Ž)</option>
              <option value="title:desc">Naziv (Ž-A)</option>
              <option value="rating:desc">Ocjena (najviša)</option>
              <option value="rating:asc">Ocjena (najniža)</option>
              <option value="play_time:desc">Vrijeme igranja (najviše)</option>
              <option value="created_at:desc">Nedavno dodano</option>
            </select>
            <div class="dropdown dropdown-bottom sm:dropdown-end hidden sm:block w-full sm:w-auto">
              <label tabindex="0" class="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto" ref="sortLabel">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sortiraj
              </label>
              <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1" >
                <li><a @click="selectSort('title:asc')">Naziv (A-Ž)</a></li>
                <li><a @click="selectSort('title:desc')">Naziv (Ž-A)</a></li>
                <li><a @click="selectSort('rating:desc')">Ocjena (najviša)</a></li>
                <li><a @click="selectSort('rating:asc')">Ocjena (najniža)</a></li>
                <li><a @click="selectSort('play_time:desc')">Vrijeme igranja (najviše)</a></li>
                <li><a @click="selectSort('created_at:desc')">Nedavno dodano</a></li>
              </ul>
            </div>
            <slot name="controls" />
          </div>

          <slot />
        </div>
</template>
<script setup>
import { ref } from 'vue';
defineProps({ modelValue: { type: String, default: '' }, sortValue: { type: String, default: 'title:asc' }, placeholder: { type: String, default: 'Pretraži svoju zbirku...' } });
const emit = defineEmits(['update:modelValue', 'sort']);
const sortLabel = ref(null);
function selectSort(value) {
  emit('sort', value);
  sortLabel.value?.blur();
  document.activeElement?.blur();
}
</script>
