// src/components/GameCard.vue
<template>
  <div class="card bg-base-200 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow">
    <figure v-if="game.image">
      <img :src="game.image" :alt="game.title" class="w-full h-48 object-cover" />
    </figure>
    <div class="card-body">
      <h2 class="card-title">
        {{ game.title }}
        <div v-if="game.currently_playing" class="badge badge-primary">Trenutno igram</div>
      </h2>
      <p>{{ game.platform }}</p>
      <div class="flex items-center mt-2">
        <div class="rating rating-sm">
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 1" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 2" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 3" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 4" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 5" disabled />
        </div>
        <span class="ml-2">{{ game.rating }}/5</span>
      </div>
      <div class="card-actions justify-end mt-2">
        <div class="badge badge-outline">{{ game.genre }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    game: {
      type: Object,
      required: true
    }
  }
};
</script>
