<template>
  <div class="flex flex-col items-center gap-2 text-center">
    <span :id="labelId" class="text-sm font-medium">{{ $t('mfa.authenticatorCode') }}</span>
    <label class="otp otp-sm max-w-full">
      <span v-for="index in 6" :key="index" aria-hidden="true"></span>
      <input
        ref="input"
        type="text"
        name="totp"
        :aria-labelledby="labelId"
        :aria-invalid="invalid || undefined"
        :autofocus="autofocus"
        autocomplete="one-time-code"
        inputmode="numeric"
        enterkeyhint="done"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        pattern="[0-9]{6}"
        maxlength="6"
        :value="model"
        :disabled="disabled"
        required
        @input="update"
        @change="update"
        @paste="paste"
      />
    </label>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, useId } from 'vue';

const props = defineProps({ disabled: Boolean, invalid: Boolean, autofocus: Boolean });
const model = defineModel({ type: String, default: '' });
const input = ref(null);
const labelId = useId();
const digits = value => value.replace(/[^0-9]/g, '');

function update(event) {
  const field = event.target;
  const offset = digits(field.value.slice(0, field.selectionStart)).length;
  const code = digits(field.value).slice(0, 6);
  if (field.value !== code) {
    field.value = code;
    field.setSelectionRange(offset, offset);
  }
  model.value = code;
}

function paste(event) {
  const value = event.clipboardData?.getData('text');
  if (!value) return;
  event.preventDefault();
  const field = event.target;
  const code = digits(value);
  if (!code) return;
  if (code.length >= 6) {
    field.value = code.slice(0, 6);
  } else {
    field.setRangeText(code.slice(0, 6 - field.value.length + field.selectionEnd - field.selectionStart),
      field.selectionStart, field.selectionEnd, 'end');
  }
  update(event);
}

onMounted(async () => {
  if (props.autofocus) {
    await nextTick();
    input.value?.focus();
  }
});
</script>
