<!-- src/components/GameCard.vue -->
<template>
  <div class="game-card card bg-base-200 shadow-xl overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
    <figure class="relative h-48 overflow-hidden">
      <img 
        :src="game.image || 'https://placehold.co/600x400?text=No+Image'" 
        :alt="game.title" 
        class="w-full h-full object-cover"
      />
      <div v-if="game.currently_playing" class="absolute top-0 right-0 m-2">
        <div class="badge badge-primary p-3">Trenutno igram</div>
      </div>
    </figure>
    <div class="card-body p-4">
      <h2 class="card-title text-lg font-bold mb-1 line-clamp-1">{{ game.title }}</h2>
      
      <div class="flex items-center text-sm mb-2">
        <span class="badge badge-outline">{{ game.platform }}</span>
        <span v-if="game.genre" class="badge badge-outline ml-2">{{ truncateText(game.genre, 12) }}</span>
      </div>
      
      <div class="flex items-center mb-2">
        <div class="rating rating-sm">
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 1" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 2" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 3" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 4" disabled />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 5" disabled />
        </div>
        <span class="ml-2 text-sm opacity-70">{{ game.rating }}/5</span>
      </div>
      
      <div v-if="game.play_time" class="text-sm mb-2 opacity-70">
        <span>{{ game.play_time }} sati igranja</span>
      </div>
      
      <div v-if="game.achievement_percent !== undefined && game.achievement_percent !== null" class="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div 
          class="bg-primary h-2 rounded-full" 
          :style="{ width: `${game.achievement_percent}%` }"
          :title="`${game.achievement_percent}% achievementa`"
        ></div>
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
  },
  methods: {
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
  }
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
