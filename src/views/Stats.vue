<!-- src/views/Stats.vue -->
<template>
  <div class="stats-page">
    <!-- NASLOV -->
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6">Gamenote Statistika</h1>

    <!-- LOADING SKELETON -->
    <div v-if="loading" class="space-y-4">
      <div class="h-32 skeleton w-full"></div>
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <div v-for="i in 6" :key="i" class="h-20 skeleton"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="h-64 skeleton"></div>
        <div class="h-64 skeleton"></div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="games.length === 0" class="hero bg-base-200 rounded-box py-16">
      <div class="hero-content text-center">
        <div>
          <svg class="w-16 h-16 mx-auto opacity-30 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"/>
          </svg>
          <h2 class="text-xl font-bold mb-2">Još nema podataka</h2>
          <p class="opacity-70 mb-4">Dodaj svoje prve igre kako bi vidio statistiku i evoluciju igranja.</p>
          <button class="btn btn-primary" @click="router.push('/add-game')">Dodaj igru</button>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- VREMENSKA CRTA — TREND GRAF -->
      <div class="card bg-base-200 shadow-xl mb-4 sm:mb-6">
        <div class="card-body p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 class="card-title text-lg sm:text-xl">Tvoji Gamenote kroz vrijeme</h2>
          </div>

          <div class="flex flex-row flex-wrap items-center gap-2 mb-3">
            <div class="flex gap-2 flex-1 sm:flex-none items-center min-w-0">
              <select v-model="selectedYear" class="select select-bordered flex-1 sm:flex-none sm:select-sm min-h-11 sm:min-h-0 text-sm">
                <option :value="null">Sve godine</option>
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}.</option>
              </select>
              <select v-model="selectedMonth" class="select select-bordered flex-1 sm:flex-none sm:select-sm min-h-11 sm:min-h-0 text-sm" :disabled="selectedYear === null">
                <option :value="null">Svi mjeseci</option>
                <option v-for="(m, idx) in HR_MONTHS" :key="m" :value="idx + 1">{{ m }}</option>
              </select>
              <button v-if="selectedYear !== null || selectedMonth !== null || selectedBucket" class="btn btn-error btn-sm shadow-sm shrink-0 sm:px-4 px-2.5" @click="clearTimelineFilters" aria-label="Poništi filter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
                <span class="hidden sm:inline">Poništi</span>
              </button>
            </div>
          </div>

          <div class="relative h-52 sm:h-40 lg:h-44">
            <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none px-4" :style="{ opacity: watermarkOpacity }">
              <img :src="bannerUrl" alt="" class="max-w-[85%] sm:max-w-[75%] max-h-[45%] sm:max-h-[50%] object-contain" :class="watermarkClass" />
            </div>
            <canvas ref="timelineRef" class="relative z-10 bg-transparent"></canvas>
          </div>


        </div>
      </div>

      <!-- SAŽETAK STATS -->
      <div class="stats grid grid-cols-2 grid-flow-row sm:flex shadow w-full mb-4 sm:mb-6 bg-base-200 text-center">
        <div class="stat py-3">
          <div class="stat-title text-xs">Igara u razdoblju</div>
          <div class="stat-value text-2xl sm:text-3xl text-primary">{{ scopedStats.total }}</div>
          <div v-if="selectedBucket" class="stat-desc">od ukupno {{ games.length }}</div>
        </div>
        <div class="stat py-3">
          <div class="stat-title text-xs">Ukupno sati</div>
          <div class="stat-value text-2xl sm:text-3xl">{{ formatHours(scopedStats.hours) }}</div>
          <div class="stat-desc">≈ {{ Math.floor(scopedStats.hours / 24) }} dana igranja</div>
        </div>
        <div class="stat py-3">
          <div class="stat-title text-xs">Prosječna ocjena</div>
          <div class="stat-value text-2xl sm:text-3xl flex items-center justify-center gap-1">
            {{ scopedStats.avgRating }}
            <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          </div>
          <div class="stat-desc">{{ scopedStats.ratedCount }} ocijenjenih</div>
        </div>
        <div class="stat py-3">
          <div class="stat-title text-xs mb-1">Završeno</div>
          <div class="flex items-center justify-center">
            <div class="radial-progress text-success" :style="{ '--value': scopedStats.completionRate, '--size': '3.4rem', '--thickness': '0.35rem' }" role="progressbar">
              <span class="text-xs font-bold">{{ scopedStats.completionRate }}%</span>
            </div>
          </div>
          <div class="stat-desc">{{ scopedStats.completed }} igara</div>
        </div>
        <div class="stat py-3">
          <div class="stat-title text-xs">Trenutno igram</div>
          <div class="stat-value text-2xl sm:text-3xl text-info">{{ scopedStats.playing }}</div>
        </div>
        <div class="stat py-3">
          <div class="stat-title text-xs">Savršene igre</div>
          <div class="stat-value text-2xl sm:text-3xl text-warning">{{ scopedStats.perfect }}</div>
          <div class="stat-desc">100% dovršene</div>
        </div>
      </div>

      <!-- GRAFikonI -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body p-4 sm:p-6">
            <h2 class="card-title text-lg">Rast biblioteke &amp; završene igre</h2>
            <div class="relative h-64 sm:h-72">
              <canvas ref="evolutionRef"></canvas>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body p-4 sm:p-6">
            <h2 class="card-title text-lg">Statusi igara</h2>
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <div class="relative h-52 w-52 shrink-0">
                <canvas ref="statusRef"></canvas>
              </div>
              <ul class="text-sm space-y-1.5 w-full">
                <li v-for="s in statusBreakdown" :key="s.key" class="flex items-center gap-2">
                  <span class="inline-block w-3 h-3 rounded-sm" :style="{ background: s.color }"></span>
                  <span class="flex-grow">{{ s.label }}</span>
                  <span class="font-semibold">{{ s.count }}</span>
                  <span class="opacity-50 text-xs w-10 text-right">{{ games.length ? Math.round(s.count / games.length * 100) : 0 }}%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body p-4 sm:p-6">
            <div class="flex items-center justify-between gap-2">
              <h2 class="card-title text-lg">Žanrovi</h2>
              <div class="tabs tabs-box tabs-sm">
                <button role="tab" class="tab" :class="{ 'tab-active': genreMode === 'count' }" @click="genreMode = 'count'">Broj</button>
                <button role="tab" class="tab" :class="{ 'tab-active': genreMode === 'hours' }" @click="genreMode = 'hours'">Sati</button>
              </div>
            </div>
            <div class="relative h-64 sm:h-72">
              <canvas ref="genreRef"></canvas>
            </div>
          </div>
        </div>

        <div class="card bg-base-200 shadow-xl">
          <div class="card-body p-4 sm:p-6">
            <h2 class="card-title text-lg">Platforme</h2>
            <div class="relative h-64 sm:h-72">
              <canvas ref="platformRef"></canvas>
            </div>
          </div>
        </div>

        <div v-if="scatterData.length >= 3" class="card bg-base-200 shadow-xl lg:col-span-2">
          <div class="card-body p-4 sm:p-6">
            <h2 class="card-title text-lg">Kritičari vs Ti</h2>
            <p class="text-xs opacity-60 -mt-1">Svaka točka je jedna igra. Crtkana linija = savršen slaganje s kritičarima (Metacritic/20 = tvoja ocjena).</p>
            <div class="flex flex-wrap gap-2 mb-2 text-xs">
              <span class="badge badge-success badge-outline"><span class="w-2 h-2 rounded-full bg-success inline-block mr-1"></span>Slažeš se ({{ scatterSummary.agree }})</span>
              <span class="badge badge-info badge-outline"><span class="w-2 h-2 rounded-full bg-info inline-block mr-1"></span>Sviđa ti se više ({{ scatterSummary.loved }})</span>
              <span class="badge badge-warning badge-outline"><span class="w-2 h-2 rounded-full bg-warning inline-block mr-1"></span>Kritičari ljubazniji ({{ scatterSummary.harsh }})</span>
            </div>
            <div class="relative h-64 sm:h-80">
              <canvas ref="scatterRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- REKORDI -->
      <h2 class="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Rekordi</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <component
          :is="record.game ? 'button' : 'div'"
          v-for="record in records"
          :key="record.title"
          class="card bg-base-200 shadow text-left transition-shadow"
          :class="record.game ? 'hover:shadow-lg cursor-pointer' : ''"
          @click="record.game && navigateToGame(record.game.id)"
        >
          <div class="card-body p-4">
            <div class="text-xs uppercase tracking-wide opacity-50 font-semibold">{{ record.title }}</div>
            <div class="font-bold text-lg leading-tight truncate" :class="record.accent">{{ record.value }}</div>
            <div class="text-xs opacity-60 truncate">{{ record.sub }}</div>
          </div>
        </component>
      </div>

      <!-- TOP LISTE -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h2 class="text-lg sm:text-xl font-bold mb-3">Najbolje ocijenjene</h2>
          <div class="space-y-3">
            <div
              v-for="(game, i) in topRatedGames"
              :key="game.id"
              class="card bg-base-200 shadow-xl overflow-hidden relative cursor-pointer hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              @click="navigateToGame(game.id)"
            >
              <div v-if="heroBg(game)" class="absolute inset-0 bg-cover bg-center scale-105 blur-[1px]" :style="{ backgroundImage: `url('${heroBg(game)}')` }"></div>
              <div v-if="heroBg(game)" class="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/95 to-base-100/40"></div>
              <div class="relative z-10 card-body flex-row items-center gap-2.5 sm:gap-4 p-3 sm:p-4">
                <span class="w-9 sm:w-12 text-center text-2xl sm:text-3xl font-black shrink-0" :class="rankClass(i)">{{ i + 1 }}</span>
                <figure class="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden shadow-2xl shrink-0 bg-base-300">
                  <img v-if="thumbUrl(game) && !failedThumbs.has(game.id)" :src="thumbUrl(game)" :alt="game.title" class="w-full h-full object-cover" loading="lazy" @error="failedThumbs.add(game.id)" />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl font-bold opacity-40">{{ game.title.charAt(0).toUpperCase() }}</div>
                </figure>
                <div class="min-w-0 flex-grow">
                  <div class="font-extrabold text-base sm:text-lg lg:text-xl leading-tight line-clamp-2">{{ game.title }}</div>
                  <div class="text-xs sm:text-sm opacity-70 mt-1 truncate">{{ game.platform || '—' }}<span v-if="game.play_time"> • {{ game.play_time }}h</span></div>
                </div>
                <div class="flex items-center gap-0.5 shrink-0 hidden sm:flex">
                  <template v-for="star in 5" :key="'tr-' + game.id + '-' + star">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </template>
                </div>
                <div class="shrink-0 badge badge-warning badge-outline badge-sm font-bold sm:hidden whitespace-nowrap">★ {{ game.rating }}/5</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-lg sm:text-xl font-bold mb-3">Najviše igrani naslovi</h2>
          <div class="space-y-3">
            <div
              v-for="(game, i) in mostPlayedGames"
              :key="game.id"
              class="card bg-base-200 shadow-xl overflow-hidden relative cursor-pointer hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              @click="navigateToGame(game.id)"
            >
              <div v-if="heroBg(game)" class="absolute inset-0 bg-cover bg-center scale-105 blur-[1px]" :style="{ backgroundImage: `url('${heroBg(game)}')` }"></div>
              <div v-if="heroBg(game)" class="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/95 to-base-100/40"></div>
              <div class="relative z-10 card-body flex-row items-center gap-2.5 sm:gap-4 p-3 sm:p-4">
                <span class="w-9 sm:w-12 text-center text-2xl sm:text-3xl font-black shrink-0" :class="rankClass(i)">{{ i + 1 }}</span>
                <figure class="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden shadow-2xl shrink-0 bg-base-300">
                  <img v-if="thumbUrl(game) && !failedThumbs.has(game.id)" :src="thumbUrl(game)" :alt="game.title" class="w-full h-full object-cover" loading="lazy" @error="failedThumbs.add(game.id)" />
                  <div v-else class="w-full h-full flex items-center justify-center text-2xl font-bold opacity-40">{{ game.title.charAt(0).toUpperCase() }}</div>
                </figure>
                <div class="min-w-0 flex-grow">
                  <div class="font-extrabold text-base sm:text-lg lg:text-xl leading-tight line-clamp-2">{{ game.title }}</div>
                  <div class="text-xs sm:text-sm opacity-70 mt-1 truncate">{{ game.platform || '—' }}</div>
                </div>
                <div class="shrink-0 text-right">
                  <div class="font-black text-lg sm:text-xl">{{ game.play_time }}<span class="text-sm font-bold opacity-70">h</span></div>
                  <div v-if="game.rating" class="text-xs opacity-60">★ {{ game.rating }}/5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useThemeStore } from '../stores/theme';
import { supabase } from '../supabase';
import { computePercent } from '../constants/progressModes';
import { GAME_STATUS } from '../constants/gameStatus';
import Chart from 'chart.js/auto';
import bannerLightUrl from '../assets/newAssets/GamenoteBannerLightMode.png';
import bannerDarkUrl from '../assets/newAssets/GamenoteBannerDarkMode.png';

const HR_MONTHS = ['Sij', 'Vel', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];
const YEARLY_THRESHOLD = 60;

export default {
  setup() {
    const userStore = useUserStore();
    const themeStore = useThemeStore();
    const router = useRouter();

    const loading = ref(true);
    const games = ref([]);
    const selectedBucket = ref(null);
    const selectedYear = ref(null);
    const selectedMonth = ref(null);
    const genreMode = ref('count');
    const failedThumbs = reactive(new Set());

    const timelineRef = ref(null);
    const evolutionRef = ref(null);
    const statusRef = ref(null);
    const genreRef = ref(null);
    const platformRef = ref(null);
    const scatterRef = ref(null);

    let charts = { evolution: null, status: null, genre: null, platform: null, scatter: null, timeline: null };

    /* ---------- Podatci ---------- */

    const fetchGames = async () => {
      loading.value = true;
      if (!userStore.user) {
        loading.value = false;
        return;
      }
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.id);
        if (error) throw error;
        games.value = data || [];
      } catch (error) {
        console.error('Greška pri dohvaćanju igara:', error);
      } finally {
        loading.value = false;
        await nextTick();
        renderAllCharts();
      }
    };

    /* ---------- Datum pomoćnici ---------- */

    const parseDate = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    /* ---------- Vremenska crta ---------- */

    const timeline = computed(() => {
      const dates = games.value
        .map(g => parseDate(g.created_at))
        .filter(Boolean)
        .sort((a, b) => a - b);
      const first = dates[0] || new Date();
      const last = dates[dates.length - 1] || new Date();

      const totalMonths = (last.getFullYear() - first.getFullYear()) * 12 + (last.getMonth() - first.getMonth());
      const granularity = totalMonths > YEARLY_THRESHOLD ? 'year' : 'month';

      const keys = [];
      if (granularity === 'month') {
        const cur = new Date(first.getFullYear(), first.getMonth(), 1);
        while (cur <= last) {
          keys.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
          cur.setMonth(cur.getMonth() + 1);
        }
      } else {
        for (let y = first.getFullYear(); y <= last.getFullYear(); y++) keys.push(String(y));
      }

      const buckets = keys.map(key => ({ key, added: 0, completed: 0, hours: 0, dropped: 0, paused: 0, wishlist: 0, fiveStar: 0 }));
      const index = Object.fromEntries(buckets.map((b, i) => [b.key, i]));

      games.value.forEach(g => {
        const createdD = parseDate(g.created_at);
        const endD = parseDate(g.end_date);
        const gkCreated = keyFromDate(createdD, granularity);
        const gkEnd = keyFromDate(endD, granularity);

        if (gkCreated && index[gkCreated] !== undefined) {
          buckets[index[gkCreated]].added++;
          if (g.status === 'dropped') buckets[index[gkCreated]].dropped++;
          if (g.status === 'paused') buckets[index[gkCreated]].paused++;
          if (g.status === 'wishlist') buckets[index[gkCreated]].wishlist++;
          if (g.rating === 5) buckets[index[gkCreated]].fiveStar++;
        }
        if (gkEnd && index[gkEnd] !== undefined) {
          buckets[index[gkEnd]].completed++;
          buckets[index[gkEnd]].hours += g.play_time || 0;
        } else if ((g.play_time || 0) > 0 && gkCreated && index[gkCreated] !== undefined) {
          buckets[index[gkCreated]].hours += g.play_time || 0;
        }
      });

      buckets.forEach((b, i) => {
        if (granularity === 'month') {
          const [y, m] = b.key.split('-');
          b.year = y;
          b.shortLabel = HR_MONTHS[Number(m) - 1];
          b.fullLabel = `${HR_MONTHS[Number(m) - 1]} ${y}.`;
          b.axisLabel = HR_MONTHS[Number(m) - 1];
          b.showYear = i === 0 || Number(m) === 1;
          b.tip = `${b.fullLabel} — dodano: ${b.added}, završeno: ${b.completed}${b.hours ? ', ' + b.hours + 'h' : ''}`;
        } else {
          b.year = b.key;
          b.shortLabel = b.key.slice(2);
          b.fullLabel = `${b.key}. godina`;
          b.axisLabel = b.key;
          b.showYear = true;
          b.tip = `${b.key}. — dodano: ${b.added}, završeno: ${b.completed}${b.hours ? ', ' + b.hours + 'h' : ''}`;
        }
      });

      const maxAdded = Math.max(1, ...buckets.map(b => b.added));
      const maxCompleted = Math.max(1, ...buckets.map(b => b.completed));

      return { buckets, granularity, maxAdded, maxCompleted };
    });

    function keyFromDate(d, granularity) {
      if (!d) return null;
      if (granularity === 'year') return String(d.getFullYear());
      if (granularity === 'day') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    const availableYears = computed(() => {
      const years = [...new Set(games.value.map(g => parseDate(g.created_at)?.getFullYear()).filter(Boolean))];
      return years.sort((a, b) => b - a);
    });

    const timelineChartSource = computed(() => {
      if (selectedYear.value !== null && selectedMonth.value !== null) {
        const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          let added = 0, completed = 0, dropped = 0, paused = 0, wishlist = 0, fiveStar = 0;
          games.value.forEach(g => {
            const ck = keyFromDate(parseDate(g.created_at), 'day');
            if (ck === key) {
              added++;
              if (g.status === 'dropped') dropped++;
              if (g.status === 'paused') paused++;
              if (g.status === 'wishlist') wishlist++;
              if (g.rating === 5) fiveStar++;
            }
            if (keyFromDate(parseDate(g.end_date), 'day') === key) completed++;
          });
          return { key, axisLabel: String(day), fullLabel: `${day}. ${HR_MONTHS[selectedMonth.value - 1]} ${selectedYear.value}.`, added, completed, dropped, paused, wishlist, fiveStar, hours: 0 };
        });
      }
      if (selectedYear.value === null) return timeline.value.buckets;
      return Array.from({ length: 12 }, (_, i) => {
        const key = `${selectedYear.value}-${String(i + 1).padStart(2, '0')}`;
        let added = 0, completed = 0, hours = 0, dropped = 0, paused = 0, wishlist = 0, fiveStar = 0;
        games.value.forEach(g => {
          const ck = keyFromDate(parseDate(g.created_at), 'month');
          if (ck === key) {
            added++;
            if (g.status === 'dropped') dropped++;
            if (g.status === 'paused') paused++;
            if (g.status === 'wishlist') wishlist++;
            if (g.rating === 5) fiveStar++;
          }
          if (keyFromDate(parseDate(g.end_date), 'month') === key) {
            completed++;
            hours += g.play_time || 0;
          }
        });
        return { key, axisLabel: HR_MONTHS[i], fullLabel: `${HR_MONTHS[i]} ${selectedYear.value}.`, added, completed, dropped, paused, wishlist, fiveStar, hours };
      });
    });

    const darkThemeSet = new Set(['dark', 'black', 'dracula', 'night', 'dim', 'forest', 'halloween', 'business', 'coffee', 'luxury', 'synthwave', 'dim']);
    const isDarkTheme = (name) => darkThemeSet.has(name) || name?.includes('dark') || name?.includes('night') || name?.includes('black');
    const bannerUrl = computed(() => isDarkTheme(themeStore.currentTheme) ? bannerDarkUrl : bannerLightUrl);
    const watermarkOpacity = computed(() => isDarkTheme(themeStore.currentTheme) ? 0.08 : 0.055);
    const watermarkClass = computed(() => '');

    const toggleBucket = (key) => {
      selectedBucket.value = selectedBucket.value === key ? null : key;
      if (selectedBucket.value) {
        const parts = selectedBucket.value.split('-');
        if (parts.length === 2) {
          selectedYear.value = Number(parts[0]);
          selectedMonth.value = Number(parts[1]);
        } else {
          selectedYear.value = Number(parts[0]);
          selectedMonth.value = null;
        }
      }
    };
    const resetFilter = () => { selectedBucket.value = null; };
    const clearTimelineFilters = () => {
      selectedYear.value = null;
      selectedMonth.value = null;
      selectedBucket.value = null;
    };
    const activeFilterLabel = computed(() => {
      if (selectedYear.value !== null && selectedMonth.value !== null) return `${HR_MONTHS[selectedMonth.value - 1]} ${selectedYear.value}.`;
      if (selectedYear.value !== null) return `${selectedYear.value}. godina`;
      if (selectedBucket.value) return timeline.value.buckets.find(b => b.key === selectedBucket.value)?.fullLabel || selectedBucket.value;
      return null;
    });

    const timelineRangeLabel = computed(() => {
      const bs = timeline.value.buckets;
      if (!bs.length) return '';
      return `od ${bs[0].fullLabel} do ${bs[bs.length - 1].fullLabel}`;
    });

    /* ---------- Filtriranje na odabrano razdoblje ---------- */

    const filteredGames = computed(() => {
      if (selectedYear.value !== null && selectedMonth.value !== null) {
        const key = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`;
        return games.value.filter(g => {
          const keys = [keyFromDate(parseDate(g.created_at), 'month'), keyFromDate(parseDate(g.start_date), 'month'), keyFromDate(parseDate(g.end_date), 'month')];
          return keys.includes(key);
        });
      }
      if (selectedYear.value !== null) {
        const yearStr = String(selectedYear.value);
        return games.value.filter(g => {
          const keys = [keyFromDate(parseDate(g.created_at), 'year'), keyFromDate(parseDate(g.start_date), 'year'), keyFromDate(parseDate(g.end_date), 'year')];
          return keys.includes(yearStr);
        });
      }
      if (selectedBucket.value) {
        const gran = timeline.value.granularity;
        return games.value.filter(g => {
          const keys = [keyFromDate(parseDate(g.created_at), gran), keyFromDate(parseDate(g.start_date), gran), keyFromDate(parseDate(g.end_date), gran)];
          return keys.includes(selectedBucket.value);
        });
      }
      return games.value;
    });

    /* ---------- Sažetak (scoped) ---------- */

    const gamePercent = (game) => computePercent({
      progress_mode: game.progress_mode,
      progress_value: game.progress_value,
      progress_total: game.progress_total,
      achievement_percent: game.achievement_percent
    });

    const scopedStats = computed(() => {
      const list = filteredGames.value;
      const rated = list.filter(g => g.rating > 0);
      const percents = list.map(gamePercent).filter(p => typeof p === 'number');
      return {
        total: list.length,
        hours: list.reduce((t, g) => t + (g.play_time || 0), 0),
        avgRating: rated.length ? (rated.reduce((t, g) => t + g.rating, 0) / rated.length).toFixed(1) : '0',
        ratedCount: rated.length,
        completed: list.filter(g => g.status === 'completed').length,
        playing: list.filter(g => g.status === 'playing').length,
        perfect: percents.filter(p => p === 100).length,
        completionRate: percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0
      };
    });

    /* ---------- Rekordi ---------- */

    const daysBetween = (g) => {
      const s = parseDate(g.start_date);
      const e = parseDate(g.end_date);
      if (!s || !e) return null;
      const days = Math.round((e - s) / 86400000);
      return days >= 0 ? days : null;
    };

    const records = computed(() => {
      const list = filteredGames.value;
      const out = [];

      const mostPlayed = [...list].filter(g => g.play_time > 0).sort((a, b) => b.play_time - a.play_time)[0];
      out.push({
        title: 'Najigranija igra',
        value: mostPlayed ? `${mostPlayed.play_time}h` : '—',
        sub: mostPlayed ? mostPlayed.title : 'Nema podataka o satu igranja',
        accent: 'text-primary',
        game: mostPlayed
      });

      const withDays = list.map(g => ({ g, days: daysBetween(g) })).filter(x => x.days !== null && x.days > 0);
      const longest = [...withDays].sort((a, b) => b.days - a.days)[0];
      out.push({
        title: 'Najduži završetak',
        value: longest ? `${longest.days} dana` : '—',
        sub: longest ? longest.g.title : 'Nema datuma igranja',
        accent: 'text-info',
        game: longest?.g
      });

      const byYear = {};
      list.forEach(g => {
        const e = parseDate(g.end_date);
        if (e && g.status === 'completed') byYear[e.getFullYear()] = (byYear[e.getFullYear()] || 0) + 1;
      });
      const bestYearEntry = Object.entries(byYear).sort((a, b) => b[1] - a[1])[0];
      out.push({
        title: 'Najbolja godina',
        value: bestYearEntry ? bestYearEntry[0] + '.' : '—',
        sub: bestYearEntry ? `${bestYearEntry[1]} završenih igara` : 'Nema završenih igara',
        accent: 'text-warning',
        game: null
      });

      const genreHours = {};
      list.forEach(g => {
        if (!g.genre || !g.play_time) return;
        g.genre.split(',').map(s => s.trim()).forEach(genre => {
          if (genre) genreHours[genre] = (genreHours[genre] || 0) + g.play_time;
        });
      });
      const favGenre = Object.entries(genreHours).sort((a, b) => b[1] - a[1])[0];
      out.push({
        title: 'Omiljeni žanr (po satima)',
        value: favGenre ? favGenre[0] : '—',
        sub: favGenre ? `${favGenre[1]} sati igranja` : 'Nema podataka',
        accent: 'text-accent',
        game: null
      });

      return out;
    });

    /* ---------- Top liste (scoped) ---------- */

    const thumbUrl = (game) => game.image_url || game.background_image || null;

    const heroBg = (game) => {
      try {
        const screenshots = JSON.parse(game.screenshot_urls || '[]');
        if (Array.isArray(screenshots) && screenshots.length > 0) return screenshots[0];
      } catch (e) { /* neispravan JSON — koristi cover */ }
      return thumbUrl(game);
    };

    const rankClass = (i) =>
      [
        'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.45)]',
        'text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.35)]',
        'text-orange-700 drop-shadow-[0_0_6px_rgba(194,65,12,0.35)]'
      ][i] || 'opacity-40';

    const topRatedGames = computed(() =>
      [...filteredGames.value].filter(g => g.rating > 0).sort((a, b) => b.rating - a.rating).slice(0, 5)
    );

    const mostPlayedGames = computed(() =>
      [...filteredGames.value].filter(g => g.play_time > 0).sort((a, b) => b.play_time - a.play_time).slice(0, 5)
    );

    /* ---------- Statusi ---------- */

    const STATUS_COLORS = {
      backlog: '--color-base-content',
      playing: '--color-primary',
      completed: '--color-success',
      paused: '--color-warning',
      dropped: '--color-error',
      wishlist: '--color-info'
    };

    const statusColor = (key) => {
      const v = cssVar(STATUS_COLORS[key]);
      return v || '#888';
    };

    const statusBreakdown = computed(() =>
      GAME_STATUS.map(s => ({
        ...s,
        color: statusColor(s.key),
        count: games.value.filter(g => (g.status || 'backlog') === s.key).length
      })).filter(s => s.count > 0)
    );

    /* ---------- Žanrovi / platforme ---------- */

    const genreAggregates = computed(() => {
      const agg = {};
      games.value.forEach(g => {
        if (!g.genre) return;
        g.genre.split(',').map(s => s.trim()).forEach(genre => {
          if (!genre) return;
          if (!agg[genre]) agg[genre] = { count: 0, hours: 0 };
          agg[genre].count++;
          agg[genre].hours += g.play_time || 0;
        });
      });
      return agg;
    });

    const platformAggregates = computed(() => {
      const agg = {};
      games.value.forEach(g => {
        if (!g.platform) return;
        if (!agg[g.platform]) agg[g.platform] = { count: 0, hours: 0 };
        agg[g.platform].count++;
        agg[g.platform].hours += g.play_time || 0;
      });
      return agg;
    });

    /* ---------- Kritičari vs Ti ---------- */

    const SCATTER_TOLERANCE = 0.75;

    const scatterData = computed(() =>
      games.value
        .filter(g => Number(g.metacritic_score) > 0 && g.rating > 0)
        .map(g => ({ x: Number(g.metacritic_score), y: g.rating, title: g.title }))
    );

    const scatterSummary = computed(() => {
      let agree = 0, loved = 0, harsh = 0;
      scatterData.value.forEach(p => {
        const d = p.y - p.x / 20;
        if (Math.abs(d) <= SCATTER_TOLERANCE) agree++;
        else if (d > 0) loved++;
        else harsh++;
      });
      return { agree, loved, harsh };
    });

    /* ---------- Grafikoni ---------- */

    function cssVar(name) {
      if (typeof document === 'undefined') return '';
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    const mixWith = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

    const themeColors = () => ({
      content: cssVar('--color-base-content') || '#888',
      primary: cssVar('--color-primary') || '#570df8',
      secondary: cssVar('--color-secondary') || '#f000b8',
      success: cssVar('--color-success') || '#36d399',
      info: cssVar('--color-info') || '#3abff8',
      warning: cssVar('--color-warning') || '#fbbd23',
      error: cssVar('--color-error') || '#ff5861',
      accent: cssVar('--color-accent') || '#ffd166'
    });

    const destroyCharts = () => {
      Object.keys(charts).forEach(k => {
        if (charts[k]) { charts[k].destroy(); charts[k] = null; }
      });
    };

    const baseScaleOptions = (colors) => ({
      ticks: { color: mixWith(colors.content, 68) },
      grid: { color: mixWith(colors.content, 20) },
      border: { color: mixWith(colors.content, 22) }
    });

    const PLATFORM_BRANDS = [
      [/(playstation|\bps[1-5]\b|psp|vita)/i, '#0070D1'],
      [/(xbox|microsoft)/i, '#107C10'],
      [/(nintendo|switch|wii|3ds|\bds\b|gamecube)/i, '#E60012'],
      [/(\bpc\b|steam|windows|mac|linux)/i, '#8B5CF6'],
      [/(android)/i, '#3DDC84'],
      [/(ios|apple|ipad|iphone)/i, '#A2AAAD']
    ];
    const PLATFORM_FALLBACK = ['--color-primary', '--color-secondary', '--color-accent', '--color-info', '--color-success', '--color-warning'];

    const platformColor = (name) => {
      for (const [re, hex] of PLATFORM_BRANDS) {
        if (re.test(name)) return mixWith(hex, 75);
      }
      const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
      return mixWith(cssVar(PLATFORM_FALLBACK[hash % PLATFORM_FALLBACK.length]) || '#888', 75);
    };

    const renderAllCharts = () => {
      if (loading.value || !games.value.length) return;
      destroyCharts();
      const colors = themeColors();
      Chart.defaults.color = colors.content;
      Chart.defaults.borderColor = mixWith(colors.content, 12);

      renderTimelineChart(colors);

      // Rast biblioteke + završene po mjesecu
      if (evolutionRef.value && timeline.value.buckets.length) {
        const bs = timeline.value.buckets;
        let cum = 0;
        const cumulative = bs.map(b => { cum += b.added; return cum; });
        charts.evolution = new Chart(evolutionRef.value, {
          type: 'bar',
          data: {
            labels: bs.map(b => b.axisLabel),
            datasets: [
              {
                type: 'line',
                label: 'Ukupno igara',
                data: cumulative,
                borderColor: colors.primary,
                backgroundColor: mixWith(colors.primary, 12),
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 2
              },
              {
                type: 'bar',
                label: 'Završene u razdoblju',
                data: bs.map(b => b.completed),
                backgroundColor: mixWith(colors.success, 70),
                borderRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { labels: { boxWidth: 12, boxHeight: 12 } },
              tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}` } }
            },
            scales: {
              x: { ...baseScaleOptions(colors), ticks: { ...baseScaleOptions(colors).ticks, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
              y: { ...baseScaleOptions(colors), beginAtZero: true, ticks: { ...baseScaleOptions(colors).ticks, precision: 0 } }
            }
          }
        });
      }

      // Status doughnut
      if (statusRef.value && statusBreakdown.value.length) {
        charts.status = new Chart(statusRef.value, {
          type: 'doughnut',
          data: {
            labels: statusBreakdown.value.map(s => s.label),
            datasets: [{
              data: statusBreakdown.value.map(s => s.count),
              backgroundColor: statusBreakdown.value.map(s => s.color),
              borderWidth: 2,
              borderColor: cssVar('--color-base-100') || '#fff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: { legend: { display: false } }
          }
        });
      }

      // Žanrovi (broj ili sati)
      renderGenreChart(colors);

      // Platforme
      if (platformRef.value && Object.keys(platformAggregates.value).length) {
        const entries = Object.entries(platformAggregates.value).sort((a, b) => b[1].count - a[1].count).slice(0, 8).reverse();
        charts.platform = new Chart(platformRef.value, {
          type: 'bar',
          data: {
            labels: entries.map(([name]) => name),
            datasets: [{
              label: 'Broj igara',
              data: entries.map(([, v]) => v.count),
              backgroundColor: entries.map(([name]) => platformColor(name)),
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  afterLabel: (ctx) => {
                    const hours = entries[ctx.dataIndex][1].hours;
                    return hours ? `Ukupno: ${hours}h` : null;
                  }
                }
              }
            },
            scales: {
              x: { ...baseScaleOptions(colors), beginAtZero: true, ticks: { ...baseScaleOptions(colors).ticks, precision: 0 } },
              y: { ...baseScaleOptions(colors), ticks: { ...baseScaleOptions(colors).ticks, autoSkip: false } }
            }
          }
        });
      }

      // Kritičari vs Ti (scatter s kategorijama slaganja)
      if (scatterRef.value && scatterData.value.length >= 3) {
        const groups = { agree: [], loved: [], harsh: [] };
        scatterData.value.forEach(p => {
          const d = p.y - p.x / 20;
          const key = Math.abs(d) <= SCATTER_TOLERANCE ? 'agree' : (d > 0 ? 'loved' : 'harsh');
          groups[key].push(p);
        });
        const mkDataset = (label, points, colorVar) => ({
          label,
          data: points,
          backgroundColor: mixWith(colors[colorVar], 70),
          borderColor: colors[colorVar],
          borderWidth: 1,
          pointRadius: 7,
          pointHoverRadius: 9
        });
        charts.scatter = new Chart(scatterRef.value, {
          type: 'scatter',
          data: {
            datasets: [
              {
                type: 'line',
                label: '__diagonal',
                data: [{ x: 0, y: 0 }, { x: 100, y: 5 }],
                borderColor: mixWith(colors.content, 35),
                borderWidth: 1.5,
                borderDash: [6, 6],
                pointRadius: 0,
                fill: false
              },
              mkDataset(`Slažeš se (${groups.agree.length})`, groups.agree, 'success'),
              mkDataset(`Sviđa ti se više (${groups.loved.length})`, groups.loved, 'info'),
              mkDataset(`Kritičari ljubazniji (${groups.harsh.length})`, groups.harsh, 'warning')
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { boxWidth: 12, boxHeight: 12, filter: (item) => item.text !== '__diagonal' } },
              tooltip: {
                filter: (item) => item.dataset.label !== '__diagonal',
                callbacks: {
                  title: (items) => items[0]?.raw?.title || '',
                  label: (ctx) => `Metacritic ${ctx.raw.x} • Tvoja ocjena ${ctx.raw.y}/5`
                }
              }
            },
            scales: {
              x: { ...baseScaleOptions(colors), min: 0, max: 100, title: { display: true, text: 'Metacritic (0–100)', color: mixWith(colors.content, 60) } },
              y: { ...baseScaleOptions(colors), min: 0, max: 5, ticks: { ...baseScaleOptions(colors).ticks, stepSize: 1 }, title: { display: true, text: 'Moja ocjena (0–5)', color: mixWith(colors.content, 60) } }
            }
          }
        });
      }
    };

    const renderGenreChart = (colorsArg) => {
      const colors = colorsArg || themeColors();
      if (charts.genre) { charts.genre.destroy(); charts.genre = null; }
      if (!genreRef.value || !Object.keys(genreAggregates.value).length) return;
      const entries = Object.entries(genreAggregates.value)
        .sort((a, b) => genreMode.value === 'hours' ? b[1].hours - a[1].hours : b[1].count - a[1].count)
        .slice(0, 8)
        .reverse();
      charts.genre = new Chart(genreRef.value, {
        type: 'bar',
        data: {
          labels: entries.map(([name]) => name),
          datasets: [{
            label: genreMode.value === 'hours' ? 'Sati' : 'Broj igara',
            data: entries.map(([, v]) => genreMode.value === 'hours' ? v.hours : v.count),
            backgroundColor: mixWith(colors.secondary, 65),
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ...baseScaleOptions(colors), beginAtZero: true, ticks: { ...baseScaleOptions(colors).ticks, precision: 0 } },
            y: { ...baseScaleOptions(colors) }
          }
        }
      });
    };

    const renderTimelineChart = (colorsArg) => {
      const colors = colorsArg || themeColors();
      if (charts.timeline) { charts.timeline.destroy(); charts.timeline = null; }
      if (!timelineRef.value || !timelineChartSource.value.length) return;
      const src = timelineChartSource.value;
      const isDaily = selectedYear.value !== null && selectedMonth.value !== null;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const maxLeft = Math.max(...src.map(b => Math.max(b.added, b.completed || 0)), 1);
      const maxSmall = Math.max(...src.flatMap(b => [b.dropped || 0, b.paused || 0, b.wishlist || 0, b.fiveStar || 0]), 1);
      const yMax = Math.ceil(maxLeft * 1.15);
      const y1Max = Math.ceil(Math.max(maxSmall * 1.5, yMax * 0.45, 3));
      const ptR = isMobile ? 5.5 : 4.5;
      const ptHoverR = isMobile ? 8 : 7;
      const bwMain = isMobile ? 3.4 : 3.2;
      const bwSmall = isMobile ? 3 : 2.6;
      charts.timeline = new Chart(timelineRef.value, {
        type: 'line',
        data: {
          labels: src.map(b => b.axisLabel),
          datasets: [
            {
              type: 'bar',
              yAxisID: 'y',
              label: `Dodano (${src.reduce((s, b) => s + b.added, 0)})`,
              data: src.map(b => b.added),
              backgroundColor: mixWith(colors.primary, 68),
              borderColor: colors.primary,
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.7,
              categoryPercentage: 0.75,
              order: 2
            },
            {
              label: 'Završeno',
              yAxisID: 'y',
              data: src.map(b => b.completed),
              borderColor: colors.success,
              backgroundColor: mixWith(colors.success, 14),
              tension: 0.35,
              fill: false,
              pointRadius: ptR,
              pointHoverRadius: ptHoverR,
              pointBackgroundColor: colors.success,
              pointBorderColor: cssVar('--color-base-100') || '#ffffff',
              pointBorderWidth: 1.8,
              borderWidth: bwMain,
              borderCapStyle: 'round',
              borderJoinStyle: 'round',
              order: 1
            },
            {
              label: 'Odustao',
              yAxisID: 'y1',
              data: src.map(b => b.dropped || 0),
              borderColor: colors.error,
              backgroundColor: mixWith(colors.error, 14),
              tension: 0.35,
              fill: false,
              pointRadius: ptR,
              pointHoverRadius: ptHoverR,
              pointBackgroundColor: colors.error,
              pointBorderColor: cssVar('--color-base-100') || '#ffffff',
              pointBorderWidth: 1.8,
              borderWidth: bwSmall,
              borderCapStyle: 'round',
              borderJoinStyle: 'round',
              order: 1
            },
            {
              label: 'Pauzirano',
              yAxisID: 'y1',
              data: src.map(b => b.paused || 0),
              borderColor: colors.warning,
              backgroundColor: mixWith(colors.warning, 14),
              tension: 0.35,
              fill: false,
              pointRadius: ptR,
              pointHoverRadius: ptHoverR,
              pointBackgroundColor: colors.warning,
              pointBorderColor: cssVar('--color-base-100') || '#ffffff',
              pointBorderWidth: 1.8,
              borderWidth: bwSmall,
              borderCapStyle: 'round',
              borderJoinStyle: 'round',
              order: 1
            },
            {
              label: 'Wishlist',
              yAxisID: 'y1',
              data: src.map(b => b.wishlist || 0),
              borderColor: colors.info,
              backgroundColor: mixWith(colors.info, 14),
              tension: 0.35,
              fill: false,
              pointRadius: ptR,
              pointHoverRadius: ptHoverR,
              pointBackgroundColor: colors.info,
              pointBorderColor: cssVar('--color-base-100') || '#ffffff',
              pointBorderWidth: 1.8,
              borderWidth: bwSmall,
              borderCapStyle: 'round',
              borderJoinStyle: 'round',
              order: 1
            },
            {
              label: '5/5',
              yAxisID: 'y1',
              data: src.map(b => b.fiveStar || 0),
              borderColor: colors.accent,
              backgroundColor: mixWith(colors.accent, 16),
              tension: 0.35,
              fill: false,
              pointRadius: ptR,
              pointHoverRadius: ptHoverR,
              pointBackgroundColor: colors.accent,
              pointBorderColor: cssVar('--color-base-100') || '#ffffff',
              pointBorderWidth: 1.8,
              borderWidth: bwMain - 0.2,
              borderCapStyle: 'round',
              borderJoinStyle: 'round'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: isMobile ? 'bottom' : 'top',
              labels: {
                boxWidth: isMobile ? 10 : 14,
                boxHeight: isMobile ? 10 : 14,
                usePointStyle: true,
                pointStyle: 'circle',
                padding: isMobile ? 10 : 16,
                font: { weight: '600', size: isMobile ? 10 : 11 }
              }
            },
            tooltip: {
              backgroundColor: mixWith(colors.content, 92),
              titleColor: cssVar('--color-base-100') || '#fff',
              bodyColor: cssVar('--color-base-100') || '#fff',
              borderColor: mixWith(colors.content, 20),
              borderWidth: 1,
              padding: isMobile ? 8 : 10,
              displayColors: true,
              callbacks: {
                title: (items) => src[items[0].dataIndex]?.fullLabel || items[0].label,
                label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
              }
            }
          },
          scales: {
            x: {
              ...baseScaleOptions(colors),
              ticks: {
                ...baseScaleOptions(colors).ticks,
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: isDaily ? (isMobile ? 8 : 15) : (isMobile ? 6 : 12),
                font: { size: isMobile ? 10 : 11 }
              }
            },
            y: {
              ...baseScaleOptions(colors),
              position: 'left',
              beginAtZero: true,
              max: yMax,
              ticks: { ...baseScaleOptions(colors).ticks, precision: 0, font: { size: isMobile ? 10 : 11 } },
              title: { display: !isMobile, text: 'Dodano / Završeno', color: mixWith(colors.content, 60), font: { size: 10 } },
              grid: { color: mixWith(colors.content, isMobile ? 14 : 20), borderColor: mixWith(colors.content, 22) }
            },
            y1: {
              ...baseScaleOptions(colors),
              position: 'right',
              beginAtZero: true,
              max: y1Max,
              grid: { drawOnChartArea: false, color: mixWith(colors.content, 12), borderColor: mixWith(colors.content, 22) },
              ticks: { color: mixWith(colors.content, 68), precision: 0, font: { size: isMobile ? 10 : 11 } },
              border: { color: mixWith(colors.content, 22) },
              title: { display: !isMobile, text: 'Ostalo', color: mixWith(colors.content, 60), font: { size: 10 } }
            }
          },
          onClick: (_, els) => {
            if (!els.length) return;
            if (isDaily) return;
            const b = src[els[0].index];
            if (!b) return;
            if (selectedYear.value !== null) {
              const m = els[0].index + 1;
              selectedMonth.value = selectedMonth.value === m ? null : m;
            } else {
              toggleBucket(b.key);
            }
          }
        }
      });
    };

    watch(games, () => nextTick(renderAllCharts));
    watch(genreMode, () => nextTick(() => renderGenreChart()));
    watch(() => themeStore.currentTheme, () => nextTick(renderAllCharts));
    watch([selectedYear, selectedMonth], () => nextTick(() => renderTimelineChart()));
    watch(selectedYear, (val) => { if (val === null) selectedMonth.value = null; });

    const formatHours = (h) => (h ?? 0).toLocaleString('hr-HR');

    const navigateToGame = (id) => router.push(`/game/${id}`);

    onMounted(async () => {
      await userStore.fetchUser();
      fetchGames();
    });

    onUnmounted(destroyCharts);

    return {
      router,
      loading,
      games,
      selectedBucket,
      selectedYear,
      selectedMonth,
      availableYears,
      timelineChartSource,
      HR_MONTHS,
      bannerUrl,
      watermarkOpacity,
      watermarkClass,
      activeFilterLabel,
      genreMode,
      failedThumbs,
      timelineRef,
      evolutionRef,
      statusRef,
      genreRef,
      platformRef,
      scatterRef,
      timeline,
      toggleBucket,
      resetFilter,
      clearTimelineFilters,
      timelineRangeLabel,
      scopedStats,
      records,
      thumbUrl,
      heroBg,
      rankClass,
      topRatedGames,
      mostPlayedGames,
      statusBreakdown,
      scatterData,
      scatterSummary,
      formatHours,
      navigateToGame
    };
  }
};
</script>
