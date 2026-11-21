<template>
  <button type="button" class="btn btn-sm btn-outline shrink-0 gap-2 ml-auto" :aria-label="$t('comparisonShareButton.shareComparison')" :title="$t('comparisonShareButton.shareComparison')" @click="open = true">
    <svg class="size-4" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1m-2-4-3-3-3 3m3-3v10" /></svg>
    <span class="hidden sm:inline">{{ $t('comparisonShareButton.shareComparison') }}</span>
  </button>
  <AppModal v-if="open" :label="$t('comparisonShareButton.shareComparison')" @close="close">
    <div class="modal-box max-w-lg">
      <header class="flex justify-between items-center gap-3 mb-4"><h2 class="font-bold text-xl">{{ $t('comparisonShareButton.shareComparison') }}</h2><button type="button" class="btn btn-sm btn-circle btn-ghost" :aria-label="$t('comparisonShareButton.closeComparisonSharing')" @click="close">✕</button></header>
      <template v-if="allowed && link">
        <code :id="copyId" class="block rounded bg-base-300 px-3 py-2 text-xs sm:text-sm break-all select-all" :aria-label="$t('comparisonShareButton.comparisonLink')" v-on="nativeCommands ? { command: handleCommand } : {}">{{ link }}</code>
        <div class="flex gap-2 mt-4">
          <button type="button" class="btn btn-sm btn-primary" command="--copy" :commandfor="copyId" v-on="nativeCommands ? {} : { click: copy }">{{ $t('common.copyLink') }}</button>
          <a :href="link" target="_blank" rel="noopener" class="btn btn-sm btn-outline">{{ $t('common.openPreview') }}</a>
        </div>
        <p role="status" class="text-sm mt-3 min-h-5" :class="failed ? 'text-error' : 'text-success'">{{ feedback }}</p>
      </template>
      <template v-else><p class="text-sm">{{ $t('comparisonShareButton.bothGamenotesMustBeShared') }}</p><router-link to="/profile" class="btn btn-sm btn-primary mt-4">{{ $t('comparisonShareButton.sharingSettings') }}</router-link></template>
    </div>
  </AppModal>
</template>
<script setup>
import { t } from '../i18n/index.js';
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import AppModal from './AppModal.vue';
import { comparisonPath } from '../services/comparisonLink.js';
const props = defineProps({ left: String, right: String, allowed: Boolean });
const open = ref(false), feedback = ref(''), failed = ref(false);
const copyId = useId();
const nativeCommands = typeof window !== 'undefined' && 'CommandEvent' in window;
const link = computed(() => { const path = comparisonPath(props.left, props.right); return path ? 'https://gamenote.eu' + path : ''; });
let timer, lastMessage = '';
function close() { open.value = false; clearTimeout(timer); feedback.value = ''; }
function handleCommand(event) { if (event.command === '--copy') copy(); }
async function copy() {
  clearTimeout(timer);
  try { await navigator.clipboard.writeText(link.value); failed.value = false; }
  catch { failed.value = true; }
  if (!open.value) return;
  let message = failed.value ? t('comparisonShareButton.couldntCopyTheLinkCopy') : t('common.linkCopied');
  if (message === lastMessage) message += '\u00a0';
  feedback.value = lastMessage = message;
  timer = setTimeout(() => { feedback.value = ''; }, 3000);
}
watch([() => props.left, () => props.right], close);
onBeforeUnmount(() => clearTimeout(timer));
</script>
