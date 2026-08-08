<template>
  <div class="api-game-details">
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
      <router-link to="/" class="btn btn-primary mt-4">Natrag na početnu</router-link>
    </div>

    <div v-else-if="!game" class="text-center my-8">
      <p class="text-xl">Igra nije pronađena</p>
      <router-link to="/" class="btn btn-primary mt-4">Natrag na početnu</router-link>
    </div>

    <div v-else>
      <!-- Banner ako je igra već u kolekciji -->
      <div v-if="gameInLibraryId" class="alert bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 text-white shadow-xl relative overflow-hidden border-2 border-sky-300 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-8 h-8 drop-shadow-md"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <div>
          <h3 class="font-bold text-lg drop-shadow">Ova igra je već u tvojoj kolekciji!</h3>
          <div class="text-sm text-sky-100 drop-shadow-sm">Možeš je urediti ili pogledati detalje u svojoj biblioteci.</div>
        </div>
        <router-link :to="`/game/${gameInLibraryId}`" class="btn btn-sm bg-white text-blue-600 hover:bg-sky-50 border-none ml-auto shadow-md">Prikaži u biblioteci</router-link>
      </div>

<!-- Hero -->
      <div class="hero min-h-[220px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[380px] mb-6 rounded-box overflow-hidden relative shadow-xl"
           :style="`background-image: url('${game.background_image || 'https://placehold.co/1200x400?text=No+Image'}'); background-position: center; background-size: cover;`">
        <img v-if="screenshots[0]?.image" :src="screenshots[0].image" alt="" class="hidden lg:block absolute inset-0 w-full h-full object-cover" />
        <div class="hero-overlay bg-gradient-to-t from-base-100 to-transparent opacity-90"></div>
        <div class="hero-content text-neutral-content w-full h-full flex flex-col justify-between items-start !p-4 sm:!p-8">
          <div class="flex w-full justify-between items-start">
            <router-link to="/add-game" class="btn btn-sm btn-ghost bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm">❮ Natrag</router-link>
            <button @click="shareGame" class="btn btn-sm btn-ghost bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Podijeli
            </button>
          </div>
          <div class="mt-auto w-full lg:flex lg:items-end lg:gap-5">
            <div v-if="game.background_image" class="hidden lg:block shrink-0">
              <img :src="game.background_image" :alt="game.name" class="w-[8.2rem] h-[11.4rem] object-cover rounded-lg shadow-xl ring-1 ring-white/20" />
            </div>
            <div class="w-full">
              <p class="text-sm sm:text-base font-semibold text-white/80 drop-shadow">{{ formatDate(game.released) }}</p>
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{{ game.name }}</h1>
              <div v-if="game.genres?.length" class="text-sm sm:text-base text-white/80 drop-shadow mt-1">{{ getGenres() }}</div>
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
              <div v-if="game.metacritic" class="flex items-center gap-2">
                <span class="flex items-center gap-1.5 text-sm opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
                  Metacritic
                </span>
                <div class="radial-progress font-bold text-lg"
                  :class="getMetacriticColorClass(game.metacritic)"
                  :style="`--value:${game.metacritic || 0}; --size:4.2rem; --thickness:0.4rem;`"
                  :aria-valuenow="game.metacritic"
                  role="progressbar">{{ game.metacritic }}</div>
              </div>
              <div v-if="game.esrb_rating?.name" class="flex items-center gap-2">
                <span class="flex items-center gap-1.5 text-sm opacity-70">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                  ESRB
                </span>
                <img v-if="game.esrb_rating.name === 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="Mature 17+" class="w-12 h-auto" />
                <img v-else-if="game.esrb_rating.name === 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="Everyone" class="w-12 h-auto" />
                <img v-else-if="game.esrb_rating.name === 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="Teen" class="w-12 h-auto" />
                <img v-else-if="game.esrb_rating.name === 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="Everyone 10+" class="w-12 h-auto" />
                <img v-else-if="game.esrb_rating.name === 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="Adults Only 18+" class="w-12 h-auto" />
                <span v-else class="text-sm font-semibold">{{ game.esrb_rating.name }}</span>
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
              <span class="text-sm font-semibold text-right">{{ formatDate(game.released) }}</span>
            </div>

            <!-- Službena stranica -->
            <div v-if="game.website" class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-2 text-sm opacity-70 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                Službena stranica
              </span>
              <a :href="game.website" target="_blank" rel="noopener noreferrer" class="link link-primary text-sm font-semibold">Otvori</a>
            </div>

            <div class="flex gap-2 mt-4 pt-3 border-t border-base-300">
              <button @click="openAddToCollectionModal" class="btn btn-primary btn-sm flex-1 px-1">
                Dodaj u kolekciju
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
                <button v-if="gameSeries.length > 0" role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'series' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'series'" @click="activeInfoTab = 'series'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  <span class="hidden sm:inline font-bold">Serija igara</span>
                </button>
                <button v-if="screenshots.length > 0" role="tab" class="tab tab-lifted gap-1.5" :class="activeInfoTab === 'screens' ? 'border-[--tab-border] [--tab-bg:var(--color-base-300)]! tab-active' : 'opacity-60 hover:opacity-100'" :aria-selected="activeInfoTab === 'screens'" @click="activeInfoTab = 'screens'">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                  <span class="hidden sm:inline font-bold">Slike igre</span>
                </button>
              </div>

              <div class="p-4 flex flex-col flex-1 gap-3 bg-base-300 rounded-b-xl rounded-tr-xl" :class="activeInfoTab === 'info' ? 'rounded-tl-none' : 'rounded-tl-xl'">
                <!-- Opis -->
                <div v-show="activeInfoTab === 'info'" class="flex flex-col gap-3 flex-1">
                  <div>
                    <h3 class="text-lg font-bold">Opis</h3>
                    <p class="whitespace-pre-wrap">{{ game.description_raw || 'Nema opisa.' }}</p>
                  </div>
                </div>

                <!-- Serija igrara -->
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
                          <router-link :to="`/api-games/${previousGame.id}`" class="btn btn-xs btn-primary">Pogledaj</router-link>
                        </div>
                      </div>
                    </div>

                    <div v-if="nextGame" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                      <figure class="px-4 pt-4">
                        <img :src="nextGame.background_image || 'https://placehold.co/300x200?text=No+Image'" :alt="nextGame.name" class="rounded-lg w-full h-32 object-cover" />
                      </figure>
                      <div class="card-body p-4">
                        <h4 class="card-title text-sm">{{ nextGame.name }}</h4>
                        <p class="text-xs text-gray-500">Sljedeća igra • {{ formatDate(nextGame.released) }}</p>
                        <div class="card-actions justify-end mt-2">
                          <router-link :to="`/api-games/${nextGame.id}`" class="btn btn-xs btn-primary" @click="activeInfoTab = 'info'">Pogledaj</router-link>
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
                            <router-link :to="`/api-games/${seriesGame.id}`" class="btn btn-xs btn-primary" @click="activeInfoTab = 'info'">Pogledaj</router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Slike igre -->
                <div v-show="activeInfoTab === 'screens'" class="flex flex-col gap-3 flex-1">
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div v-for="(screenshot, index) in screenshots" :key="index" class="relative">
                      <img :src="screenshot.image" :alt="`Screenshot ${index + 1}`" class="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity" @click="openScreenshotModal(index)" />
                    </div>
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
            <img :src="screenshots[selectedScreenshotIndex].image" alt="Enlarged Screenshot" class="w-full h-auto rounded-lg" />
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

    <!-- dodaj kolekciju -->
    <div v-if="showAddModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-2xl mb-4">Dodaj igru u kolekciju</h3>
        
        <div v-if="game" class="mb-6">
          <div class="flex gap-4 mb-4">
            <img 
              :src="game.background_image || 'https://placehold.co/150x200?text=No+Image'" 
              :alt="game.name" 
              class="w-24 h-32 object-cover rounded"
            />
            <div>
              <h4 class="text-xl font-bold">{{ game.name }}</h4>
              <p class="text-sm opacity-70">{{ formatDate(game.released) }}</p>
              <p class="text-sm"><strong>Žanr:</strong> {{ getGenres() }}</p>
              <p class="text-sm"><strong>Izdavač:</strong> {{ getPublishers() }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveToCollection" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="collectionForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Platforma</label>
              <select v-model="collectionForm.platform" class="select select-bordered" required>
                <option value="" disabled>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model="collectionForm.play_time" class="input input-bordered" min="0" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Ocjena (1-5)</label>
              <div class="rating rating-sm sm:rating-md lg:rating-lg pt-3">
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="collectionForm.rating" />
              </div>
            </div>

            <div class="form-control">
              <label class="label font-medium">Status</label>
              <select v-model="collectionForm.status" class="select select-bordered">
                <option value="" disabled>Odaberi status</option>
                <option v-for="s in GAME_STATUS" :key="s.key" :value="s.key">{{ s.label }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label font-medium">Game Progression</label>
              <select v-model="collectionForm.progress_mode" class="select select-bordered">
                <option value="" disabled>Odaberi način praćenja</option>
                <option v-for="mode in PROGRESS_MODES" :key="mode.key" :value="mode.key">{{ mode.label }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="collectionForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="collectionForm.end_date" class="input input-bordered" />
            </div>
          </div>

          <template v-if="selectedCollectionProgressMode">
            <!-- SAMO ZA ACHIEVEMENTS/TROPHIES - Posebna sekcija s jasnom uputom i alert-om -->
            <div v-if="selectedCollectionProgressMode.key.includes('achievements') || selectedCollectionProgressMode.key.includes('trophies')" class="card bg-base-300/50 border border-warning/30 p-4 space-y-4">
              <div class="alert alert-warning text-sm mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="shrink-0 h-6 w-6"><path fill="currentColor" d="M8.15 21.75L6.7 19.3l-2.75-.6q-.375-.075-.6-.387t-.175-.688L3.45 14.8l-1.875-2.15q-.25-.275-.25-.65t.25-.65L3.45 9.2l-.275-2.825q-.05-.375.175-.688t.6-.387l2.75-.6l1.45-2.45q.2-.325.55-.438t.7.038l2.6 1.1l2.6-1.1q.35-.15.7-.038t.55.438L17.3 4.7l2.75.6q.375.075.6.388t.175.687L20.55 9.2l1.875 2.15q.25.275.25.65t-.25.65L20.55 14.8l.275 2.825q.05.375-.175.688t-.6.387l-2.75.6l-1.45 2.45q-.2.325-.55.438t-.7-.038l-2.6-1.1l-2.6 1.1q-.35.15-.7.038t-.55-.438m1.3-1.8l2.55-1.1l2.6 1.1l1.4-2.4l2.75-.65l-.25-2.8l1.85-2.1l-1.85-2.15l.25-2.8l-2.75-.6l-1.45-2.4L12 5.15l-2.6-1.1L8 6.45l-2.75.6l.25 2.8L3.65 12l1.85 2.1l-.25 2.85l2.75.6zM12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13"/></svg>
                <div>
                  <h3 class="font-bold">Brojevi iz RAWG baze mogu biti neprecizni!</h3>
                  <div class="text-xs">Preporučeni broj: <strong>{{ rawgAchievementCount || 'nije dostupno' }}</strong> - slobodno ga promijeni.</div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- UKUPAN BROJ TROFEJA/ACHIEVEMENTA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ukupan broj {{ selectedCollectionProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="collectionForm.progress_total" 
                    class="input input-bordered font-bold" 
                    min="0"
                    placeholder="npr. 50"
                  />
                </div>

                <!-- BROJ KOJI JE KORISNIK OSTVARIO -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ostvareni {{ selectedCollectionProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="collectionForm.progress_value" 
                    class="input input-bordered font-bold text-success" 
                    min="0"
                    :max="collectionForm.progress_total || undefined"
                    placeholder="npr. 25"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="collectionForm.progress_total > 0">
                        {{ Math.round((collectionForm.progress_value / collectionForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupno</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">Jedinica</label>
                  <input type="text" v-model="collectionForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>
            </div>

            <!-- POKEDEX - Dvije vrijednosti bez alert-a (ne dohvaća se iz RAWG) -->
            <div v-else-if="selectedCollectionProgressMode.key === 'pokedex'" class="card bg-base-300/50 border border-info/30 p-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- KOLIKO POKEMONA IMA U IGRI -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ukupno pokemona u igri
                  </label>
                  <input 
                    type="number" 
                    v-model.number="collectionForm.progress_total" 
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
                    v-model.number="collectionForm.progress_value" 
                    class="input input-bordered font-bold text-success" 
                    min="0"
                    :max="collectionForm.progress_total || undefined"
                    placeholder="npr. 150"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="collectionForm.progress_total > 0">
                        {{ Math.round((collectionForm.progress_value / collectionForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupno</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">Jedinica</label>
                  <input type="text" v-model="collectionForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>
            </div>

            <!-- ZA OSTALE PROGRESS MODE-OVE -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-base-300/30 p-4 rounded-box border border-base-300">
              <div class="form-control" v-if="selectedCollectionProgressMode.kind === 'count' || selectedCollectionProgressMode.kind === 'rank'">
                <label class="label font-medium text-sm">Vrijednost</label>
                <input type="number" v-model.number="collectionForm.progress_value" class="input input-bordered" min="0" />
              </div>
              <div class="form-control" v-if="selectedCollectionProgressMode.requiresTotal">
                <label class="label font-medium text-sm">Ukupno</label>
                <input type="number" v-model.number="collectionForm.progress_total" class="input input-bordered" min="0" />
              </div>
              <div class="form-control">
                <label class="label font-medium text-sm">Jedinica</label>
                <input type="text" v-model="collectionForm.progress_unit" class="input input-bordered" :placeholder="selectedCollectionProgressMode.defaultUnit || 'unit'" readonly />
              </div>
            </div>
          </template>

          <!-- Grupe/Kolekcije -->
          <div class="form-control bg-base-200/50 p-4 rounded-box border border-base-300">
            <label class="label cursor-pointer justify-start gap-4 mb-2">
              <input type="checkbox" v-model="showGroupSelector" class="checkbox" />
              <span class="label-text font-medium text-base">Dodaj u grupe/kolekcije</span>
            </label>

            <div v-if="showGroupSelector" class="mt-2">
              <div v-if="groupsLoading" class="text-sm opacity-70">Učitavam grupe...</div>
              <div v-else-if="groups.length === 0" class="text-sm opacity-70">Nema dostupnih grupa. Kreiraj prvu!</div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <label v-for="group in groups" :key="group.id" class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-base-300 bg-base-100 hover:border-primary transition-colors">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary checkbox-sm" 
                    :checked="collectionForm.group_ids.includes(group.id)"
                    @change="toggleGroupId(group.id)"
                  />
                  <span class="text-sm font-medium">{{ group.name }} <span class="opacity-60 font-normal text-xs ml-1">({{ group.type }})</span></span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="collectionForm.notes" class="textarea textarea-bordered h-24 w-full"></textarea>
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>Dodaj igru</span>
            </button>
            <button type="button" @click="closeAddModal" class="btn btn-secondary">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="toast.show" class="toast toast-top toast-end z-50">
      <div class="alert shadow-lg" :class="toast.type === 'success' ? 'alert-success' : 'alert-error'">
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGamesApi } from '../services/gamesApi';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import { PROGRESS_MODES, PROGRESS_MODE_MAP } from '../constants/progressModes';
import { GAME_STATUS } from '../constants/gameStatus';
import { listGroups, addGameToGroup } from '../services/groupsApi';
import PlatformIcon from '../components/PlatformIcon.vue';

export default {
  components: { PlatformIcon },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const gamesApi = useGamesApi();
    const userStore = useUserStore();
    
    const game = ref(null);
    const gameInLibraryId = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const screenshots = ref([]);
    const gameSeries = ref([]);
    const selectedScreenshotIndex = ref(null);
    const activeInfoTab = ref('info');
    const showAddModal = ref(false);
    const saveLoading = ref(false);
    const groups = ref([]);
    const groupsLoading = ref(false);
    const showGroupSelector = ref(false);

    const toast = reactive({
      show: false,
      message: '',
      type: 'success'
    });

    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'Nintendo Switch 2', 'iOS', 'Android', 'Other'
    ];

    const createEmptyCollectionForm = () => ({
      title: '',
      platform: '',
      play_time: 0,
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

    const collectionForm = reactive(createEmptyCollectionForm());
    const rawgAchievementCount = ref(null); // Čuva original broj iz RAWG za prikaz u alert-u

    const selectedCollectionProgressMode = computed(() => PROGRESS_MODE_MAP[collectionForm.progress_mode] || null);

    const loadGroups = async () => {
      if (!userStore.user) return;
      groupsLoading.value = true;
      try {
        groups.value = await listGroups(userStore.user.id);
      } catch (groupError) {
        console.error('Greška pri učitavanju grupa:', groupError);
      } finally {
        groupsLoading.value = false;
      }
    };

    const fetchGame = async () => {
      const gameId = route.params.id;
      loading.value = true;
      error.value = null;
      
      try {
        const gameDetails = await gamesApi.getGameDetails(gameId);
        
        if (!gameDetails) {
          error.value = 'Igra nije pronađena na serveru';
          game.value = null;
          return;
        }
        
        game.value = gameDetails;

        // Check if game is already in user's library
        if (userStore.user) {
          try {
            const { data } = await supabase
              .from('games')
              .select('id')
              .eq('user_id', userStore.user.id)
              .eq('game_api_id', gameId.toString())
              .limit(1);
              
            if (data && data.length > 0) {
              gameInLibraryId.value = data[0].id;
            } else {
              gameInLibraryId.value = null;
            }
          } catch (err) {
            console.error('Error checking library status:', err);
          }
        }
        
        try {
          const screenshotsData = await gamesApi.getGameScreenshots(gameId);
          screenshots.value = screenshotsData || [];
        } catch (screenshotError) {
          console.warn('Screenshots not available:', screenshotError);
          screenshots.value = [];
        }

        try {
          const gameSeriesData = await gamesApi.getGameSeries(gameId);
          gameSeries.value = gameSeriesData.results || [];
        } catch (seriesError) {
          console.warn('Game series data not available:', seriesError);
          gameSeries.value = [];
        }
      } catch (fetchError) {
        console.error('Greška pri dohvaćanju igre:', fetchError);
        error.value = 'Greška pri učitavanju igre. Pokušajte ponovno.';
        game.value = null;
      } finally {
        loading.value = false;
      }
    };
    
    // gledaj za promjene 
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        activeInfoTab.value = 'info';
        fetchGame();
      }
    });

    // automatsko postavljanje jedinice iz progress_mode
    watch(() => collectionForm.progress_mode, (newMode) => {
      const mode = PROGRESS_MODE_MAP[newMode];
      if (mode && mode.defaultUnit) {
        collectionForm.progress_unit = mode.defaultUnit;
        collectionForm.progress_source = collectionForm.platform || mode.badgeSource || '';
      }
    });

    // Auto-set progress mode based on selected platform in modal
    watch(() => collectionForm.platform, (newPlatform) => {
      if (!newPlatform) return;
      const newMode = getProgressModeFromPlatform(newPlatform);
      collectionForm.progress_mode = newMode;
      
      // Also update the unit immediately
      const modeObj = PROGRESS_MODE_MAP[newMode];
      if (modeObj && modeObj.defaultUnit) {
        collectionForm.progress_unit = modeObj.defaultUnit;
      }
    });

    const toggleGroupId = (groupId) => {
      const index = collectionForm.group_ids.indexOf(groupId);
      if (index > -1) {
        collectionForm.group_ids.splice(index, 1);
      } else {
        collectionForm.group_ids.push(groupId);
      }
    };

    const showToast = (message, type = 'success') => {
      toast.message = message;
      toast.type = type;
      toast.show = true;
      setTimeout(() => toast.show = false, 3000);
    };
    
    const shareGame = async () => {
      if (!game.value) return;
      try {
        const shareUrl = `${window.location.origin}/shared?id=${game.value.id}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link je kopiran u međuspremnik!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };
    
    const previousGame = computed(() => {
      if (!game.value || gameSeries.value.length === 0) return null;
      
      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== game.value.id && 
        seriesGame.released && 
        game.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      const currentGameDate = new Date(game.value.released);

      let previousGame = null;
      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate < currentGameDate) {
          previousGame = seriesGame;
        } else {
          break;
        }
      }
      
      return previousGame;
    });
    
    const nextGame = computed(() => {
      if (!game.value || gameSeries.value.length === 0) return null;

      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== game.value.id && 
        seriesGame.released && 
        game.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      const currentGameDate = new Date(game.value.released);

      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate > currentGameDate) {
          return seriesGame;
        }
      }
      
      return null;
    });

    const filteredSeriesGames = computed(() => {
      if (!game.value) return [];
      return gameSeries.value.filter(seriesGame => seriesGame.id !== game.value.id);
    });

    const isLatestGame = computed(() => {
      if (!game.value || gameSeries.value.length === 0) return false;
      
      const gamesWithDates = gameSeries.value.filter(seriesGame => 
        seriesGame.released && game.value.released
      );
      
      if (gamesWithDates.length === 0) return false;
      

      const sortedSeries = gamesWithDates.sort((a, b) => new Date(b.released) - new Date(a.released));

      return sortedSeries[0].id === game.value.id;
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
    
    const getPlatforms = () => {
      if (!game.value?.platforms) return 'N/A';
      return game.value.platforms.map(p => p.platform.name).join(', ');
    };

    const platformList = computed(() => {
      if (!game.value?.platforms) return [];
      return [...new Set(game.value.platforms.map(p => p?.platform?.name || p?.name).filter(Boolean))];
    });
    
    const getGenres = () => {
      if (!game.value?.genres) return 'N/A';
      return game.value.genres.map(g => g.name).join(', ');
    };
    
    const getPublishers = () => {
      if (!game.value?.publishers) return 'N/A';
      return game.value.publishers.map(p => p.name).join(', ');
    };
    
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
    
    const resetCollectionForm = () => {
      Object.assign(collectionForm, createEmptyCollectionForm());
    };

    const getProgressModeFromPlatform = (platformName) => {
      if (!platformName) return 'completion_standard';
      const lower = platformName.toLowerCase();
      
      if (lower.includes('playstation') || lower.includes('ps')) return 'trophies_psn';
      if (lower.includes('xbox')) return 'achievements_xbox';
      if (lower.includes('steam') || lower === 'pc') return 'achievements_steam';
      if (lower.includes('nintendo')) return 'completion_nintendo';
      if (lower.includes('ios')) return 'achievements_gamecenter';
      
      return 'completion_standard';
    };

    const openAddToCollectionModal = async () => {
      if (!userStore.user) {
        return;
      }
      if (!groups.value.length) {
        await loadGroups();
      }
      const firstPlatform = game.value?.platforms?.[0]?.platform?.name || '';
      collectionForm.title = game.value?.name || '';
      collectionForm.platform = collectionForm.platform || firstPlatform;
      
      // Auto-set progress_mode based on platform FIRST
      if (firstPlatform) {
        const platformLower = firstPlatform.toLowerCase();
        let newMode = 'completion_standard';
        
        if (platformLower.includes('playstation') || platformLower.includes('ps')) {
          newMode = 'trophies_psn';
        } else if (platformLower.includes('xbox')) {
          newMode = 'achievements_xbox';
        } else if (platformLower.includes('steam') || platformLower.includes('pc')) {
          newMode = 'achievements_steam';
        } else if (platformLower.includes('nintendo')) {
          newMode = 'completion_nintendo';
        } else if (platformLower.includes('ios')) {
          newMode = 'achievements_gamecenter';
        }
        
        collectionForm.progress_mode = newMode;
        const modeObj = PROGRESS_MODE_MAP[newMode];
        if (modeObj && modeObj.defaultUnit) {
          collectionForm.progress_unit = modeObj.defaultUnit;
        }
        collectionForm.progress_source = firstPlatform || '';
      }
      
      try {
        const achievementsData = await gamesApi.getGameAchievements(route.params.id);
        
        if (achievementsData && achievementsData.count > 0) {
          collectionForm.progress_total = achievementsData.count;
          rawgAchievementCount.value = achievementsData.count; 
          collectionForm.progress_value = 0;
          
        } else {
          rawgAchievementCount.value = null;
        }
      } catch (err) {
        rawgAchievementCount.value = null;
      }
      
      showAddModal.value = true;
    };

    const closeAddModal = () => {
      showAddModal.value = false;
      rawgAchievementCount.value = null;
      resetCollectionForm();
    };

    const saveToCollection = async () => {
      if (!collectionForm.title || !collectionForm.platform) {
        return;
      }

      if (!userStore.user) {
        return;
      }

      try {
        saveLoading.value = true;
        
        let gameData = {
          user_id: userStore.user.id,
          title: collectionForm.title,
          platform: collectionForm.platform,
          play_time: collectionForm.play_time || null,
          genre: game.value?.genres?.map(g => g.name).join(', ') || '',
          publisher: game.value?.publishers?.map(p => p.name).join(', ') || '',
          rating: collectionForm.rating || null,
          notes: collectionForm.notes,
          start_date: collectionForm.start_date || null,
          end_date: collectionForm.end_date || null,
          status: collectionForm.status || null,
          progress_mode: collectionForm.progress_mode || null,
          progress_value: collectionForm.progress_value,
          progress_total: collectionForm.progress_total,
          progress_unit: collectionForm.progress_unit || null,
          progress_source: collectionForm.progress_source || collectionForm.platform || null,
          game_api_id: game.value?.id?.toString() || null,
          image_url: game.value?.background_image,
          description: game.value?.description_raw,
          metacritic_score: game.value?.metacritic,
          esrb_rating: game.value?.esrb_rating?.name,
          release_date: game.value?.released,
          website_url: game.value?.website,
          background_image: game.value?.background_image,
          developers: JSON.stringify(game.value?.developers?.map(d => d.name) || []),
          genres_list: JSON.stringify(game.value?.genres?.map(g => g.name) || []),
          platforms_list: JSON.stringify(game.value?.platforms?.map(p => p.platform.name) || []),
          publishers_list: JSON.stringify(game.value?.publishers?.map(p => p.name) || [])
        };

        
        if (screenshots.value.length > 0) {
          gameData.screenshot_urls = JSON.stringify(screenshots.value?.map(s => s.image) || []);
        }

        if (gameSeries.value.length > 0) {
          const seriesGames = gameSeries.value.map(seriesGame => ({
            id: seriesGame.id,
            name: seriesGame.name,
            released: seriesGame.released,
            background_image: seriesGame.background_image
          }));
          gameData.series_games = JSON.stringify(seriesGames);
        }

        const { data: insertedGame, error } = await supabase
          .from('games')
          .insert([gameData])
          .select()
          .single();

        if (error) {
          console.error('Error saving game:', error);
          showToast('Greška pri dodavanju igre', 'error');
          return;
        }

        const newGameId = insertedGame?.id;
        
        // Dodaj igru u odabrane grupe - isti način kao u GameDetails
        if (newGameId && collectionForm.group_ids.length > 0) {
          for (const groupId of collectionForm.group_ids) {
            try {
              await addGameToGroup({ 
                user_id: userStore.user.id, 
                group_id: groupId, 
                game_id: newGameId 
              });
            } catch (groupError) {
              console.error(`Greška pri dodavanju igre u grupu ${groupId}:`, groupError);
            }
          }
        }

        showToast(`${collectionForm.title} uspješno dodana u kolekciju!`);
        closeAddModal();
        setTimeout(() => router.push('/library'), 1000);
      } catch (error) {
        console.error('Error saving game:', error);
        showToast('Greška pri dodavanju igre', 'error');
      } finally {
        saveLoading.value = false;
      }
    };
    
    onMounted(fetchGame);
    
    return {
      PROGRESS_MODES,
      GAME_STATUS,
      selectedCollectionProgressMode,
      game,
      gameInLibraryId,
      loading,
      error,
      screenshots,
      gameSeries,
      selectedScreenshotIndex,
      activeInfoTab,
      previousGame,
      nextGame,
      isLatestGame,
      filteredSeriesGames,
      openScreenshotModal,
      closeScreenshotModal,
      previousScreenshot,
      nextScreenshot,
      getPlatforms,
      platformList,
      getGenres,
      getPublishers,
      formatDate,
      getMetacriticColorClass,
      showAddModal,
      groups,
      groupsLoading,
      showGroupSelector,
      saveLoading,
      platforms,
      collectionForm,
      rawgAchievementCount,
      openAddToCollectionModal,
      closeAddModal,
      saveToCollection,
      toggleGroupId,
      toast,
      showToast,
      shareGame
    };
  }
};
</script>
