<template>
  <Teleport to="body">
    <dialog ref="dialog" class="modal" aria-labelledby="tcg-confirm-title" @close="finish(false)">
      <div class="modal-box">
        <div class="flex justify-between items-start gap-3">
          <h3 id="tcg-confirm-title" class="font-bold text-lg">Mobilni uređaj otkriven</h3>
          <button type="button" class="btn btn-sm btn-circle btn-ghost" aria-label="Zatvori TCG potvrdu" @click="dialog.close()">✕</button>
        </div>
        <p class="py-4 text-sm">TCG način koristi 3D animacije i sjene koje mogu usporiti pregledavanje ili uzrokovati probleme s prikazom na mobilnim uređajima.</p>
        <label class="flex items-center gap-2 mb-4"><input v-model="dismiss" type="checkbox" class="checkbox checkbox-sm" />Ne prikazuj više ovu poruku</label>
        <div class="flex justify-end"><button type="button" class="btn btn-primary" @click="confirm">Ipak omogući</button></div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Zatvori</button></form>
    </dialog>
  </Teleport>
</template>
<script setup>
import { onUnmounted, ref } from 'vue';
const dialog = ref(null);
const dismiss = ref(false);
let resolvePending;
function requestEnable() {
  if (!window.matchMedia('(hover: none), (pointer: coarse)').matches || localStorage.getItem('gamenote_tcg_warning_dismissed') === '1') return Promise.resolve(true);
  dismiss.value = false;
  dialog.value.showModal();
  return new Promise(resolve => { resolvePending = resolve; });
}
function finish(accepted) {
  resolvePending?.(accepted);
  resolvePending = null;
}
function confirm() {
  if (dismiss.value) localStorage.setItem('gamenote_tcg_warning_dismissed', '1');
  finish(true);
  dialog.value.close();
}
onUnmounted(() => finish(false));
defineExpose({ requestEnable });
</script>
