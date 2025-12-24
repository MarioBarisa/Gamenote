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

    <div v-else-if="!editMode">
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

      <div class="flex flex-col lg:flex-row gap-4 mb-6">
        <div class="flex-none">
          <div class="card bg-base-200 shadow-xl w-full lg:w-80">
            <figure>
              <img :src="game.background_image || game.image_url || 'https://placehold.co/600x400?text=No+Image'" :alt="game.title" class="w-full h-auto" />
            </figure>
            <div class="card-body p-4">
              <h2 class="card-title text-lg sm:text-xl">{{ game.title }}</h2>
              
              <div v-if="gameStatus" class="mt-1 mb-2">
                <span class="badge text-xs p-2 font-semibold" :class="statusBadgeClass">
                  {{ statusBadgeText }}
                </span>
              </div>
              <p><strong>Platforma:</strong> {{ getPlatforms() }}</p>
              <p><strong>Žanr:</strong> {{ getGenres() }}</p>
              <p><strong>Izdavač:</strong> {{ getPublishers() }}</p>

              <div class="mt-2" v-if="game.metacritic_score">
                <p><strong>Metacritic ocjena:</strong></p>
                <div class="radial-progress font-bold m-2" 
                  :class="getMetacriticColorClass(game.metacritic_score)"
                  :style="`--value:${game.metacritic_score || 0}`" 
                  :aria-valuenow="game.metacritic_score" 
                  role="progressbar">{{ game.metacritic_score }} / 100</div>
              </div>

              <div class="mt-2">
                <p><strong>Vaša ocjena:</strong></p>
                <div class="flex items-center">
                  <div class="flex">
                    <template v-for="star in 5" :key="star">
                      <svg class="w-4 h-4 sm:w-5 sm:h-5" 
                           :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'"
                           fill="currentColor" 
                           viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </template>
                  </div>
                  <span class="ml-2 text-sm opacity-70">{{ game.rating || 0 }}/5</span>
                </div>
              </div>

              <div class="mt-2" v-if="game.play_time">
                <p><strong>Vrijeme igranja:</strong> {{ game.play_time }} sati</p>
              </div>

              <div class="mt-4" v-if="progressMode && (progressMode.kind === 'ratio' || progressMode.kind === 'count') && game.progress_value != null && game.progress_total != null">
                <div class="card bg-gradient-to-br from-blue-500/10 to-pink-500/10 border border-blue-500/20">
                  <div class="card-body p-4">
                    <p class="text-sm font-bold">{{ progressMode.label }}</p>
                    <div class="mt-3 space-y-1">
                      <div class="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all" 
                          :style="{ width: `${progressPercent}%` }"
                        ></div>
                      </div>
                      <div class="flex justify-between items-center text-xs opacity-75 mt-1">
                        <span><strong>{{ validatedProgressValue }}/{{ game.progress_total }} {{ progressMode.defaultUnit }}</strong></span>
                        <span>{{ progressPercent }}%</span>
                      </div>
                    </div>
                    <div class="mt-3 text-sm space-y-1">
                      <p v-if="remainingCount > 0"><strong>Nedostaje:</strong> {{ remainingCount }} {{ progressMode.defaultUnit }}</p>
                      <p v-else class="text-success font-bold">✨ Sve {{ progressMode.defaultUnit }} zaključene!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-actions justify-between mt-4 flex-col sm:flex-row gap-2">
                <button @click="enterEditMode" class="btn btn-primary w-full sm:w-auto">Uredi</button>
                <button @click="confirmDelete" class="btn btn-error w-full sm:w-auto">Obriši</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="card bg-base-200 shadow-xl h-full">
            <div class="mt-8">
              <h2 class="text-2xl font-bold mb-4 ml-4">Dodatne informacije</h2>

              <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <h3 class="text-lg font-bold">Opis</h3>
                      <p>{{ game.description || game.notes || 'Nema opisa.' }}</p>
                    </div>
                  </div>

                  <div class="mt-6" v-if="seriesGames.length > 0">
                    <h3 class="text-lg font-bold mb-2">Serija igara</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                      <div v-if="previousGame" class="card bg-base-100 shadow-sm">
                        <figure class="px-4 pt-4">
                          <img 
                            :src="previousGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                            :alt="previousGame.name" 
                            class="rounded-lg w-full h-32 object-cover"
                          />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ previousGame.name }}</h4>
                          <p class="text-xs text-gray-500">Prethodna igra • {{ formatDate(previousGame.released) }}</p>
                        </div>
                      </div>
                      
                      <div v-if="nextGame" class="card bg-base-100 shadow-sm">
                        <figure class="px-4 pt-4">
                          <img 
                            :src="nextGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                            :alt="nextGame.name" 
                            class="rounded-lg w-full h-32 object-cover"
                          />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ nextGame.name }}</h4>
                          <p class="text-xs text-gray-500">Sljedeća igra • {{ formatDate(nextGame.released) }}</p>
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
                  </div>

                  <div class="mt-6" v-if="screenshots.length > 0">
                    <h3 class="text-lg font-bold mb-2">Slike igre</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div v-for="(screenshot, index) in screenshots" :key="index" class="relative">
                        <img 
                          :src="screenshot" 
                          :alt="`Screenshot ${index + 1}`" 
                          class="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          @click="openScreenshotModal(index)"
                        />
                      </div>
                    </div>
                  </div>

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

                  <div class="mt-6">
                    <h3 class="text-lg font-bold mb-2">Grupe</h3>
                    <div v-if="gameGroups.length === 0" class="text-sm opacity-70">Nema dodanih grupa.</div>
                    <div class="flex flex-wrap gap-2 mb-3">
                      <span v-for="gg in gameGroups" :key="gg.id" class="badge badge-outline">
                        <router-link :to="`/groups/${gg.groups?.id}`" class="link link-hover">{{ gg.groups?.name }}</router-link>
                        <button class="ml-2 text-error" @click="removeFromGroup(gg.groups?.id)">✕</button>
                      </span>
                    </div>
                    <div class="flex gap-2 items-center">
                      <select v-model="newGroupId" class="select select-bordered select-sm w-full max-w-xs">
                        <option value="" disabled>Odaberi grupu</option>
                        <option v-for="g in allGroups" :key="g.id" :value="g.id">{{ g.name }} ({{ g.type }})</option>
                      </select>
                      <button class="btn btn-sm btn-primary" @click="assignToGroup">Dodaj</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="text-2xl font-bold mb-6 text-center">Uredi igru</h2>
          
          <form @submit.prevent="saveGame" class="game-form">
            <div class="form-control mb-6">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="editForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control mb-6">
              <label class="label font-medium">Platforma</label>
              <select v-model="editForm.platform" class="select select-bordered" required>
                <option value="" disabled>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>

            <div class="form-control mb-6">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model.number="editForm.play_time" class="input input-bordered" min="0" />
            </div>

            <div class="form-control mb-6">
              <label class="label font-medium">Ocjena (1-5)</label>
              <div class="rating rating-lg">
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model.number="editForm.rating" />
                <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model.number="editForm.rating" />
              </div>
            </div>

            <div class="form-control mb-6">
              <label class="label font-medium">Status</label>
              <select v-model="editForm.status" class="select select-bordered">
                <option value="" disabled>Odaberi status</option>
                <option v-for="s in GAME_STATUS" :key="s.key" :value="s.key">{{ s.label }}</option>
              </select>
            </div>

            <div class="form-control mb-6">
              <label class="label font-medium">Game Progression</label>
              <select v-model="editForm.progress_mode" class="select select-bordered">
                <option value="" disabled>Odaberi način praćenja</option>
                <option v-for="mode in PROGRESS_MODES" :key="mode.key" :value="mode.key">{{ mode.label }}</option>
              </select>
              <p v-if="selectedProgressMode" class="text-xs opacity-70 mt-1">
                <span v-if="selectedProgressMode.key.includes('achievements') || selectedProgressMode.key.includes('trophies')">
                  ✨ Broj {{ selectedProgressMode.defaultUnit }} automatski dohvaćen iz RAWG baze. Ako je prazan, unesi ga ispod.
                </span>
                <span v-else>
                  Unesi vrijednosti prema načinu praćenja (postotak 0-100, vrijednost/ukupno za omjer, #rang za leaderboard).
                </span>
              </p>
            </div>

            <template v-if="selectedProgressMode">
              <!-- SAMO ZA ACHIEVEMENTS/TROPHIES - Posebna sekcija s jasnom uputom i alert-om -->
              <div v-if="selectedProgressMode.key.includes('achievements') || selectedProgressMode.key.includes('trophies')" class="card bg-base-300/50 border border-warning/30 p-4 space-y-4 mb-6">
                <div class="alert alert-warning text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="shrink-0 h-6 w-6"><path fill="currentColor" d="M8.15 21.75L6.7 19.3l-2.75-.6q-.375-.075-.6-.387t-.175-.688L3.45 14.8l-1.875-2.15q-.25-.275-.25-.65t.25-.65L3.45 9.2l-.275-2.825q-.05-.375.175-.688t.6-.387l2.75-.6l1.45-2.45q.2-.325.55-.438t.7.038l2.6 1.1l2.6-1.1q.35-.15.7-.038t.55.438L17.3 4.7l2.75.6q.375.075.6.388t.175.687L20.55 9.2l1.875 2.15q.25.275.25.65t-.25.65L20.55 14.8l.275 2.825q.05.375-.175.688t-.6.387l-2.75.6l-1.45 2.45q-.2.325-.55.438t-.7-.038l-2.6-1.1l-2.6 1.1q-.35.15-.7.038t-.55-.438m1.3-1.8l2.55-1.1l2.6 1.1l1.4-2.4l2.75-.65l-.25-2.8l1.85-2.1l-1.85-2.15l.25-2.8l-2.75-.6l-1.45-2.4L12 5.15l-2.6-1.1L8 6.45l-2.75.6l.25 2.8L3.65 12l1.85 2.1l-.25 2.85l2.75.6zM12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13"/></svg>
                  <div>
                    <h3 class="font-bold">Brojevi iz RAWG baze mogu biti neprecizni!</h3>
                    <div class="text-xs">Ako je prazan, unesi broj koji si provjeiro ručno.</div>
                  </div>
                </div>

                <!-- UKUPAN BROJ TROFEJA/ACHIEVEMENTA -->
                <div class="form-control">
                  <label class="label font-medium">
                    Ukupan broj {{ selectedProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_total" 
                    class="input input-bordered input-lg font-bold" 
                    min="0"
                    placeholder="npr. 50"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">Koliko {{ selectedProgressMode.defaultUnit }} ima ukupno u igri?</span>
                  </label>
                </div>

                <!-- BROJ KOJI JE KORISNIK OSTVARIO -->
                <div class="form-control">
                  <label class="label font-medium">
                    Broj {{ selectedProgressMode.defaultUnit }} koje si ti ostvario/a
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_value" 
                    class="input input-bordered input-lg font-bold text-success" 
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
                      <span v-else class="text-warning">postavi ukupan broj prvi</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium">Jedinica</label>
                  <input type="text" v-model="editForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>

              <!-- POKEDEX - Dvije vrijednosti bez alert-a (ne dohvaća se iz RAWG) -->
              <div v-else-if="selectedProgressMode.key === 'pokedex'" class="card bg-base-300/50 border border-info/30 p-4 space-y-4 mb-6">
                <!-- KOLIKO POKEMONA JE KORISNIK UHVATIO -->
                <div class="form-control">
                  <label class="label font-medium">
                    Koliko pokemona si ti uhvatio/a
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_value" 
                    class="input input-bordered input-lg font-bold text-success" 
                    min="0"
                    :max="editForm.progress_total || undefined"
                    placeholder="npr. 150"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">Koliko pokemona si već uhvatio/a u ovoj igri?</span>
                  </label>
                </div>

                <!-- KOLIKO POKEMONA IMA U IGRI -->
                <div class="form-control">
                  <label class="label font-medium">
                    Koliko pokemona ima u igri
                  </label>
                  <input 
                    type="number" 
                    v-model.number="editForm.progress_total" 
                    class="input input-bordered input-lg font-bold" 
                    min="0"
                    placeholder="npr. 251"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">Ukupno koliko različitih pokemona je u ovoj igri?</span>
                  </label>
                </div>

                <!-- PROGRESS % -->
                <div class="form-control">
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="editForm.progress_total > 0">
                        {{ Math.round((editForm.progress_value / editForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupan broj pokemona prvi</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium">Jedinica</label>
                  <input type="text" v-model="editForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>

              <!-- ZA OSTALE PROGRESS MODE-OVE -->
              <template v-else>
                <div class="form-control mb-6" v-if="selectedProgressMode.kind === 'count' || selectedProgressMode.kind === 'rank'">
                  <label class="label font-medium">Vrijednost</label>
                  <input type="number" v-model.number="editForm.progress_value" class="input input-bordered" min="0" />
                </div>
                <div class="form-control mb-6" v-if="selectedProgressMode.requiresTotal">
                  <label class="label font-medium">Ukupno</label>
                  <input type="number" v-model.number="editForm.progress_total" class="input input-bordered" min="0" />
                </div>
                <div class="form-control mb-6">
                  <label class="label font-medium">Jedinica</label>
                  <input type="text" v-model="editForm.progress_unit" class="input input-bordered" :placeholder="selectedProgressMode.defaultUnit || 'unit'" readonly />
                </div>
              </template>
            </template>

            <div class="form-control mb-6">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="editForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control mb-6">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="editForm.end_date" class="input input-bordered" />
            </div>
            
            <div class="form-control mb-6">
              <label class="label font-medium">Bilješke</label>
              <textarea v-model="editForm.notes" class="textarea textarea-bordered h-32"></textarea>
            </div>

            <div class="divider mt-6">Grupe/Kolekcije</div>

            <div class="form-control mb-6">
              <label class="label cursor-pointer justify-start gap-4">
                <input type="checkbox" v-model="showGroupSelector" class="checkbox" />
                <span class="label-text font-medium">Dodaj u grupe/kolekcije</span>
              </label>
            </div>

            <div class="form-control mb-6" v-if="showGroupSelector">
              <label class="label font-medium">Odaberi grupe</label>
              <div v-if="groupsLoading" class="text-sm opacity-70">Učitavam grupe...</div>
              <div v-else-if="allGroups.length === 0" class="text-sm opacity-70">Nema dostupnih grupa. Kreiraj prvu!</div>
              <div v-else class="space-y-2">
                <label v-for="group in allGroups" :key="group.id" class="label cursor-pointer flex items-center justify-start gap-3 p-3 border border-base-300 rounded-lg hover:bg-base-300/30 transition-colors">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm" 
                    :checked="editForm.group_ids.includes(group.id)"
                    @change="toggleGroupId(group.id)"
                  />
                  <span class="label-text flex-1">
                    <span class="font-medium">{{ group.name }}</span>
                    <span class="text-xs opacity-70 block">({{ group.type }})</span>
                  </span>
                </label>
              </div>
            </div>

            <div class="flex gap-4 mt-8 justify-center">
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
