<template>
  <div class="shared-game-view min-h-screen bg-base-100 pb-12">
    <!-- Kompaktni banner bez gradijenta s logom -->
    <div v-if="!userStore.isLoggedIn" class="bg-base-100 text-base-content border-b border-base-300 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center justify-between w-full sm:w-auto">
          <a href="https://gamenote.eu" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Gamenote Logo" class="w-6 h-6 rounded" />
            <span class="font-bold text-sm sm:text-base">Gamenote</span>
          </a>
          <div class="flex gap-2 sm:hidden">
            <router-link to="/register" class="btn btn-xs btn-primary">Registracija</router-link>
            <router-link to="/login" class="btn btn-xs btn-outline">Prijava</router-link>
          </div>
        </div>
        <p class="text-sm sm:text-base font-medium opacity-90 text-center sm:text-left w-full sm:w-auto mt-1 sm:mt-0">
          Napravi profil ili se prijavi kako bi dobio puno iskustvo!
        </p>
        <div class="hidden sm:flex gap-2">
          <router-link to="/register" class="btn btn-sm btn-primary">Napravi profil</router-link>
          <router-link to="/login" class="btn btn-sm btn-outline">Prijavi se</router-link>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-center my-12">
      <div class="alert alert-error shadow-lg max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2" />
        </svg>
        <div>
          <h3 class="font-bold">Greška</h3>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
      <router-link to="/" class="btn btn-primary mt-4">Natrag na početnu</router-link>
    </div>

    <div v-else-if="isLoadingApi" class="flex justify-center my-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="apiGame" class="max-w-7xl mx-auto px-4">
      <!-- Hero -->
      <div class="hero min-h-[220px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[380px] mt-4 mb-6 rounded-box overflow-hidden relative shadow-xl"
           :style="`background-image: url('${apiGame.background_image || 'https://placehold.co/1200x400?text=No+Image'}'); background-position: center; background-size: cover;`">
        <img v-if="screenshots[0]?.image" :src="screenshots[0].image" alt="" class="hidden lg:block absolute inset-0 w-full h-full object-cover" />
        <div class="hero-overlay bg-gradient-to-t from-base-100 to-transparent opacity-90"></div>
        <div class="hero-content text-neutral-content w-full h-full flex flex-col justify-between items-start !p-4 sm:!p-8">
          <div class="mt-auto w-full lg:flex lg:items-end lg:gap-5">
            <div v-if="apiGame.background_image" class="hidden lg:block shrink-0">
              <img :src="apiGame.background_image" :alt="apiGame.name" class="w-[8.2rem] h-[11.4rem] object-cover rounded-lg shadow-xl ring-1 ring-white/20" />
            </div>
            <div class="w-full">
              <p class="text-sm sm:text-base font-semibold text-white/80 drop-shadow">{{ formatDate(apiGame.released) }}</p>
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{{ apiGame.name }}</h1>
              <div v-if="apiGame.genres?.length" class="text-sm sm:text-base text-white/80 drop-shadow mt-1">{{ getGenres() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-stretch">

        <!-- Informacije -->
        <div class="card bg-base-200 shadow-xl lg:col-span-2 h-full">
          <div class="card-body p-3 sm:p-4 flex flex-col">
            <h2 class="card-title text-base m-0 mb-3">Informacije</h2>

            <!-- Metacritic + ESRB -->
            <div class="flex flex-wrap items-center justify-evenly gap-x-10 gap-y-3 bg-base-300 rounded-xl p-3 w-full mb-3">
              <div v-if="apiGame.metacritic" class="flex items-center gap-2">
                <span class="flex items-center gap-1.5 text-sm opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                  Metacritic
                </span>
                <div class="radial-progress font-bold text-lg"
                  :class="getMetacriticColorClass(apiGame.metacritic)"
                  :style="`--value:${apiGame.metacritic || 0}; --size:4.2rem; --thickness:0.4rem;`"
                  :aria-valuenow="apiGame.metacritic"
                  role="progressbar">{{ apiGame.metacritic }}</div>
              </div>
              <div v-if="apiGame.esrb_rating?.name" class="flex items-center gap-2">
                <span class="flex items-center gap-1.5 text-sm opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                  ESRB
                </span>
                <img v-if="apiGame.esrb_rating.name === 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="Mature 17+" class="w-12 h-auto" />
                <img v-else-if="apiGame.esrb_rating.name === 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="Everyone" class="w-12 h-auto" />
                <img v-else-if="apiGame.esrb_rating.name === 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="Teen" class="w-12 h-auto" />
                <img v-else-if="apiGame.esrb_rating.name === 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="Everyone 10+" class="w-12 h-auto" />
                <img v-else-if="apiGame.esrb_rating.name === 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="Adults Only 18+" class="w-12 h-auto" />
                <span v-else class="text-sm font-semibold">{{ apiGame.esrb_rating.name }}</span>
              </div>
            </div>

            <!-- Platforme -->
            <div v-if="platformList.length > 0" class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" /></svg>
                  Platforme
              </span>
              <div class="flex flex-wrap items-center justify-end gap-2">
                <span v-for="p in platformList" :key="p" class="tooltip tooltip-top flex items-center justify-center" :data-tip="p" :title="p">
                  <PlatformIcon :name="p" class="w-6 h-6" />
                </span>
              </div>
            </div>

            <!-- Izdavač -->
            <div v-if="getPublishers() !== 'N/A'" class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                Izdavač
              </span>
              <span class="text-sm font-semibold text-right">{{ getPublishers() }}</span>
            </div>

            <!-- Datum izdavanja -->
            <div class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                Datum izdavanja
              </span>
              <span class="text-sm font-semibold text-right">{{ formatDate(apiGame.released) }}</span>
            </div>

            <!-- Službena stranica -->
            <div v-if="apiGame.website" class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                Službena stranica
              </span>
              <a :href="apiGame.website" target="_blank" rel="noopener noreferrer" class="link link-primary text-sm font-semibold">Otvori</a>
            </div>

            <div class="flex gap-2 mt-4 pt-3 border-t border-base-300">
              <button @click="goToApp" class="btn btn-primary btn-sm flex-1 px-1">
                Dodaj u svoju biblioteku
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs: Informacije / Serija igara / Slike igre -->
        <div class="card bg-base-200 shadow-xl lg:col-span-3 h-full">
          <div class="card-body p-3 sm:p-4 flex flex-col">
            <div class="flex flex-col flex-1">
              <div role="tablist" class="tabs tabs-lift">
                <button role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'info' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'info'" @click="activeInfoTab = 'info'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                  <span class="hidden sm:inline font-bold">Informacije</span>
                </button>
                <button v-if="gameSeries.length > 0" role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'series' ? 'tab-primary [--tab-bg:var(--color-base-300)]!' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'series'" @click="activeInfoTab = 'series'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  <span class="hidden sm:inline font-bold">Serija igara</span>
                </button>
                <button v-if="screenshots.length > 0" role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'screens' ? 'border-[--tab-border] [--tab-bg:var(--color-base-300)]! tab-primary' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'screens'" @click="activeInfoTab = 'screens'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  <span class="hidden sm:inline font-bold">Slike igre</span>
                </button>
              </div>

              <div class="p-4 flex flex-col flex-1 gap-3 bg-base-300 rounded-b-xl rounded-tr-xl" :class="activeInfoTab === 'info' ? 'rounded-tl-none' : 'rounded-tl-xl'">
                <!-- Opis -->
                <div v-show="activeInfoTab === 'info'" class="flex flex-col gap-3 flex-1">
                  <div>
                    <h3 class="text-lg font-bold">Opis</h3>
                    <p class="whitespace-pre-wrap">{{ apiGame.description_raw || 'Nema opisa.' }}</p>
                  </div>
                </div>

                <!-- Serija igara -->
                <div v-show="activeInfoTab === 'series'" class="flex flex-col gap-3 flex-1">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                    <div v-if="previousGame" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                      <figure class="px-4 pt-4">
                        <img :src="previousGame.background_image || 'https://placehold.co/300x200?text=No+Image'" :alt="previousGame.name" class="rounded-lg w-full h-32 object-cover" />
                      </figure>
                      <div class="card-body p-4">
                        <h4 class="card-title text-sm">{{ previousGame.name }}</h4>
                        <p class="text-xs text-gray-500">Prethodna igra • {{ formatDate(previousGame.released) }}</p>
                        <div class="card-actions justify-end mt-2">
                          <router-link :to="`/shared?id=${previousGame.id}`" class="btn btn-xs btn-primary" @click="activeInfoTab = 'info'">Pogledaj</router-link>
                        </div>
                      </div>
                    </div>

                    <div v-if="nextGame" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                      <figure class="px-4 pt-4">
                        <img :src="(nextGame.id === apiGame.id ? apiGame.background_image : nextGame.background_image) || 'https://placehold.co/300x200?text=No+Image'" :alt="nextGame.name" class="rounded-lg w-full h-32 object-cover" />
                      </figure>
                      <div class="card-body p-4">
                        <h4 class="card-title text-sm">{{ nextGame.name }}</h4>
                        <p class="text-xs text-gray-500">Sljedeća igra • {{ formatDate(nextGame.released) }}</p>
                        <div class="card-actions justify-end mt-2">
                          <router-link :to="`/shared?id=${nextGame.id}`" class="btn btn-xs btn-primary" @click="activeInfoTab = 'info'">Pogledaj</router-link>
                        </div>
                      </div>
                    </div>

                    <div v-if="!previousGame" class="card bg-base-100 shadow-sm">
                      <div class="card-body p-4 text-center">
                        <p class="text-sm text-gray-500">Nema prethodne igre u seriji</p>
                      </div>
                    </div>

                    <div v-if="!nextGame" class="card bg-base-100 shadow-sm">
                      <div class="card-body p-4 text-center">
                        <p class="text-sm text-gray-500">Ova igra je najnovija u seriji! 😊</p>
                      </div>
                    </div>
                  </div>

                  <div v-if="!previousGame && !nextGame && !isLatestGame && gameSeries.length > 1" class="mt-4">
                    <h4 class="text-md font-semibold mb-2">Sve igre u seriji:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div v-for="seriesGame in filteredSeriesGames" :key="seriesGame.id" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                        <figure class="px-4 pt-4">
                          <img :src="seriesGame.background_image || 'https://placehold.co/300x200?text=No+Image'" :alt="seriesGame.name" class="rounded-lg w-full h-32 object-cover" />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ seriesGame.name }}</h4>
                          <p class="text-xs text-gray-500">{{ formatDate(seriesGame.released) }}</p>
                          <div class="card-actions justify-end mt-2">
                            <router-link :to="`/shared?id=${seriesGame.id}`" class="btn btn-xs btn-primary" @click="activeInfoTab = 'info'">Pogledaj</router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Slike igre -->
                <div v-if="screenshots.length > 0" v-show="activeInfoTab === 'screens'" class="flex flex-col flex-1">
                  <div class="flex items-center justify-between mb-3 border-b border-base-300 pb-2">
                    <span class="text-xs opacity-50">{{ (selectedScreenshotIndex ?? 0) + 1 }} / {{ screenshots.length }}</span>
                  </div>
                  <!-- Main carousel image -->
                  <div class="relative rounded-xl overflow-hidden bg-base-100 mx-auto w-full md:w-4/5 lg:w-3/4 max-w-2xl max-h-[350px] flex justify-center">
                    <img
                      :src="screenshots[selectedScreenshotIndex ?? 0]?.image"
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
                      :src="shot.image"
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

      <!-- Screenshot lightbox -->
      <div v-if="selectedScreenshotIndex !== null" class="modal modal-open">
        <div class="modal-box max-w-5xl">
          <div class="relative">
            <img :src="screenshots[selectedScreenshotIndex]?.image" alt="Enlarged Screenshot" class="w-full h-auto rounded-lg" />
            <button v-if="screenshots.length > 1" @click="previousScreenshot" class="absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75">❮</button>
            <button v-if="screenshots.length > 1" @click="nextScreenshot" class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75">❯</button>
            <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">{{ selectedScreenshotIndex + 1 }} / {{ screenshots.length }}</div>
          </div>
          <div class="modal-action">
            <button @click="closeScreenshotModal" class="btn">Zatvori</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useGamesApi } from '../services/gamesApi';
import PlatformIcon from '../components/PlatformIcon.vue';

export default {
  name: 'SharedGameView',
  components: { PlatformIcon },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const gamesApi = useGamesApi();
    
    const sharedData = ref(null);
    const error = ref(null);
    const apiGame = ref(null);
    const screenshots = ref([]);
    const gameSeries = ref([]);
    const isLoadingApi = ref(false);
    const selectedScreenshotIndex = ref(null);
    const activeInfoTab = ref('info');

    onMounted(async () => {
      try {
        const idParam = route.query.id;
        const dataParam = route.query.data;
        
        let apiIdToFetch = null;

        if (idParam) {
          apiIdToFetch = idParam;
          // Set a minimal sharedData object so redirectLoggedUser works properly
          sharedData.value = { apiId: idParam, isLibrary: false };
        } else if (dataParam) {
          // Decode base64
          const decodedString = decodeURIComponent(atob(dataParam));
          sharedData.value = JSON.parse(decodedString);
          apiIdToFetch = sharedData.value.apiId;
        } else {
          error.value = 'Nedostaju podaci u poveznici.';
          return;
        }

        // Redirect logged-in users immediately, before any slow API work
        await userStore.fetchUser();
        if (userStore.isLoggedIn) {
          redirectLoggedUser();
          return;
        }

        // Fetch extra API info only for guests
        if (apiIdToFetch) {
          isLoadingApi.value = true;
          try {
            apiGame.value = await gamesApi.getGameDetails(apiIdToFetch);
            
            try {
              const screenshotsData = await gamesApi.getGameScreenshots(apiIdToFetch);
              screenshots.value = screenshotsData || [];
            } catch (screenshotError) {
              console.warn('Screenshots not available:', screenshotError);
            }

            try {
              const gameSeriesData = await gamesApi.getGameSeries(apiIdToFetch);
              gameSeries.value = gameSeriesData.results || [];
            } catch (seriesError) {
              console.warn('Game series data not available:', seriesError);
            }
            
          } catch(e) {
            console.error('Failed to load API data:', e);
            error.value = 'Greška pri dohvaćanju informacija o igri.';
          } finally {
            isLoadingApi.value = false;
          }
        }
      } catch (err) {
        console.error('Error parsing shared data:', err);
        error.value = 'Poveznica je neispravna ili je oštećena.';
      }
    });

    const getGenres = () => {
      if (!apiGame.value?.genres) return 'N/A';
      return apiGame.value.genres.map(g => g.name).join(', ');
    };
    
    const getPublishers = () => {
      if (!apiGame.value?.publishers) return 'N/A';
      return apiGame.value.publishers.map(p => p.name).join(', ');
    };

    const platformList = computed(() => {
      if (!apiGame.value?.platforms) return [];
      return [...new Set(apiGame.value.platforms.map(p => p?.platform?.name || p?.name).filter(Boolean))];
    });
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('hr-HR');
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

    const redirectLoggedUser = () => {
        if (!sharedData.value) return;
        
        if (sharedData.value.isLibrary && sharedData.value.id) {
            if(sharedData.value.apiId) {
                router.replace(`/api-games/${sharedData.value.apiId}`);
            } else {
                router.replace('/library');
            }
        } else if (sharedData.value.apiId) {
            router.replace(`/api-games/${sharedData.value.apiId}`);
        }
    };

    const goToApp = () => {
      if (userStore.isLoggedIn) {
        redirectLoggedUser();
      } else {
        router.push('/register');
      }
    };

    // Series logic copied from ApiGameDetails
    const previousGame = computed(() => {
      if (!apiGame.value || gameSeries.value.length === 0) return null;
      
      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== apiGame.value.id && 
        seriesGame.released && 
        apiGame.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      const currentGameDate = new Date(apiGame.value.released);

      let prev = null;
      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate < currentGameDate) {
          prev = seriesGame;
        } else {
          break;
        }
      }
      return prev;
    });
    
    const nextGame = computed(() => {
      if (!apiGame.value || gameSeries.value.length === 0) return null;

      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== apiGame.value.id && 
        seriesGame.released && 
        apiGame.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      const currentGameDate = new Date(apiGame.value.released);

      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate > currentGameDate) {
          return seriesGame;
        }
      }
      return null;
    });

    const filteredSeriesGames = computed(() => {
      if (!apiGame.value) return [];
      return gameSeries.value.filter(seriesGame => seriesGame.id !== apiGame.value.id);
    });

    const isLatestGame = computed(() => {
      if (!apiGame.value || gameSeries.value.length === 0) return false;
      
      const gamesWithDates = gameSeries.value.filter(seriesGame => 
        seriesGame.released && apiGame.value.released
      );
      
      if (gamesWithDates.length === 0) return false;
      
      const sortedSeries = gamesWithDates.sort((a, b) => new Date(b.released) - new Date(a.released));
      return sortedSeries[0].id === apiGame.value.id;
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
      } else if (screenshots.value.length > 0) {
        selectedScreenshotIndex.value = screenshots.value.length - 1;
      }
    };
    
    const nextScreenshot = () => {
      if (screenshots.value.length === 0) return;
      if (selectedScreenshotIndex.value < screenshots.value.length - 1) {
        selectedScreenshotIndex.value++;
      } else {
        selectedScreenshotIndex.value = 0;
      }
    };

    return {
      userStore,
      sharedData,
      error,
      apiGame,
      screenshots,
      gameSeries,
      isLoadingApi,
      selectedScreenshotIndex,
      activeInfoTab,
      platformList,
      goToApp,
      getGenres,
      getPublishers,
      formatDate,
      getMetacriticColorClass,
      previousGame,
      nextGame,
      filteredSeriesGames,
      isLatestGame,
      openScreenshotModal,
      closeScreenshotModal,
      previousScreenshot,
      nextScreenshot
    };
  }
}
</script>