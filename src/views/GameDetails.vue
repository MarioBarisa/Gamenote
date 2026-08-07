// src/views/GameDetails.vue
<template>
  <div class="game-details">
    <div v-if="loading" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="text-center my-8">
      <div class="alert alert-error shadow-lg max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2" />
        </svg>
        <div>
          <h3 class="font-bold">Greška</h3>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
      <router-link to="/library" class="btn btn-primary mt-4">Natrag na biblioteku</router-link>
    </div>

    <div v-else-if="!game" class="text-center my-8">
      <p class="text-xl">Igra nije pronađena</p>
      <router-link to="/library" class="btn btn-primary mt-4">Natrag na biblioteku</router-link>
    </div>

    <div v-else-if="game">
      <!-- 100% Completion Banner -->
      <div v-if="progressPercent === 100" class="mb-6 completion-celebration">
        <div class="alert bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black shadow-2xl border-4 border-yellow-300 relative overflow-hidden">
  
          <div class="absolute inset-0 shimmer"></div>
          
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 shrink-0 star-bounce z-10" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div class="flex-1 z-10">
            <h3 class="font-bold text-xl">🎉 Čestitamo! 100% Završenost!</h3>
            <div class="text-sm font-semibold">Uspješno ste završili sve {{ progressMode?.defaultUnit || 'zadatke' }} u ovoj igri!</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 shrink-0 badge-bounce z-10" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>

      <!-- 1. Hero header -->
      <div class="hero min-h-[220px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[400px] mb-6 rounded-box overflow-hidden relative shadow-xl" 
           :style="`background-image: url(${game.background_image || game.image_url || 'https://placehold.co/1200x400?text=No+Image'}); background-position: center; background-size: cover;`">
        <img v-if="screenshots[0]" :src="screenshots[0]" alt="" class="hidden lg:block absolute inset-0 w-full h-full object-cover" />
        <div class="hero-overlay bg-gradient-to-t from-base-100 to-transparent opacity-90"></div>
        <div class="hero-content text-neutral-content w-full h-full flex flex-col justify-between items-start !p-4 sm:!p-8">
          <div class="flex w-full justify-between items-start">
            <router-link to="/library" class="btn btn-sm btn-ghost bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm">❮ Natrag</router-link>
            <button @click="shareGame" class="btn btn-sm btn-ghost bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Podijeli
            </button>
          </div>
          <div class="mt-auto w-full lg:flex lg:items-end lg:gap-5">
            <div v-if="coverImage" class="hidden lg:block shrink-0">
              <img :src="coverImage" :alt="game.title" class="w-[8.2rem] h-[11.4rem] object-cover rounded-lg shadow-xl ring-1 ring-white/20" />
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{{ game.title }}</h1>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

        <!-- User Data Card -->
        <div class="card bg-base-200 shadow-xl lg:col-span-2 h-full">
          <div class="card-body p-3 sm:p-4 flex flex-col">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 class="card-title text-base m-0">Tvoji podaci</h2>
                <div class="flex gap-2">
                  <button @click="enterEditMode" class="btn btn-sm btn-outline btn-primary gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"/></svg>
                    Uredi
                  </button>
                  <button @click="confirmDelete" class="btn btn-sm btn-outline btn-error gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                    Obriši
                  </button>
                </div>
              </div>

              <div v-if="gameStatus" class="flex flex-wrap items-center gap-2 text-base mb-3">
                <span class="text-xs font-semibold uppercase tracking-wide opacity-60 shrink-0">Stanje:</span>
                <span class="badge badge-sm font-semibold whitespace-normal text-center leading-tight h-auto py-1 max-w-full" :class="statusBadgeClass">{{ statusBadgeText }}</span>
              </div>

              <!-- Compact stat tiles -->
              <div class="grid grid-cols-2 gap-2">
                <div class="stat rounded-xl bg-base-300 px-3 py-2.5 min-h-0">
                  <div class="stat-title text-xs uppercase tracking-wide opacity-60 font-semibold mb-1">Ocjena</div>
                  <div class="stat-value text-base font-semibold flex items-center gap-1">
                    <span class="flex gap-0.5">
                      <svg v-for="star in 5" :key="star" class="w-4 h-4 sm:w-5 sm:h-5" :class="star <= (game.rating || 0) ? 'text-amber-400' : 'text-base-content/25'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z"/></svg>
                    </span>
                    <span>{{ game.rating || 0 }}/5</span>
                  </div>
                </div>
                <div class="stat rounded-xl bg-base-300 px-3 py-2.5 min-h-0">
                  <div class="stat-title text-xs uppercase tracking-wide opacity-60 font-semibold mb-1">Igranje</div>
                  <div class="stat-value text-base font-semibold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 opacity-60 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                    <span>{{ game.play_time ? `${game.play_time}h` : '—' }}</span>
                  </div>
                </div>
                <div class="stat rounded-xl bg-base-300 px-3 py-2.5 min-h-0 col-span-2">
                  <div class="stat-title text-xs uppercase tracking-wide opacity-60 font-semibold mb-1">Period</div>
                  <div class="stat-value text-base font-semibold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 opacity-60 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
                    <span v-if="game.start_date || game.end_date" class="text-sm font-semibold leading-snug">
                      <template v-if="game.start_date">{{ formatDate(game.start_date) }}</template>
                      <template v-if="game.start_date && game.end_date"> – {{ formatDate(game.end_date) }}</template>
                      <template v-else-if="!game.start_date && game.end_date">do {{ formatDate(game.end_date) }}</template>
                    </span>
                    <span v-else class="text-sm italic opacity-50">Nije uneseno</span>
                  </div>
                </div>
              </div>

              <!-- Progress -->
              <div v-if="progressMode && (progressMode.kind === 'ratio' || progressMode.kind === 'count') && game.progress_value != null && game.progress_total != null" class="mt-3 space-y-1">
                <div class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all" :style="{ width: `${progressPercent}%` }"></div>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="font-semibold">{{ validatedProgressValue }}/{{ game.progress_total }} {{ progressMode.label }}</span>
                  <span class="opacity-70">{{ progressPercent }}%</span>
                </div>
                <div class="text-xs text-right">
                  <span v-if="remainingCount > 0" class="opacity-50">Nedostaje: {{ remainingCount }} {{ progressMode.defaultUnit }}</span>
                  <span v-else class="text-success font-semibold">Završeno! 🎉</span>
                </div>
              </div>

              <!-- Bilješke -->
              <div v-if="game.notes" class="bg-base-300 rounded-xl p-2.5 mt-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs opacity-60 font-semibold uppercase tracking-wide">Bilješke</span>
                </div>
                <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ notesExcerpt }}</p>
                <button
                  v-if="notesHasMore"
                  @click="showNotesModal = true"
                  class="btn btn-link btn-xs px-0 text-primary no-underline hover:underline gap-0.5 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" /></svg>
                  Čitaj više
                </button>
              </div>

              <!-- Modal za bilješke -->
              <div v-if="showNotesModal" class="modal modal-open">
                <div class="modal-box max-w-2xl">
                  <h3 class="font-bold text-lg mb-4">{{ game.title }} — Bilješke</h3>
                  <div class="bg-base-100 p-4 rounded max-h-96 overflow-y-auto">
                    <p class="text-sm whitespace-pre-wrap">{{ game.notes }}</p>
                  </div>
                  <div class="modal-action">
                    <button class="btn btn-primary" @click="showNotesModal = false">Zatvori</button>
                  </div>
                </div>
                <form method="dialog" class="modal-backdrop" @click="showNotesModal = false"></form>
              </div>

              <!-- Kolekcije -->
              <div class="bg-base-300/50 rounded-xl p-2.5 mt-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs opacity-60 font-semibold uppercase tracking-wide">Kolekcije</span>
                </div>
                <div v-if="gameGroups.length === 0" class="text-xs opacity-40 italic mb-1.5">Nije dio nijedne kolekcije.</div>
                <div v-else class="flex flex-wrap gap-1.5 mb-1.5">
                  <span v-for="gg in gameGroups" :key="gg.id" class="badge badge-outline badge-sm py-1.5 pr-1 gap-1.5">
                    <router-link :to="`/groups/${gg.groups?.id}`" class="link link-hover text-xs">{{ gg.groups?.name }}</router-link>
                    <button class="btn btn-xs btn-ghost btn-circle text-error" @click="removeFromGroup(gg.groups?.id)" aria-label="Ukloni iz kolekcije">✕</button>
                  </span>
                </div>
                <div class="join">
                  <select v-model="newGroupId" class="select select-bordered select-sm h-8! join-item max-w-52">
                    <option value="" disabled>Dodaj u kolekciju...</option>
                    <option v-for="g in allGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                  </select>
                  <button class="btn btn-sm btn-primary h-8! min-h-0! min-w-0! py-0! join-item px-3" @click="assignToGroup">+</button>
                </div>
              </div>
            </div>
          </div>


          <!-- Informacije (s tabom Serija igara) -->
          <div class="card bg-base-200 shadow-xl lg:col-span-3 h-full">
            <div class="card-body p-3 sm:p-4 flex flex-col">
              <div class="flex flex-col flex-1">
              <div role="tablist" class="tabs tabs-lift">
                <button role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'info' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'info'" @click="activeInfoTab = 'info'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                  <span class="hidden sm:inline font-bold">Informacije</span>
                </button>
                <button v-if="seriesGames.length > 0" role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'series' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'series'" @click="activeInfoTab = 'series'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  <span class="hidden sm:inline font-bold">Serija igara</span>
                </button>
                <button v-if="screenshots.length > 0" role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'screens' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'screens'" @click="activeInfoTab = 'screens'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  <span class="hidden sm:inline font-bold">Slike igre</span>
                </button>
              </div>

              <div class="p-4 flex flex-col flex-1 gap-3 bg-base-300 rounded-b-xl rounded-tr-xl" :class="activeInfoTab === 'info' ? 'rounded-tl-none' : 'rounded-tl-xl'">
              <div v-show="activeInfoTab === 'info'" class="flex flex-col gap-3 flex-1">
                <!-- Platforme -->
                <div v-if="platformList.length > 0" class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" /></svg>
                    Platforme
                  </span>
                  <div class="flex flex-wrap items-center justify-end gap-2">
                    <span v-for="p in platformList" :key="p" class="tooltip tooltip-top flex items-center justify-center" :data-tip="p" :title="p">
                      <svg v-if="isNintendoSwitch(p)" class="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="#F31014" d="M3.78 7.343c.022.391.043.498.203.815.236.482.585.835 1.067 1.072.333.166.418.182.851.198.391.016.53 0 .793-.092 1.076-.364 1.73-1.409 1.543-2.486-.209-1.27-1.425-2.127-2.673-1.875-.311.059-.787.299-1.044.52-.52.45-.782 1.092-.74 1.848z"></path>
                        <path fill="#F31014" d="M5.136.078C2.746.506.824 2.274.219 4.599 0 5.44-.016 5.933.01 12.447c.01 5.978.016 6.118.118 6.584.552 2.491 2.32 4.264 4.837 4.848.327.075.745.091 3.434.102 2.78.022 3.069.016 3.145-.059.075-.075.08-1.034.08-11.904 0-8.063-.016-11.855-.048-11.924-.048-.092-.134-.096-3.048-.092-2.368.006-3.079.022-3.39.075l-.002.001zm4.482 1.855v10.072l.011-.001V22.07l-2.025-.026c-1.864-.022-2.062-.032-2.437-.124-1.602-.412-2.786-1.645-3.123-3.251-.107-.504-.107-12.863-.005-13.356A4.27 4.27 0 0 1 4.61 2.238c.654-.263.959-.295 3.085-.299l1.923-.006zM14.038.03c-.022.016-.032 5.4-.032 11.974 0 10.838.006 11.936.08 11.968.134.048 3.99.032 4.467-.002a6.204 6.204 0 0 0 4.767-3.279 8.19 8.19 0 0 0 .375-.867c.311-.933.305-.686.305-7.827 0-5.701-.01-6.552-.08-6.911-.493-2.588-2.469-4.543-5.062-4.987-.349-.059-.883-.076-2.614-.076-1.2-.006-2.191.01-2.207.026h.001zm2.404 12.435c.369-1.216 1.66-1.934 2.904-1.607v-.001a2.432 2.432 0 0 1 1.671 1.549c.166.466.161 1.152-.006 1.581-.305.787-.9 1.339-1.666 1.543-1.243.321-2.565-.429-2.924-1.661-.108-.375-.102-1.013.021-1.404z" fill-rule="evenodd"></path>
                      </svg>
                      <svg v-else-if="isPC(p)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.611-.611A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                      </svg>
                      <svg v-else-if="isPlayStation(p)" class="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 512 512">
                        <path d="M399.8 203c-.8-17.1-3.3-34.5-10.8-50.1-4.1-8.6-9.7-16.5-16.5-23.2-6.3-6.4-13.6-11.7-21.3-16.3-17.1-10.2-37.5-17-84.4-31S192 64 192 64v358.3l79.9 25.7s.1-198.8.1-299.5v-3.8c0-9.3 7.5-16.8 16.1-16.8h.5c8.5 0 15.5 7.5 15.5 16.8V278c11 5.3 29.2 9.3 41.8 9.1 8.3.2 16.7-1.7 24-5.7 7.6-4.1 13.9-10.4 18.4-17.8 5.1-8.3 8.2-17.8 9.9-27.3 1.9-10.8 2-22.1 1.6-33.3zM86.7 357.8c27.4-9.8 89.3-29.5 89.3-29.5v-47.2s-76.5 24.8-111.3 37.1c-8.6 3.1-17.3 5.9-25.7 9.5-9.8 4.1-19.4 8.7-28.1 14.8-3.8 2.6-7.2 5.9-9.2 10.1-2 4.2-2.2 9.2-.5 13.6 2 5.1 5.8 9.3 10.1 12.6 7.8 5.9 17.1 9.5 26.4 12.2 28.4 9.4 58.4 14 88.4 13.3 14.5-.2 36-1.9 50-4.4v-42s-11 2.5-41.3 12.5c-4.6 1.5-9.2 3.3-14 4.3-7.1 1.6-14.4 2.1-21.6 2.2-6.5-.3-13.2-.7-19.3-3.1-2.2-1-4.6-2.2-5.5-4.6-.8-2 .3-4 1.7-5.4 2.8-2.9 6.8-4.5 10.6-6z" style="fill:#010101"></path>
                        <path d="M512 345.9c-.1-6-3.7-11.2-7.9-15-7.1-6.3-15.9-10.3-24.7-13.5-5.5-1.9-9.3-3.3-14.7-5-25.2-8.2-51.9-11.2-78.3-11.3-8 .3-23.1.5-31 1.4-21.9 2.5-67.3 15.4-67.3 15.4v48.8s67.5-21.6 96.5-31.8c9.7-3.3 20.1-4.6 30.3-4.6 6.5.2 13.2.7 19.4 3.1 2.2.9 4.5 2.2 5.5 4.5.9 2.6-.9 5-2.9 6.5-4.7 3.8-10.7 5.3-16.2 7.4-41 14.5-132.7 44.7-132.7 44.7v47s117.2-39.6 170.8-58.8c8.9-3.3 17.9-6.1 26.4-10.4 7.9-4 15.8-8.6 21.8-15.3 3.1-3.6 5-8 5-13.1z" style="fill:#010101"></path>
                      </svg>
                      <svg v-else-if="isXbox(p)" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" viewBox="8 10 30 30" fill="none">
                        <path fill="#23B900" fill-rule="evenodd" d="M19.118 12.94c1.172.318 2.743.94 3.49 1.382.927.549 1.33.798 1.718.779.327-.017.645-.222 1.256-.598 1.525-.94 5.334-2.094 6.208-1.881.393.095-.26-.306-1.451-.893-3.06-1.506-7.165-1.752-10.635-.636-1.325.426-2.479.886-2.563 1.023-.084.136.806.507 1.977.824ZM35.81 32.365c-.038-2.775-2.209-6.966-6.14-11.855l-1.9-2.363 1.704-1.563c.937-.86 2.268-1.866 2.959-2.236l1.255-.672 1.39 1.355c.765.745 1.881 2.35 2.481 3.565.94 1.905 1.107 2.645 1.208 5.351.136 3.63-.417 5.973-1.948 8.26l-.99 1.48-.019-1.322ZM10.276 20.142c-1.347 3.546-.621 9.009 1.638 12.326.89 1.308 1.093 1.442.804.532-.572-1.803 2.385-7.738 6.225-12.493l1.91-2.367-1.784-1.598c-.981-.879-2.302-1.877-2.934-2.218-1.065-.573-1.213-.578-1.987-.071-1.071.702-3.037 3.693-3.872 5.889Zm3.278 13.79c0 1.339 3.863 3.82 7.327 4.705 3.69.943 8.866-.064 12.03-2.342 2.625-1.89 2.713-2.555.735-5.542-1.22-1.84-6.669-7.485-8.372-8.671l-1.084-.755-2.418 2.085c-4.297 3.708-8.218 8.727-8.218 10.52Z" clip-rule="evenodd"></path>
                      </svg>
                      <svg v-else-if="isIOS(p)" xmlns="http://www.w3.org/2000/svg" width="2038" height="2499" class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 496.255 608.728">
                        <path fill="#999" d="M273.81 52.973C313.806.257 369.41 0 369.41 0s8.271 49.562-31.463 97.306c-42.426 50.98-90.649 42.638-90.649 42.638s-9.055-40.094 26.512-86.971zM252.385 174.662c20.576 0 58.764-28.284 108.471-28.284 85.562 0 119.222 60.883 119.222 60.883s-65.833 33.659-65.833 115.331c0 92.133 82.01 123.885 82.01 123.885s-57.328 161.357-134.762 161.357c-35.565 0-63.215-23.967-100.688-23.967-38.188 0-76.084 24.861-100.766 24.861C89.33 608.73 0 455.666 0 332.628c0-121.052 75.612-184.554 146.533-184.554 46.105 0 81.883 26.588 105.852 26.588z"></path>
                      </svg>
                      <svg v-else-if="isAndroid(p)" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 33.867 33.867">
                        <path fill="#0ecf75" d="M11.31 21.564h2.118c.732 0 1.323.59 1.323 1.322v8.6c0 .732-.59 1.322-1.323 1.322H11.31c-.732 0-1.323-.59-1.323-1.322v-8.7c0-.732.59-1.322 1.323-1.322zm9.13 0h2.116c.733 0 1.323.59 1.323 1.322v8.6c0 .732-.59 1.322-1.323 1.322h-2.117c-.733 0-1.323-.59-1.323-1.322v-8.7c0-.732.59-1.322 1.323-1.322z"></path>
                        <path fill="#59d96b" d="M9.095 13.978a1.32 1.32 0 0 0-1.323 1.323v10.5c0 1.026.826 1.852 1.852 1.852h14.8a1.5 1.5 0 0 0 1.5-1.5V19.3a1.32 1.32 0 0 0-1.323-1.322zM10.156 1.06a.638.638 0 0 0-.280.085h.05c.05 0 .1.01.15.03-.319.185-.75.58-.586.95l-.23 1.3c-1.3 1.6-2.1 2.6-2.9 4.1-.1.7-.1 1.4-.1 2.2v2.3c.1-.4.3-.7.6-.9 0-.7.16-1.4.32-2.1 1.4-1.7 2.3-.6 3.5-2.9l1.251-2.532c.164-.331.076-.726-.244-.91a.637.637 0 0 0-.374-.086.724.724 0 0 0-.536.329L11.61 3.591a9.141 9.141 0 0 0-5.677-1.5c-1.711 0-3.31.4-5.3.9z"></path>
                        <path fill="#fff" d="M13.378 9.448a1.029 1.029 0 1 1 .002-2.058 1.029 1.029 0 0 1-.002 2.058zm5.1-1.03a1.029 1.029 0 1 1 2.058 0 1.029 1.029 0 0 1-2.058 0z"></path>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5 sm:w-6 sm:h-6">
                        <path d="M16 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2M18 9a1 1 0 1 0 0 2 1 1 0 1 0 0-2M16 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2M14 9a1 1 0 1 0 0 2 1 1 0 1 0 0-2M8 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4"></path><path d="M17 4H7C4.24 4 2 6.24 2 9v7.88a3.124 3.124 0 0 0 5.33 2.21l1.96-1.96c1.45-1.45 3.97-1.45 5.41 0l1.96 1.96c.59.59 1.37.91 2.21.91 1.72 0 3.12-1.4 3.12-3.12V9c0-2.76-2.24-5-5-5Zm3 12.88a1.118 1.118 0 0 1-1.91.79l-1.96-1.96c-1.1-1.1-2.56-1.71-4.12-1.71s-3.02.61-4.12 1.71l-1.96 1.96a1.118 1.118 0 0 1-1.91-.79V9c0-1.65 1.35-3 3-3h10c1.65 0 3 1.35 3 3v7.88Z"></path>
                      </svg>
                    </span>
                  </div>
                </div>

                <!-- Žanr -->
                <div v-if="getGenres()" class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /></svg>
                    Žanr
                  </span>
                  <span class="text-sm font-semibold text-right">{{ getGenres() }}</span>
                </div>

                <!-- Metacritic + ESRB -->
                <div class="flex flex-wrap items-center justify-evenly gap-x-10 gap-y-3 bg-base-300 rounded-xl p-3 w-full">
                  <div v-if="game.metacritic_score" class="flex items-center gap-2">
                    <span class="flex items-center gap-1.5 text-sm opacity-70">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                      Metacritic
                    </span>
                    <div class="radial-progress font-bold text-lg"
                      :class="getMetacriticColorClass(game.metacritic_score)"
                      :style="`--value:${game.metacritic_score || 0}; --size:4.2rem; --thickness:0.4rem;`"
                      :aria-valuenow="game.metacritic_score"
                      role="progressbar">{{ game.metacritic_score }}</div>
                  </div>
                  <div v-if="game.esrb_rating" class="flex items-center gap-2">
                    <span class="flex items-center gap-1.5 text-sm opacity-70">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                      ESRB
                    </span>
                    <img v-if="game.esrb_rating === 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="M" class="w-12 h-auto" />
                    <img v-else-if="game.esrb_rating === 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="E" class="w-12 h-auto" />
                    <img v-else-if="game.esrb_rating === 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="T" class="w-12 h-auto" />
                    <img v-else-if="game.esrb_rating === 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="E10+" class="w-12 h-auto" />
                    <img v-else-if="game.esrb_rating === 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="AO" class="w-12 h-auto" />
                    <span v-else class="text-sm">{{ game.esrb_rating }}</span>
                  </div>
                </div>

                <!-- Izdavač -->
                <div v-if="getPublishers()" class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125V21" /></svg>
                    Izdavač
                  </span>
                  <span class="text-sm font-semibold text-right">{{ getPublishers() }}</span>
                </div>

                <!-- Opis -->
                <div v-if="game.description">
                  <span class="flex items-center gap-2 text-sm opacity-70 font-semibold mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    Opis
                  </span>
                  <p ref="descriptionRef" class="text-sm opacity-75 leading-relaxed" :class="showFullDescription ? '' : 'line-clamp-3'">{{ game.description }}</p>
                  <button
                    v-if="descriptionOverflows || showFullDescription"
                    @click="toggleDescription"
                    class="btn btn-link btn-xs px-0 text-primary no-underline hover:underline gap-0.5 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" /></svg>
                    {{ showFullDescription ? 'Prikaži manje' : 'Prikaži više' }}
                  </button>
                </div>
              </div>

              <div v-if="seriesGames.length > 0" v-show="activeInfoTab === 'series'" class="flex flex-col gap-3 flex-1">
                <!-- Prethodna igra -->
                <div
                  v-if="previousGame"
                  class="card card-side bg-base-300 shadow cursor-pointer hover:shadow-md hover:bg-base-300/70 transition-all"
                  @click="navigateToSeriesGame(previousGame)"
                >
                  <figure class="w-28 shrink-0">
                    <img
                      :src="previousGame.background_image || 'https://placehold.co/160x120?text=No+Image'"
                      :alt="previousGame.name"
                      class="w-full h-full object-cover rounded-l-2xl"
                    />
                  </figure>
                  <div class="card-body p-3 justify-between">
                    <div>
                      <p class="text-xs opacity-50 font-semibold uppercase tracking-wide mb-1">◀ Prethodna</p>
                      <h4 class="font-bold text-sm leading-snug">{{ previousGame.name }}</h4>
                      <p class="text-xs opacity-50 mt-0.5">{{ previousGame.released ? new Date(previousGame.released).getFullYear() : '' }}</p>
                    </div>
                    <span v-if="libraryGameIdMap[previousGame.id]" class="badge badge-sm badge-success self-start">U biblioteci</span>
                    <span v-else class="badge badge-sm badge-ghost self-start">API</span>
                  </div>
                </div>

                <!-- Sljedeća igra -->
                <div
                  v-if="nextGame"
                  class="card card-side bg-base-300 shadow cursor-pointer hover:shadow-md hover:bg-base-300/70 transition-all"
                  @click="navigateToSeriesGame(nextGame)"
                >
                  <figure class="w-28 shrink-0">
                    <img
                      :src="nextGame.background_image || 'https://placehold.co/160x120?text=No+Image'"
                      :alt="nextGame.name"
                      class="w-full h-full object-cover rounded-l-2xl"
                    />
                  </figure>
                  <div class="card-body p-3 justify-between">
                    <div>
                      <p class="text-xs opacity-50 font-semibold uppercase tracking-wide mb-1">▶ Sljedeća</p>
                      <h4 class="font-bold text-sm leading-snug">{{ nextGame.name }}</h4>
                      <p class="text-xs opacity-50 mt-0.5">{{ nextGame.released ? new Date(nextGame.released).getFullYear() : '' }}</p>
                    </div>
                    <span v-if="libraryGameIdMap[nextGame.id]" class="badge badge-sm badge-success self-start">U biblioteci</span>
                    <span v-else class="badge badge-sm badge-ghost self-start">API</span>
                  </div>
                </div>

                <div v-if="!previousGame && !nextGame" class="text-xs opacity-50 italic text-center py-2">
                  Ova igra je jedina u seriji.
                </div>
              </div>

              <!-- Slike igre tab -->
              <div v-if="screenshots.length > 0" v-show="activeInfoTab === 'screens'" class="flex flex-col flex-1">
                <div class="flex items-center justify-between mb-3 border-b border-base-300 pb-2">
                  <span class="text-xs opacity-50">{{ (selectedScreenshotIndex ?? 0) + 1 }} / {{ screenshots.length }}</span>
                </div>
                <!-- Main carousel image -->
                <div class="relative rounded-xl overflow-hidden bg-base-300 mx-auto w-full md:w-4/5 lg:w-3/4 max-w-2xl max-h-[350px] flex justify-center">
                  <img
                    :src="screenshots[selectedScreenshotIndex ?? 0]"
                    :alt="`Screenshot ${(selectedScreenshotIndex ?? 0) + 1}`"
                    class="w-full h-auto max-h-[350px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    @click="openScreenshotModal(selectedScreenshotIndex ?? 0)"
                  />
                  <button
                    v-if="screenshots.length > 1"
                    @click="previousScreenshot"
                    class="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 text-white border-none hover:bg-black/70"
                  >❮</button>
                  <button
                    v-if="screenshots.length > 1"
                    @click="nextScreenshot"
                    class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 text-white border-none hover:bg-black/70"
                  >❯</button>
                </div>
                <!-- Thumbnail strip -->
                <div v-if="screenshots.length > 1" class="flex gap-2 mt-4 overflow-x-auto pb-2 justify-center">
                  <img
                    v-for="(shot, i) in screenshots"
                    :key="i"
                    :src="shot"
                    :alt="`Screenshot ${i + 1}`"
                    class="w-14 h-10 sm:w-16 sm:h-12 object-cover rounded cursor-pointer shrink-0 transition-all hover:scale-105"
                    :class="(selectedScreenshotIndex ?? 0) === i ? 'ring-2 ring-primary opacity-100' : 'opacity-50 hover:opacity-80'"
                    @click="openScreenshotModal(i)"
                  />
                </div>
              </div>
              </div>
              </div>
            </div>
          </div>

      </div>

      <!-- Screenshot modal (keep existing logic) -->
      <div v-if="selectedScreenshotIndex !== null" class="modal modal-open">
        <div class="modal-box max-w-5xl">
          <div class="relative">
            <img :src="screenshots[selectedScreenshotIndex]" alt="Enlarged Screenshot" class="w-full h-auto rounded-lg" />
            
            <button 
              v-if="screenshots.length > 1"
              @click="previousScreenshot" 
              class="absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75"
            >
              ❮
            </button>
            
            <button 
              v-if="screenshots.length > 1"
              @click="nextScreenshot" 
              class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75"
            >
              ❯
            </button>
            
            <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {{ selectedScreenshotIndex + 1 }} / {{ screenshots.length }}
            </div>
          </div>
          
          <div class="modal-action">
            <button @click="closeScreenshotModal" class="btn">Zatvori</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editMode" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-2xl mb-4">Uredi igru</h3>
        
        <div class="mb-6">
          <div class="flex gap-4 mb-4">
            <img 
              :src="game.background_image || game.image_url || 'https://placehold.co/150x200?text=No+Image'" 
              :alt="game.title" 
              class="w-24 h-32 object-cover rounded"
            />
            <div>
              <h4 class="text-xl font-bold">{{ game.title }}</h4>
              <p class="text-sm opacity-70" v-if="game.release_date">{{ formatDate(game.release_date) }}</p>
              <p class="text-sm"><strong>Platforma:</strong> {{ game.platform }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveGame" class="space-y-6 game-form">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="editForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Platforma</label>
              <select v-model="editForm.platform" class="select select-bordered" required>
                <option value="" disabled>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>

            <div class="form-control">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model.number="editForm.play_time" class="input input-bordered" min="0" />
            </div>

            <div class="form-control">
              <label class="label font-medium">Ocjena (1-5)</label>
              <div class="rating rating-sm sm:rating-md lg:rating-lg pt-3">
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model.number="editForm.rating" />
              </div>
            </div>

            <div class="form-control">
              <label class="label font-medium">Status</label>
              <select v-model="editForm.status" class="select select-bordered">
                <option value="" disabled>Odaberi status</option>
                <option v-for="s in GAME_STATUS" :key="s.key" :value="s.key">{{ s.label }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label font-medium">Game Progression</label>
              <select v-model="editForm.progress_mode" class="select select-bordered">
                <option value="" disabled>Odaberi način praćenja</option>
                <option v-for="mode in PROGRESS_MODES" :key="mode.key" :value="mode.key">{{ mode.label }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="editForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="editForm.end_date" class="input input-bordered" />
            </div>
          </div>

          <template v-if="selectedProgressMode">
            <!-- SAMO ZA ACHIEVEMENTS/TROPHIES - Posebna sekcija s jasnom uputom i alert-om -->
            <div v-if="selectedProgressMode.key.includes('achievements') || selectedProgressMode.key.includes('trophies')" class="card bg-base-300/50 border border-warning/30 p-4 space-y-4">
              <div class="alert alert-warning text-sm mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="shrink-0 h-6 w-6"><path fill="currentColor" d="M8.15 21.75L6.7 19.3l-2.75-.6q-.375-.075-.6-.387t-.175-.688L3.45 14.8l-1.875-2.15q-.25-.275-.25-.65t.25-.65L3.45 9.2l-.275-2.825q-.05-.375.175-.688t.6-.387l2.75-.6l1.45-2.45q.2-.325.55-.438t.7.038l2.6 1.1l2.6-1.1q.35-.15.7-.038t.55.438L17.3 4.7l2.75.6q.375.075.6.388t.175.687L20.55 9.2l1.875 2.15q.25.275.25.65t-.25.65L20.55 14.8l.275 2.825q.05.375-.175.688t-.6.387l-2.75.6l-1.45 2.45q-.2.325-.55.438t-.7-.038l-2.6-1.1l-2.6 1.1q-.35.15-.7.038t-.55-.438m1.3-1.8l2.55-1.1l2.6 1.1l1.4-2.4l2.75-.65l-.25-2.8l1.85-2.1l-1.85-2.15l.25-2.8l-2.75-.6l-1.45-2.4L12 5.15l-2.6-1.1L8 6.45l-2.75.6l.25 2.8L3.65 12l1.85 2.1l-.25 2.85l2.75.6zM12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13"/></svg>
                <div>
                  <h3 class="font-bold">Brojevi iz RAWG baze mogu biti neprecizni!</h3>
                  <div class="text-xs">Provjerite ukupan broj {{ selectedProgressMode.defaultUnit }}.</div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- UKUPAN BROJ TROFEJA/ACHIEVEMENTA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ukupan broj {{ selectedProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_total" 
                    class="input input-bordered font-bold" 
                    min="0"
                    placeholder="npr. 50"
                  />
                </div>

                <!-- BROJ KOJI JE KORISNIK OSTVARIO -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ostvareni {{ selectedProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_value" 
                    class="input input-bordered font-bold text-success" 
                    min="0"
                    :max="editForm.progress_total || undefined"
                    placeholder="npr. 25"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="editForm.progress_total > 0">
                        {{ Math.round((editForm.progress_value / editForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupno</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">Jedinica</label>
                  <input type="text" v-model="editForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>
            </div>

            <!-- POKEDEX - Dvije vrijednosti bez alert-a (ne dohvaća se iz RAWG) -->
            <div v-else-if="selectedProgressMode.key === 'pokedex'" class="card bg-base-300/50 border border-info/30 p-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- KOLIKO POKEMONA IMA U IGRI -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ukupno pokemona u igri
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_total" 
                    class="input input-bordered font-bold" 
                    min="0"
                    placeholder="npr. 251"
                  />
                </div>
                
                <!-- KOLIKO POKEMONA JE KORISNIK UHVATIO -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Uhvaćenih pokemona
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_value" 
                    class="input input-bordered font-bold text-success" 
                    min="0"
                    :max="editForm.progress_total || undefined"
                    placeholder="npr. 150"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="editForm.progress_total > 0">
                        {{ Math.round((editForm.progress_value / editForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupno</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">Jedinica</label>
                  <input type="text" v-model="editForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>
            </div>

            <!-- ZA OSTALE PROGRESS MODE-OVE -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-base-300/30 p-4 rounded-box border border-base-300">
              <div class="form-control" v-if="selectedProgressMode.kind === 'count' || selectedProgressMode.kind === 'rank'">
                <label class="label font-medium text-sm">Vrijednost</label>
                <input type="number" v-model.number="editForm.progress_value" class="input input-bordered" min="0" />
              </div>
              <div class="form-control" v-if="selectedProgressMode.requiresTotal">
                <label class="label font-medium text-sm">Ukupno</label>
                <input type="number" v-model.number="editForm.progress_total" class="input input-bordered" min="0" />
              </div>
              <div class="form-control">
                <label class="label font-medium text-sm">Jedinica</label>
                <input type="text" v-model="editForm.progress_unit" class="input input-bordered" :placeholder="selectedProgressMode.defaultUnit || 'unit'" readonly />
              </div>
            </div>
          </template>

          <!-- Grupe/Kolekcije -->
          <div class="form-control bg-base-200/50 p-4 rounded-box border border-base-300">
            <label class="label cursor-pointer justify-start gap-4 mb-2">
              <input type="checkbox" v-model="showGroupSelector" class="checkbox" />
              <span class="label-text font-medium text-base">Dodaj u kolekcije</span>
            </label>

            <div v-if="showGroupSelector" class="mt-2">
              <div v-if="groupsLoading" class="text-sm opacity-70">Učitavam grupe...</div>
              <div v-else-if="allGroups.length === 0" class="text-sm opacity-70">Nema dostupnih grupa. Kreiraj prvu!</div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <label v-for="group in allGroups" :key="group.id" class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-base-300 bg-base-100 hover:border-primary transition-colors">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary checkbox-sm" 
                    :checked="editForm.group_ids.includes(group.id)"
                    @change="toggleGroupId(group.id)"
                  />
                  <span class="text-sm font-medium">{{ group.name }} <span class="opacity-60 font-normal text-xs ml-1">({{ group.type }})</span></span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="editForm.notes" class="textarea textarea-bordered h-24 w-full"></textarea>
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>Spremi promjene</span>
            </button>
            <button type="button" @click="cancelEdit" class="btn btn-secondary">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Potvrdi brisanje</h3>
        <p class="py-4">Jeste li sigurni da želite obrisati igru "{{ game.title }}"?</p>
        <div class="modal-action">
          <button @click="deleteGame" class="btn btn-error" :disabled="deleteLoading">
            <span v-if="deleteLoading" class="loading loading-spinner"></span>
            <span v-else>Obriši</span>
          </button>
          <button @click="showDeleteModal = false" class="btn">Odustani</button>
        </div>
      </div>
    </div>
    <div v-if="toast.show" class="toast toast-top toast-end z-50">
      <div class="alert alert-success shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { PROGRESS_MODES, PROGRESS_MODE_MAP } from '../constants/progressModes';
import { GAME_STATUS } from '../constants/gameStatus';
import { useUserStore } from '../stores/user';
import { listGroups, listGameGroups, addGameToGroup, removeGameFromGroup } from '../services/groupsApi';

export default {
  props: {
    editMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    
    const game = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const saveLoading = ref(false);
    const deleteLoading = ref(false);
    const editMode = ref(props.editMode);
    const showDeleteModal = ref(false);
    const selectedScreenshotIndex = ref(null);
    const allGroups = ref([]);
    const gameGroups = ref([]);
    const newGroupId = ref('');
    const showGroupSelector = ref(false);
    const groupsLoading = ref(false);
    const toast = reactive({ show: false, message: '' });
    const showFullDescription = ref(false);
    const descriptionRef = ref(null);
    const descriptionOverflows = ref(false);
    const activeInfoTab = ref('info');
    const showNotesModal = ref(false);

    const notesSentences = () => {
      const notes = game.value?.notes || '';
      return notes.match(/[^.!?]+[.!?]+(\s|$)/g) || (notes ? [notes] : []);
    };

    const notesExcerpt = computed(() => {
      const notes = game.value?.notes || '';
      if (!notes) return '';
      const sentences = notesSentences();
      if (sentences.length <= 3) return notes;
      return sentences.slice(0, 3).join(' ').trim() + ' …';
    });

    const notesHasMore = computed(() => {
      return notesSentences().length > 3;
    });

    const showToast = (msg) => {
      toast.message = msg;
      toast.show = true;
      setTimeout(() => { toast.show = false; }, 3000);
    };

    const shareGame = async () => {
      if (!game.value) return;
      try {
        const shareUrl = `${window.location.origin}/shared?id=${game.value.game_api_id}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link je kopiran u međuspremnik!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };
    
    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'Nintendo Switch 2', 'iOS', 'Android', 'Other'
    ];

    const editForm = reactive({
      title: '',
      platform: '',
      play_time: 0,
      genre: '',
      publisher: '',
      rating: 0,
      notes: '',
      start_date: '',
      end_date: '',
      status: '',
      progress_mode: 'completion_standard',
      progress_value: null,
      progress_total: null,
      progress_unit: '%',
      progress_source: '',
      group_ids: []
    });

    const selectedProgressMode = computed(() => PROGRESS_MODE_MAP[editForm.progress_mode] || null);
    
    const progressMode = computed(() => {
      return game.value?.progress_mode ? PROGRESS_MODE_MAP[game.value.progress_mode] : null;
    });
    
    const progressPercent = computed(() => {
      if (!game.value) return 0;
      const v = Number(game.value.progress_value) || 0;
      const t = Number(game.value.progress_total) || 0;
      if (t > 0) return Math.max(0, Math.min(100, Math.round((v / t) * 100)));
      return 0;
    });
    
    const remainingCount = computed(() => {
      if (!game.value) return 0;
      const total = Number(game.value.progress_total) || 0;
      const earned = Number(game.value.progress_value) || 0;
      return Math.max(0, total - earned);
    });
    
    const validatedProgressValue = computed(() => {
      if (!game.value) return 0;
      const total = Number(game.value.progress_total) || 0;
      const earned = Number(game.value.progress_value) || 0;
      return Math.min(earned, total);
    });

    const gameStatus = computed(() => {
      if (game.value?.status) return game.value.status;
      if (game.value?.currently_playing) return 'playing';
      if (game.value?.end_date) return 'completed';
      return null;
    });

    const statusBadgeText = computed(() => {
      const map = {
        playing: 'Trenutno igram',
        paused: 'Pauzirano',
        completed: 'Završeno',
        dropped: 'Napušteno',
        backlog: 'Backlog'
      };
      return map[gameStatus.value] || gameStatus.value;
    });

    const statusBadgeClass = computed(() => {
      const classMap = {
        playing: 'badge-primary',
        paused: 'badge-warning',
        completed: 'badge-success',
        dropped: 'badge-error',
        backlog: 'badge-ghost'
      };
      return classMap[gameStatus.value] || 'badge-neutral';
    });
    
    
    watch(() => editForm.progress_mode, (newMode) => {
      const mode = PROGRESS_MODE_MAP[newMode];
      if (mode && mode.defaultUnit) {
        editForm.progress_unit = mode.defaultUnit;
        editForm.progress_source = editForm.platform || mode.badgeSource || '';
      }
    });

    // auto set specificno za platformu
    watch(() => editForm.platform, (newPlatform) => {
      if (!newPlatform) return;
      const platformLower = newPlatform.toLowerCase();
      
      if (platformLower.includes('playstation')) {
        editForm.progress_mode = 'trophies_psn';
      } else if (platformLower.includes('xbox')) {
        editForm.progress_mode = 'achievements_xbox';
      } else if (platformLower.includes('steam') || platformLower === 'pc') {
        editForm.progress_mode = 'achievements_steam';
      } else if (platformLower.includes('nintendo')) {
        editForm.progress_mode = 'completion_nintendo';
      } else if (platformLower.includes('ios')) {
        editForm.progress_mode = 'achievements_gamecenter';
      } else {
        editForm.progress_mode = 'completion_standard';
      }
    });

    const fetchGame = async () => {
      const gameId = route.params.id;
      loading.value = true;
      error.value = null;
      
      try {
        const { data, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (fetchError) {
          console.error('Error fetching game:', fetchError);
          error.value = 'Igra nije pronađena u bazi podataka';
          return;
        }
        
        game.value = data;

        if (data) {
          Object.keys(editForm).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
              editForm[key] = data[key];
            }
          });
          checkDescriptionOverflow();

          if (data.start_date) {
            const sd = new Date(data.start_date);
            if (!isNaN(sd.getTime())) editForm.start_date = sd.toISOString().split('T')[0];
          }
          if (data.end_date) {
            const ed = new Date(data.end_date);
            if (!isNaN(ed.getTime())) editForm.end_date = ed.toISOString().split('T')[0];
          }
        }

        
        try {
          await userStore.fetchUser();
          if (userStore.user?.id) {
            allGroups.value = await listGroups(userStore.user.id);
            gameGroups.value = await listGameGroups(gameId, userStore.user.id);
            // Postavi group_ids na osnovu trenutnih grupa igre
            editForm.group_ids = gameGroups.value.map(gg => gg.group_id) || [];
          }
        } catch (e) {
          console.error('Error loading groups:', e);
        }
      } catch (fetchError) {
        console.error('Error fetching game:', fetchError);
        error.value = 'Greška pri učitavanju igre';
      } finally {
        loading.value = false;
      }
    };

    const enterEditMode = async () => {
      // Osvježi grupe prije nego što uđeš u edit mode
      if (userStore.user?.id && game.value?.id) {
        try {
          groupsLoading.value = true;
          allGroups.value = await listGroups(userStore.user.id);
          gameGroups.value = await listGameGroups(game.value.id, userStore.user.id);
          editForm.group_ids = gameGroups.value.map(gg => gg.group_id) || [];
        } catch (e) {
          console.error('Error loading groups:', e);
        } finally {
          groupsLoading.value = false;
        }
      }
      editMode.value = true;
    };

    const cancelEdit = () => {
      editMode.value = false;
      if (game.value) {
        Object.keys(editForm).forEach(key => {
          if (game.value[key] !== null && game.value[key] !== undefined) {
            editForm[key] = game.value[key];
          }
        });
      }
    };

    const saveGame = async () => {
      try {
        saveLoading.value = true;
        
        const updateData = {
          title: editForm.title,
          platform: editForm.platform,
          play_time: editForm.play_time || null,
          genre: editForm.genre,
          publisher: editForm.publisher,
          rating: editForm.rating || null,
          notes: editForm.notes,
          start_date: editForm.start_date || null,
          end_date: editForm.end_date || null,
          status: editForm.status || null,
          progress_mode: editForm.progress_mode || null,
          progress_value: editForm.progress_value,
          progress_total: editForm.progress_total,
          progress_unit: editForm.progress_unit || null,
          progress_source: editForm.progress_source || null,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('games')
          .update(updateData)
          .eq('id', game.value.id);

        if (error) {
          console.error('Error updating game:', error);
          return;
        }

        game.value = { ...game.value, ...updateData };

        // Spremi grupe
        if (userStore.user?.id && editForm.group_ids.length > 0) {
          // Prvo ukloni sve stare veze
          const oldGroupIds = gameGroups.value.map(gg => gg.group_id);
          for (const groupId of oldGroupIds) {
            if (!editForm.group_ids.includes(groupId)) {
              await removeGameFromGroup({ user_id: userStore.user.id, group_id: groupId, game_id: game.value.id });
            }
          }
          
          // Zatim dodaj nove veze
          for (const groupId of editForm.group_ids) {
            if (!oldGroupIds.includes(groupId)) {
              await addGameToGroup({ user_id: userStore.user.id, group_id: groupId, game_id: game.value.id });
            }
          }
          
          // Osvježi listu grupa
          gameGroups.value = await listGameGroups(game.value.id, userStore.user.id);
        }

        editMode.value = false;
      } catch (error) {
        console.error('Error updating game:', error);
      } finally {
        saveLoading.value = false;
      }
    };

    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    const deleteGame = async () => {
      try {
        deleteLoading.value = true;
        
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', game.value.id);

        if (error) {
          console.error('Error deleting game:', error);
          return;
        }

        router.push('/library');
      } catch (error) {
        console.error('Error deleting game:', error);
      } finally {
        deleteLoading.value = false;
        showDeleteModal.value = false;
      }
    };

    const assignToGroup = async () => {
      if (!newGroupId.value || !userStore.user?.id || !game.value?.id) return;
      try {
        await addGameToGroup({ user_id: userStore.user.id, group_id: newGroupId.value, game_id: game.value.id });
        gameGroups.value = await listGameGroups(game.value.id, userStore.user.id);
        newGroupId.value = '';
      } catch (e) {
        console.error('Error assigning group:', e);
      }
    };

    const removeFromGroup = async (groupId) => {
      if (!groupId || !userStore.user?.id || !game.value?.id) return;
      try {
        await removeGameFromGroup({ user_id: userStore.user.id, group_id: groupId, game_id: game.value.id });
        gameGroups.value = await listGameGroups(game.value.id, userStore.user.id);
      } catch (e) {
        console.error('Error removing group:', e);
      }
    };

    const toggleGroupId = (groupId) => {
      const index = editForm.group_ids.indexOf(groupId);
      if (index > -1) {
        editForm.group_ids.splice(index, 1);
      } else {
        editForm.group_ids.push(groupId);
      }
    };

    const screenshots = computed(() => {
      if (!game.value?.screenshot_urls) return [];
      try {
        return JSON.parse(game.value.screenshot_urls);
      } catch {
        return [];
      }
    });

    const coverImage = computed(() => game.value?.image_url || game.value?.background_image || null);

    const seriesGames = computed(() => {
      if (!game.value?.series_games) return [];
      try {
        return JSON.parse(game.value.series_games);
      } catch {
        return [];
      }
    });

    // Mapa apiId -> libraryId za sve igre u seriji
    const libraryGameIdMap = ref({});

    // Dohvati koji su serijski naslovi već u korisnikovoj biblioteci
    const fetchSeriesLibraryStatus = async (games) => {
      if (!userStore.user || games.length === 0) return;
      const apiIds = games.map(g => g.id.toString());
      try {
        const { data } = await supabase
          .from('games')
          .select('id, game_api_id')
          .eq('user_id', userStore.user.id)
          .in('game_api_id', apiIds);
        const map = {};
        if (data) {
          data.forEach(row => {
            map[parseInt(row.game_api_id)] = row.id;
          });
        }
        libraryGameIdMap.value = map;
      } catch (e) {
        console.error('Error fetching series library status:', e);
      }
    };

    // Prati promjene u seriesGames i dohvati status
    watch(seriesGames, (newGames) => {
      if (newGames.length > 0) fetchSeriesLibraryStatus(newGames);
    }, { immediate: true });

    const navigateToSeriesGame = (seriesGame) => {
      const libraryId = libraryGameIdMap.value[seriesGame.id];
      if (libraryId) {
        router.push(`/game/${libraryId}`);
      } else {
        router.push(`/api-games/${seriesGame.id}`);
      }
    };

    const previousGame = computed(() => {
      if (!game.value?.release_date || seriesGames.value.length === 0) return null;
      
      const currentDate = new Date(game.value.release_date);
      const gamesWithDates = seriesGames.value.filter(g => g.released);
      const sortedGames = gamesWithDates.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      let previous = null;
      for (const seriesGame of sortedGames) {
        const gameDate = new Date(seriesGame.released);
        if (gameDate < currentDate) {
          previous = seriesGame;
        } else {
          break;
        }
      }
      
      return previous;
    });

    const nextGame = computed(() => {
      if (!game.value?.release_date || seriesGames.value.length === 0) return null;
      
      const currentDate = new Date(game.value.release_date);
      const gamesWithDates = seriesGames.value.filter(g => g.released);
      const sortedGames = gamesWithDates.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      for (const seriesGame of sortedGames) {
        const gameDate = new Date(seriesGame.released);
        if (gameDate > currentDate) {
          return seriesGame;
        }
      }
      
      return null;
    });
    
    const openScreenshotModal = (index) => {
      selectedScreenshotIndex.value = index;
    };
    
    const closeScreenshotModal = () => {
      selectedScreenshotIndex.value = null;
    };
    
    const previousScreenshot = () => {
      if (selectedScreenshotIndex.value > 0) {
        selectedScreenshotIndex.value--;
      } else {
        selectedScreenshotIndex.value = screenshots.value.length - 1;
      }
    };
    
    const nextScreenshot = () => {
      if (selectedScreenshotIndex.value < screenshots.value.length - 1) {
        selectedScreenshotIndex.value++;
      } else {
        selectedScreenshotIndex.value = 0;
      }
    };

    const platformList = computed(() => {
      if (!game.value) return [];
      if (game.value.platforms_list) {
        try {
          const list = JSON.parse(game.value.platforms_list);
          if (Array.isArray(list) && list.length > 0) return list;
        } catch {
          // fallthrough
        }
      }
      return game.value.platform ? [game.value.platform] : [];
    });

    const isNintendoSwitch = (p) => p.toLowerCase().includes('nintendo switch');
    const isPlayStation = (p) => p.toLowerCase().includes('playstation');
    const isXbox = (p) => p.toLowerCase().includes('xbox');
    const isPC = (p) => ['pc', 'linux', 'macos', 'mac os', 'os x', 'steam'].some(k => p.toLowerCase().includes(k));
    const isIOS = (p) => p.toLowerCase() === 'ios';
    const isAndroid = (p) => p.toLowerCase() === 'android';

    const getGenres = () => {
      if (!game.value?.genres_list) return game.value?.genre || 'N/A';
      try {
        const genres = JSON.parse(game.value.genres_list);
        return genres.join(', ') || game.value?.genre || 'N/A';
      } catch {
        return game.value?.genre || 'N/A';
      }
    };
    
    const getPublishers = () => {
      if (!game.value?.publishers_list) return game.value?.publisher || 'N/A';
      try {
        const publishers = JSON.parse(game.value.publishers_list);
        return publishers.join(', ') || game.value?.publisher || 'N/A';
      } catch {
        return game.value?.publisher || 'N/A';
      }
    };
    
    const getMetacriticColorClass = (score) => {
      if (!score) return 'text-gray-400 border-gray-300';
      
      if (score >= 90) return 'text-green-700 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-900';
      if (score >= 80) return 'text-green-600 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-700';
      if (score >= 70) return 'text-green-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-500';
      if (score >= 60) return 'text-yellow-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-yellow-500';
      if (score >= 50) return 'text-yellow-600 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-yellow-600';
      if (score >= 40) return 'text-orange-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-orange-500';
      
      return 'text-red-500 [--size:7rem] [--thickness:0.8rem] bg-base-200 border-red-500';
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('hr-HR');
    };

    const checkDescriptionOverflow = () => {
      nextTick(() => {
        const el = descriptionRef.value;
        if (el && !showFullDescription.value) {
          descriptionOverflows.value = el.scrollHeight > el.clientHeight + 1;
        }
      });
    };

    const toggleDescription = () => {
      showFullDescription.value = !showFullDescription.value;
      if (!showFullDescription.value) checkDescriptionOverflow();
    };
    
    // Watch for route parameter changes (when user navigates to different game)
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        showFullDescription.value = false;
        fetchGame();
      }
    });
    
    onMounted(fetchGame);
    
    return {
      PROGRESS_MODES,
      GAME_STATUS,
      selectedProgressMode,
      progressMode,
      progressPercent,
      remainingCount,
      validatedProgressValue,
      game,
      loading,
      error,
      saveLoading,
      deleteLoading,
      editMode,
      showDeleteModal,
      platforms,
      editForm,
      screenshots,
      coverImage,
      seriesGames,
      libraryGameIdMap,
      previousGame,
      nextGame,
      navigateToSeriesGame,
      selectedScreenshotIndex,
      enterEditMode,
      cancelEdit,
      saveGame,
      confirmDelete,
      deleteGame,
      openScreenshotModal,
      closeScreenshotModal,
      previousScreenshot,
      nextScreenshot,
      platformList,
      isNintendoSwitch,
      isPlayStation,
      isXbox,
      isPC,
      isIOS,
      isAndroid,
      getGenres,
      getPublishers,
      getMetacriticColorClass,
      formatDate,
      gameStatus,
      statusBadgeText,
      statusBadgeClass,
      allGroups,
      gameGroups,
      newGroupId,
      showGroupSelector,
      groupsLoading,
      assignToGroup,
      removeFromGroup,
      toggleGroupId,
      shareGame,
      toast,
      showFullDescription,
      descriptionOverflows,
      toggleDescription,
      activeInfoTab,
      showNotesModal,
      notesExcerpt,
      notesHasMore
    };
  }
};
</script>

<style scoped>
/* 100% Completion Celebration Animations */
.completion-celebration {
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Bounce animation for stars */
.star-bounce {
  animation: bounce 1s ease-in-out infinite;
}

.badge-bounce {
  animation: bounce 1s ease-in-out 0.15s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
}

/* Shimmer effect */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
