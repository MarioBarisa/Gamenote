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
      <div class="hero min-h-[220px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] mb-6 rounded-box overflow-hidden relative shadow-xl" 
           :style="`background-image: url(${game.background_image || game.image_url || 'https://placehold.co/1200x400?text=No+Image'}); background-position: center; background-size: cover;`">
        <div class="hero-overlay bg-gradient-to-t from-base-100 to-transparent opacity-90"></div>
        <div class="hero-content text-neutral-content w-full h-full flex flex-col justify-between items-start !p-4 sm:!p-8">
          <div class="flex w-full justify-start items-start">
            <router-link to="/library" class="btn btn-sm btn-ghost bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm">❮ Natrag</router-link>
          </div>
          <div class="mt-auto w-full">
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-if="gameStatus" class="badge font-semibold shadow-sm" :class="statusBadgeClass">{{ statusBadgeText }}</span>
              <span class="badge badge-outline bg-black/30 text-white backdrop-blur-sm border-white/20 shadow-sm max-w-[180px] sm:max-w-[400px] truncate inline-block">{{ getPlatforms() }}</span>
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">{{ game.title }}</h1>
            <p class="text-white/80 text-sm font-medium drop-shadow">{{ getGenres() }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: User Data & Screenshots -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          
          <!-- User Data Card -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-base-300 pb-3 gap-3">
                <h2 class="card-title text-xl m-0">Vaši podaci</h2>
                <div class="flex gap-2">
                  <button @click="enterEditMode" class="btn btn-sm btn-outline btn-primary">Uredi</button>
                  <button @click="confirmDelete" class="btn btn-sm btn-outline btn-error">Obriši</button>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-4 sm:gap-6 mb-6">
                <div class="flex flex-col">
                  <span class="text-sm opacity-70 font-semibold mb-1">Ocjena</span>
                  <div class="flex items-center gap-2">
                    <div class="rating rating-sm sm:rating-md pointer-events-none">
                      <input type="radio" class="mask mask-star-2 bg-warning" :checked="game.rating === 1" disabled />
                      <input type="radio" class="mask mask-star-2 bg-warning" :checked="game.rating === 2" disabled />
                      <input type="radio" class="mask mask-star-2 bg-warning" :checked="game.rating === 3" disabled />
                      <input type="radio" class="mask mask-star-2 bg-warning" :checked="game.rating === 4" disabled />
                      <input type="radio" class="mask mask-star-2 bg-warning" :checked="game.rating === 5" disabled />
                    </div>
                    <span class="font-bold">{{ game.rating || 0 }}/5</span>
                  </div>
                </div>

                <div class="flex flex-col" v-if="game.play_time">
                  <span class="text-sm opacity-70 font-semibold mb-1">Vrijeme igranja</span>
                  <span class="font-bold flex items-center gap-1">
                    {{ game.play_time }} sati
                  </span>
                </div>

                <div class="flex flex-col">
                  <span class="text-sm opacity-70 font-semibold mb-1">Period igranja</span>
                  <div class="flex flex-wrap gap-2 items-center">
                    <span class="badge badge-sm sm:badge-md" v-if="game.start_date">Od {{ formatDate(game.start_date) }}</span>
                    <span v-if="game.start_date && game.end_date" class="text-xs opacity-50">-</span>
                    <span class="badge badge-sm sm:badge-md" v-if="game.end_date">Do {{ formatDate(game.end_date) }}</span>
                    <span class="text-xs opacity-50 italic" v-if="!game.start_date && !game.end_date">Nije uneseno</span>
                  </div>
                </div>
              </div>

              <div v-if="progressMode && (progressMode.kind === 'ratio' || progressMode.kind === 'count') && game.progress_value != null && game.progress_total != null" class="mb-6">
                <span class="text-sm opacity-70 font-semibold mb-2 block">{{ progressMode.label }}</span>
                <div class="flex items-center gap-4">
                  <progress class="progress progress-primary w-full" :value="progressPercent" max="100"></progress>
                  <span class="font-bold shrink-0">{{ progressPercent }}%</span>
                </div>
                <div class="flex justify-between text-xs mt-1 opacity-70">
                  <span>{{ validatedProgressValue }} / {{ game.progress_total }} {{ progressMode.defaultUnit }}</span>
                  <span v-if="remainingCount > 0">Nedostaje: {{ remainingCount }}</span>
                  <span v-else class="text-success font-bold">Završeno!</span>
                </div>
              </div>

              <div>
                <span class="text-sm opacity-70 font-semibold mb-2 block">Bilješke</span>
                <div v-if="game.notes" class="bg-base-300 rounded-lg p-4 italic text-sm">
                  {{ game.notes }}
                </div>
                <div v-else class="text-sm opacity-50 italic">
                  Nemaš bilješka za ovu igru.
                </div>
              </div>
            </div>
          </div>

          <!-- Screenshots -->
          <div v-if="screenshots.length > 0" class="card bg-base-200 shadow-xl">
            <div class="card-body p-4 sm:p-6">
              <h3 class="card-title text-xl mb-4 border-b border-base-300 pb-2">Slike igre</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="(screenshot, index) in screenshots" :key="index" class="relative">
                  <img 
                    :src="screenshot" 
                    :alt="`Screenshot ${index + 1}`" 
                    class="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity object-cover aspect-video"
                    @click="openScreenshotModal(index)"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: API Info, Groups, Series -->
        <div class="flex flex-col gap-6">

          <!-- Groups -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body p-4 sm:p-6">
              <h3 class="card-title text-xl mb-4 border-b border-base-300 pb-2">Kolekcije</h3>
              <div v-if="gameGroups.length === 0" class="text-sm opacity-70 mb-2">Nema dodanih grupa.</div>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="gg in gameGroups" :key="gg.id" class="badge badge-outline">
                  <router-link :to="`/groups/${gg.groups?.id}`" class="link link-hover">{{ gg.groups?.name }}</router-link>
                  <button class="ml-2 text-error" @click="removeFromGroup(gg.groups?.id)">✕</button>
                </span>
              </div>
              <div class="flex flex-col gap-2">
                <select v-model="newGroupId" class="select select-bordered select-sm w-full">
                  <option value="" disabled>Odaberi grupu</option>
                  <option v-for="g in allGroups" :key="g.id" :value="g.id">{{ g.name }} ({{ g.type }})</option>
                </select>
                <button class="btn btn-sm btn-primary w-full" @click="assignToGroup">Dodaj u grupu</button>
              </div>
            </div>
          </div>

          <!-- API Info -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body p-4 sm:p-6">
              <h3 class="card-title text-xl mb-4 border-b border-base-300 pb-2">Informacije</h3>
              <div class="flex flex-col gap-4">
                <div v-if="game.metacritic_score" class="flex items-center gap-4 bg-base-300 p-3 rounded-lg w-full justify-between">
                  <span class="font-bold">Metacritic</span>
                  <div class="radial-progress font-bold text-lg" 
                    :class="getMetacriticColorClass(game.metacritic_score)"
                    :style="`--value:${game.metacritic_score || 0}; --size:4rem;`" 
                    :aria-valuenow="game.metacritic_score" 
                    role="progressbar">{{ game.metacritic_score }}</div>
                </div>
                <p v-if="getPublishers()" class="text-sm"><strong>Izdavač:</strong><br/>{{ getPublishers() }}</p>
                
                <div v-if="game.esrb_rating" class="text-sm flex flex-col gap-1">
                  <strong>ESRB:</strong>
                  <img v-if="game.esrb_rating == 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="Mature 17+" class="w-12 h-auto" />
                  <img v-else-if="game.esrb_rating == 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="Everyone" class="w-12 h-auto" />
                  <img v-else-if="game.esrb_rating == 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="Teen" class="w-12 h-auto" />
                  <img v-else-if="game.esrb_rating == 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="Everyone 10+" class="w-12 h-auto" />
                  <img v-else-if="game.esrb_rating == 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="Adults Only 18+" class="w-12 h-auto" />
                  <span v-else>{{ game.esrb_rating }}</span>
                </div>

                <div v-if="game.description" class="mt-2">
                  <h4 class="font-bold mb-1 text-sm">Opis:</h4>
                  <p class="text-xs opacity-80 leading-relaxed">{{ game.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Series -->
          <div v-if="seriesGames.length > 0" class="card bg-base-200 shadow-xl">
            <div class="card-body p-4 sm:p-6">
              <h3 class="card-title text-xl mb-4 border-b border-base-300 pb-2">Serija igara</h3>
              <div class="flex flex-col gap-3">
                <div v-if="previousGame" class="flex gap-3 items-center bg-base-300 p-2 rounded-lg cursor-pointer hover:bg-base-300/80 transition-colors">
                  <img :src="previousGame.background_image || 'https://placehold.co/100x100?text=No+Image'" class="w-16 h-16 object-cover rounded" />
                  <div>
                    <h4 class="text-sm font-bold leading-tight">{{ previousGame.name }}</h4>
                    <p class="text-xs opacity-60">Prethodna</p>
                  </div>
                </div>
                <div v-if="nextGame" class="flex gap-3 items-center bg-base-300 p-2 rounded-lg cursor-pointer hover:bg-base-300/80 transition-colors">
                  <img :src="nextGame.background_image || 'https://placehold.co/100x100?text=No+Image'" class="w-16 h-16 object-cover rounded" />
                  <div>
                    <h4 class="text-sm font-bold leading-tight">{{ nextGame.name }}</h4>
                    <p class="text-xs opacity-60">Sljedeća</p>
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
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { PROGRESS_MODES, PROGRESS_MODE_MAP, computePercent, progressLabel } from '../constants/progressModes';
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
    
    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'iOS', 'Android', 'Other'
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
          error.value = 'Igra nije pronađena u bazi podataka';
          throw fetchError;
        }
        
        game.value = data;

        if (data) {
          Object.keys(editForm).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
              editForm[key] = data[key];
            }
          });

          if (data.start_date) {
            editForm.start_date = new Date(data.start_date).toISOString().split('T')[0];
          }
          if (data.end_date) {
            editForm.end_date = new Date(data.end_date).toISOString().split('T')[0];
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
        }
      } catch (fetchError) {
        console.error('Error fetching game:', fetchError);
        error.value = error.value || 'Greška pri učitavanju igre';
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

        if (error) throw error;

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

        if (error) throw error;

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
      }
    };

    const removeFromGroup = async (groupId) => {
      if (!groupId || !userStore.user?.id || !game.value?.id) return;
      try {
        await removeGameFromGroup({ user_id: userStore.user.id, group_id: groupId, game_id: game.value.id });
        gameGroups.value = await listGameGroups(game.value.id, userStore.user.id);
      } catch (e) {
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

    const seriesGames = computed(() => {
      if (!game.value?.series_games) return [];
      try {
        return JSON.parse(game.value.series_games);
      } catch {
        return [];
      }
    });

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

    const getPlatforms = () => {
      if (!game.value?.platforms_list) return game.value?.platform || 'N/A';
      try {
        const platforms = JSON.parse(game.value.platforms_list);
        return platforms.join(', ') || game.value?.platform || 'N/A';
      } catch {
        return game.value?.platform || 'N/A';
      }
    };
    
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
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    // Watch for route parameter changes (when user navigates to different game)
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
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
      seriesGames,
      previousGame,
      nextGame,
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
      getPlatforms,
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
      toggleGroupId
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
