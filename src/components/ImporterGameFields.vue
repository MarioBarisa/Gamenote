<template>
  <div class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">{{ $t('common.rating') }}</span>
      <div class="flex items-center gap-1">
        <div class="rating rating-sm sm:rating-md">
          <input type="radio" :name="id + '-rating'" class="rating-hidden" :checked="!extras.rating" :disabled="disabled" :aria-label="$t('importerGameFields.noRatingFor', [name])" @change="extras.rating = 0" />
          <input v-for="star in 5" :key="star" type="radio" :name="id + '-rating'" class="mask mask-star-2 bg-orange-400" :checked="extras.rating === star" :disabled="disabled" :aria-label="$t('importerGameFields.outOf5For', [star, name])" @change="extras.rating = star" />
        </div>
        <button v-if="extras.rating" type="button" class="btn btn-ghost btn-xs px-1" :disabled="disabled" :aria-label="$t('importerGameFields.clearRatingFor', [name])" @click="extras.rating = 0">×</button>
      </div>
    </div>
    <label class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">{{ $t('common.status') }}</span>
      <select v-model="extras.status" class="select select-sm select-bordered w-full" :disabled="disabled" :aria-label="$t('importerGameFields.statusFor', [name])" @change="extras.statusAutomatic = false">
        <option v-for="status in statusOptions" :key="status.key" :value="status.key">{{ status.label }}</option>
      </select>
    </label>
    <label class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">{{ $t('common.group') }}</span>
      <select v-model="extras.groupId" class="select select-sm select-bordered w-full" :disabled="disabled" :aria-label="$t('importerGameFields.groupFor', [name])">
        <option :value="null">{{ $t('importerGameFields.noGroup') }}</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
      </select>
    </label>
    <label class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">{{ $t('importerGameFields.note') }}</span>
      <input v-model="extras.notes" type="text" class="input input-sm input-bordered w-full" :placeholder="$t('importerGameFields.optional')" :disabled="disabled" :aria-label="$t('importerGameFields.noteFor', [name])" maxlength="10000" />
    </label>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  extras: { type: Object, required: true },
  statusOptions: { type: Array, required: true },
  groups: { type: Array, default: () => [] },
  disabled: Boolean,
});
</script>
