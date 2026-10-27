<template>
  <div class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">Ocjena</span>
      <div class="flex items-center gap-1">
        <div class="rating rating-sm sm:rating-md">
          <input type="radio" :name="id + '-rating'" class="rating-hidden" :checked="!extras.rating" :disabled="disabled" :aria-label="`Bez ocjene za ${name}`" @change="extras.rating = 0" />
          <input v-for="star in 5" :key="star" type="radio" :name="id + '-rating'" class="mask mask-star-2 bg-orange-400" :checked="extras.rating === star" :disabled="disabled" :aria-label="`${star} od 5 za ${name}`" @change="extras.rating = star" />
        </div>
        <button v-if="extras.rating" type="button" class="btn btn-ghost btn-xs px-1" :disabled="disabled" :aria-label="`Ukloni ocjenu za ${name}`" @click="extras.rating = 0">×</button>
      </div>
    </div>
    <label class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">Status</span>
      <select v-model="extras.status" class="select select-sm select-bordered w-full" :disabled="disabled" :aria-label="`Status za ${name}`" @change="extras.statusAutomatic = false">
        <option v-for="status in statusOptions" :key="status.key" :value="status.key">{{ status.label }}</option>
      </select>
    </label>
    <label class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">Grupa</span>
      <select v-model="extras.groupId" class="select select-sm select-bordered w-full" :disabled="disabled" :aria-label="`Grupa za ${name}`">
        <option :value="null">Bez grupe</option>
        <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
      </select>
    </label>
    <label class="flex flex-col gap-1 min-w-0">
      <span class="text-xs opacity-60 font-medium">Bilješka</span>
      <input v-model="extras.notes" type="text" class="input input-sm input-bordered w-full" placeholder="Opcionalno..." :disabled="disabled" :aria-label="`Bilješka za ${name}`" maxlength="10000" />
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
