<template>
  <a ref="trigger" :href="href" target="_blank" rel="noopener noreferrer" @click="openDialog"
    class="btn btn-primary btn-sm h-auto min-h-8 max-w-full w-fit gap-2 py-1.5 whitespace-normal text-left" aria-label="Podrži me i daljnji razvoj Gamenotea putem Ko-fija">
    <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 7h14v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V7Zm14 2h2a2.5 2.5 0 0 1 0 5h-2M6 3v1m4-1v1m4-1v1" />
      <path d="M10 16s-2.5-1.4-2.5-3a1.4 1.4 0 0 1 2.5-.8 1.4 1.4 0 0 1 2.5.8c0 1.6-2.5 3-2.5 3Z" fill="currentColor" stroke="none" />
    </svg>
    <span>Podrži me i daljnji razvoj Gamenotea</span>
  </a>
  <dialog ref="dialog" class="modal" aria-labelledby="kofi-dialog-title" @close="onClose" @click.self="dialog.close()">
    <div class="modal-box w-[min(95vw,500px)] max-w-none p-4 sm:p-5">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 id="kofi-dialog-title" class="text-lg font-bold">Podrži Gamenote na Ko-fiju</h2>
        <button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Zatvori" @click="dialog.close()">✕</button>
      </div>
      <iframe v-if="isOpen" :src="widgetUrl" title="Ko-fi donacijski obrazac" class="w-full h-[min(680px,70dvh)] rounded-box bg-base-100 border border-base-300" allow="payment" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <p class="text-sm text-base-content/70 mt-3">Ako se obrazac ne prikazuje, <a :href="href" target="_blank" rel="noopener noreferrer" class="link link-primary">otvori Ko-fi stranicu</a>.</p>
    </div>
  </dialog>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({ href: { type: String, required: true } })
const dialog = ref(null)
const trigger = ref(null)
const isOpen = ref(false)
const widgetUrl = computed(() => `${props.href.replace(/\/+$/, '')}/?hidefeed=true&widget=true&embed=true`)

function openDialog(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (!dialog.value || typeof dialog.value.showModal !== 'function') return
  event.preventDefault()
  if (dialog.value.open) return
  isOpen.value = true
  dialog.value.showModal()
}

function onClose() {
  isOpen.value = false
  nextTick(() => trigger.value?.focus())
}
</script>
