<template>
  <div class="inline-flex flex-wrap items-center gap-2 text-sm">
    <label :for="selectId">{{ $t('language.label') }}</label>
    <select :id="selectId" class="select select-sm w-auto" :value="locale" @change="setLocale($event.target.value)">
      <option v-for="language in languages" :key="language.code" :value="language.code" :lang="language.code">
        {{ language.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useId } from 'vue';
import { languages, locale, setLocale } from '../i18n/index.js';

const selectId = useId();
</script>
