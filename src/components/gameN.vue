<template>
  <div class="news-carousel bg-base-200 rounded-lg px-3 sm:px-8 py-3 sm:py-6">
    <h2 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Gaming Vijesti</h2>

    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="currentNews" class="relative">
      <button
        v-if="news.length > 1"
        @click="goToPrevious"
        class="absolute -left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10
               btn btn-circle btn-xs sm:btn-sm btn-ghost hover:btn-primary
               transition-all duration-300 bg-base-100/90 backdrop-blur-sm shadow-lg"
        aria-label="Prethodna vijest"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 sm:h-4 sm:w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        v-if="news.length > 1"
        @click="goToNext"
        class="absolute -right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10
               btn btn-circle btn-xs sm:btn-sm btn-ghost hover:btn-primary
               transition-all duration-300 bg-base-100/90 backdrop-blur-sm shadow-lg"
        aria-label="Sljedeća vijest"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 sm:h-4 sm:w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Kartica: optimizirana za mobitel -->
      <div class="w-full px-6 sm:px-8">
        <div
          @click="openNewsDetail(currentNews)"
          class="cursor-pointer hover:bg-base-300 rounded-xl
                 transition-all duration-300
                 w-full
                 h-[160px] sm:h-[200px]
                 px-3 sm:px-6 py-3 sm:py-4
                 flex items-center"
        >
          <div class="flex gap-3 sm:gap-4 w-full h-full">
            <!-- Slika (manja na mobitelu) -->
            <div class="flex-shrink-0">
              <div class="relative w-16 h-16 sm:w-24 sm:h-24 bg-base-300 rounded-lg overflow-hidden">
                <img
                  v-if="!imageError[currentIndex]"
                  :src="getImageUrl(currentNews)"
                  :alt="currentNews.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError(currentIndex)"
                  loading="lazy"
                />
                <!-- Fallback ikona -->
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-base-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 sm:h-10 sm:w-10 opacity-30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sadržaj - bolji spacing na mobitelu -->
            <div class="flex-1 min-w-0 flex flex-col justify-between h-full overflow-hidden">
              <div class="flex-1 overflow-hidden">
                <h3
                  class="font-bold text-sm sm:text-lg mb-1 leading-tight
                         line-clamp-2"
                >
                  {{ currentNews.title || 'Bez naslova' }}
                </h3>
                <p
                  class="text-xs sm:text-sm opacity-70 leading-snug
                         line-clamp-2 sm:line-clamp-3"
                >
                  {{ stripHtml(currentNews.description) }}
                </p>
              </div>

              <div
                class="flex justify-between items-center text-xs opacity-60 gap-2 flex-shrink-0 mt-1 sm:mt-2"
              >
                <span
                  class="badge badge-xs sm:badge-sm badge-outline truncate max-w-[100px] sm:max-w-[200px]"
                >
                  {{ currentNews.source || 'Gaming News' }}
                </span>
                <span class="whitespace-nowrap text-[10px] sm:text-xs">
                  {{ formatDate(currentNews.pubDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Indikatori -->
      <div class="flex justify-center mt-2 sm:mt-4 gap-1.5 sm:gap-2" v-if="news.length > 1">
        <button
          v-for="(_, index) in news"
          :key="index"
          :class="[
            'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125',
            index === currentIndex ? 'bg-primary w-6 sm:w-8' : 'bg-base-content opacity-30'
          ]"
          @click="goToSlide(index)"
          :aria-label="`Idi na vijest ${index + 1}`"
        ></button>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="alert alert-error shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ error }}</span>
      </div>
      <div class="flex flex-wrap gap-2 justify-center mt-4">
        <button @click="retryFetch" class="btn btn-sm btn-primary" :disabled="isRetrying">
          <span v-if="isRetrying" class="loading loading-spinner loading-xs"></span>
          {{ isRetrying ? 'Učitavanje...' : 'Pokušaj ponovno' }}
        </button>
        <button @click="loadMockNews" class="btn btn-sm btn-secondary">
          Prikaži demo vijesti
        </button>
      </div>
    </div>

    <div v-else class="text-center py-8 opacity-70">
      <div class="flex flex-col items-center gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <p>Nema dostupnih vijesti</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <button @click="retryFetch" class="btn btn-sm btn-primary">
            Osvježi
          </button>
          <button @click="loadMockNews" class="btn btn-sm btn-secondary">
            Demo vijesti
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGamesApi } from '../services/gamesApi';

export default {
  setup() {
    const router = useRouter();
    const gamesApi = useGamesApi();

    const news = ref([]);
    const currentIndex = ref(0);
    const currentNews = ref(null);
    const intervalId = ref(null);
    const isRetrying = ref(false);
    const imageError = ref({});

    const loading = computed(() => gamesApi.isLoading.value);
    const error = computed(() => gamesApi.error.value);

    const fetchNews = async () => {
      try {
        const fetchedNews = await gamesApi.getGameNews();
        if (fetchedNews && fetchedNews.length > 0) {
          news.value = fetchedNews;
          currentIndex.value = 0;
          currentNews.value = fetchedNews[0];
          imageError.value = {};
          startCarousel();
          return true;
        } else {
          loadMockNews();
          return false;
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        return false;
      }
    };

    const retryFetch = async () => {
      if (isRetrying.value) return;
      isRetrying.value = true;
      stopCarousel();
      try {
        const success = await fetchNews();
        if (!success) {
          setTimeout(() => loadMockNews(), 1000);
        }
      } finally {
        isRetrying.value = false;
      }
    };

    const loadMockNews = () => {
      stopCarousel();
      const mockNews = gamesApi.getMockGameNews();
      news.value = mockNews;
      currentIndex.value = 0;
      currentNews.value = mockNews[0];
      imageError.value = {};
      startCarousel();
    };

    const startCarousel = () => {
      stopCarousel();
      if (news.value.length > 1) {
        intervalId.value = setInterval(() => {
          currentIndex.value = (currentIndex.value + 1) % news.value.length;
          currentNews.value = news.value[currentIndex.value];
        }, 5000);
      }
    };

    const stopCarousel = () => {
      if (intervalId.value) {
        clearInterval(intervalId.value);
        intervalId.value = null;
      }
    };

    const openNewsDetail = (newsItem) => {
      if (!newsItem) return;
      stopCarousel();

      if (newsItem.link && newsItem.link !== '#') {
        window.open(newsItem.link, '_blank', 'noopener,noreferrer');
        setTimeout(() => startCarousel(), 300);
      } else {
        try {
          localStorage.setItem('selectedNews', JSON.stringify(newsItem));
          const slug = (newsItem.title || 'news')
            .substring(0, 50)
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();
          router.push(`/news/${slug}`);
        } catch (err) {
          console.error('Error saving news:', err);
        }
      }
    };

    const stripHtml = (html) => {
      if (!html) return 'Nema dostupnog opisa';
      try {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || '';
        return text.trim() || 'Nema dostupnog opisa';
      } catch (e) {
        return 'Nema dostupnog opisa';
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('hr-HR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return '';
      }
    };

    const getImageUrl = (newsItem) => {
      return newsItem?.enclosure?.link || newsItem?.thumbnail || '';
    };

    const handleImageError = (index) => {
      imageError.value[index] = true;
    };

    const goToSlide = (index) => {
      if (index < 0 || index >= news.value.length) return;
      currentIndex.value = index;
      currentNews.value = news.value[index];
      startCarousel();
    };

    const goToNext = () => {
      const nextIndex = (currentIndex.value + 1) % news.value.length;
      goToSlide(nextIndex);
    };

    const goToPrevious = () => {
      const prevIndex =
        currentIndex.value === 0 ? news.value.length - 1 : currentIndex.value - 1;
      goToSlide(prevIndex);
    };

    onMounted(async () => {
      await fetchNews();
    });

    onUnmounted(() => {
      stopCarousel();
    });

    return {
      loading,
      error,
      currentNews,
      currentIndex,
      news,
      isRetrying,
      imageError,
      openNewsDetail,
      stripHtml,
      formatDate,
      getImageUrl,
      handleImageError,
      goToSlide,
      goToNext,
      goToPrevious,
      retryFetch,
      loadMockNews
    };
  }
};
</script>

<style scoped>
.news-carousel {
  width: 100%;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

img {
  transition: opacity 0.3s ease-in-out;
}

img[src=''] {
  opacity: 0;
}
</style>
