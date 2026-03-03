<template>
    <div class="space-y-6 pb-6">
  
      <div class="text-center pt-2 text-start">
        <h1 class="text-3xl font-bold">Importer</h1>
        <p class="text-base-content/60 mt-1 text-sm">Dodaj igre s platformi direktno u Gamenote</p>
      </div>
  
      <div v-if="!userStore.isLoggedIn" class="alert alert-warning shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <span>Prijavi se da bi koristio importere.</span>
        <router-link to="/login" class="btn btn-sm btn-primary ml-auto">Prijava</router-link>
      </div>
  
      <template v-else>
  
        <!-- Platform picker -->
        <div class="flex gap-3 overflow-x-auto pb-1">
          <button
            class="btn flex-col h-auto py-4 px-6 gap-2 min-w-[110px] transition-all"
            :class="activeTab === 'psn' ? 'btn-primary shadow-lg' : 'btn-ghost bg-base-200'"
            @click="activeTab = 'psn'"
          >
            <svg fill="currentColor" viewBox="0 0 32 32" class="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.262 24.248c-2.374-0.681-2.767-2.084-1.69-2.899 0.776-0.51 1.668-0.954 2.612-1.288l0.087-0.027 7.017-2.516v2.89l-5.030 1.839c-0.881 0.339-1.031 0.79-0.299 1.032 0.365 0.093 0.783 0.147 1.214 0.147 0.615 0 1.204-0.109 1.749-0.308l-0.035 0.011 2.422-0.882v2.592c-0.15 0.037-0.32 0.055-0.487 0.091-0.775 0.136-1.667 0.214-2.577 0.214-1.778 0-3.486-0.298-5.078-0.846l0.11 0.033zM18.049 24.544l7.868-2.843c0.893-0.322 1.032-0.781 0.307-1.022-0.363-0.089-0.779-0.14-1.208-0.14-0.622 0-1.22 0.108-1.774 0.305l0.037-0.011-5.255 1.874v-2.983l0.3-0.106c1.050-0.349 2.284-0.62 3.557-0.761l0.083-0.008c0.468-0.050 1.010-0.078 1.559-0.078 1.877 0 3.677 0.331 5.343 0.939l-0.108-0.035c2.309 0.751 2.549 1.839 1.969 2.589-0.559 0.557-1.235 0.998-1.988 1.282l-0.039 0.013-10.677 3.883v-2.869zM12.231 4.248v21.927l4.892 1.576v-18.39c0-0.862 0.38-1.438 0.992-1.238 0.795 0.225 0.95 1.017 0.95 1.881v7.342c3.050 1.491 5.451-0.003 5.451-3.939 0-4.045-1.407-5.842-5.546-7.282-1.785-0.648-4.040-1.294-6.347-1.805l-0.389-0.072z"/>
            </svg>
            <span class="text-xs font-semibold">PlayStation</span>
          </button>
  
          <button class="btn btn-ghost bg-base-200 flex-col h-auto py-4 px-6 gap-2 min-w-[110px] opacity-40 cursor-not-allowed" disabled>
            <svg fill="currentColor" viewBox="0 0 32 32" class="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.102 12.129c0-1.564 1.268-2.831 2.831-2.831s2.831 1.268 2.831 2.831c0 1.564-1.267 2.831-2.831 2.831-1.563 0-2.83-1.267-2.83-2.83v0zM24.691 12.135c0-2.081-1.687-3.768-3.768-3.768s-3.768 1.687-3.768 3.768c0 2.081 1.687 3.768 3.768 3.768 2.080-0.003 3.765-1.688 3.768-3.767v-0zM10.427 23.76l-1.841-0.762c0.524 1.078 1.611 1.808 2.868 1.808 1.317 0 2.448-0.801 2.93-1.943l0.008-0.021c0.155-0.362 0.246-0.784 0.246-1.226 0-1.757-1.424-3.181-3.181-3.181-0.405 0-0.792 0.076-1.148 0.213l0.022-0.007 1.903 0.787c0.852 0.364 1.439 1.196 1.439 2.164 0 1.296-1.051 2.347-2.347 2.347-0.324 0-0.632-0.066-0.913-0.184l0.015 0.006zM15.974 1.004c-7.857 0.001-14.301 6.046-14.938 13.738l-0.004 0.054 8.038 3.322c0.668-0.462 1.495-0.737 2.387-0.737h-0c0.079 0 0.156 0.005 0.235 0.008l3.575-5.176v-0.074c0.003-3.12 2.533-5.648 5.653-5.648 3.122 0 5.653 2.531 5.653 5.653s-2.531 5.653-5.653 5.653h-0.131l-5.094 3.638c0 0.065 0.005 0.131 0.005 0.199 0 2.342-1.899 4.241-4.241 4.241-2.047 0-3.756-1.451-4.153-3.38l-0.005-0.027-5.755-2.383c1.841 6.345 7.601 10.905 14.425 10.905 8.281 0 14.994-6.713 14.994-14.994s-6.713-14.994-14.994-14.994z"/>
            </svg>
            <span class="text-xs font-semibold">Steam</span>
            <span class="badge badge-xs">Uskoro</span>
          </button>
  
          <button class="btn btn-ghost bg-base-200 flex-col h-auto py-4 px-6 gap-2 min-w-[110px] opacity-40 cursor-not-allowed" disabled>
            <svg fill="currentColor" viewBox="0 0 24 24" class="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
              <path d="m24 12c0-.001 0-.001 0-.002 0-3.618-1.606-6.861-4.144-9.054l-.015-.013c-1.91 1.023-3.548 2.261-4.967 3.713l-.004.004c.044.046.087.085.131.132 3.719 4.012 7.106 9.73 6.546 12.471 1.53-1.985 2.452-4.508 2.452-7.246 0-.002 0-.004 0-.006z"/><path d="m12.591 3.955c1.68-1.104 3.699-1.833 5.872-2.022l.048-.003c-1.837-1.21-4.09-1.929-6.511-1.929-2.171 0-4.207.579-5.962 1.591l.058-.031c.658.567 2.837.781 5.484 2.4.143.089.316.142.502.142.189 0 .365-.055.513-.149l-.004.002z"/><path d="m9.166 6.778c.046-.049.093-.09.138-.138-1.17-1.134-2.446-2.174-3.806-3.1l-.099-.064c-.302-.221-.681-.354-1.091-.354-.146 0-.288.017-.425.049l.013-.002c-2.398 2.198-3.896 5.344-3.896 8.84 0 2.909 1.037 5.576 2.762 7.651l-.016-.02c-1.031-2.547 2.477-8.672 6.419-12.862z"/><path d="m12.084 9.198c-3.962 3.503-9.477 8.73-8.632 11.218 2.174 2.213 5.198 3.584 8.542 3.584 3.493 0 6.637-1.496 8.826-3.883l.008-.009c.486-2.618-4.755-7.337-8.744-10.91z"/>
            </svg>
            <span class="text-xs font-semibold">Xbox</span>
            <span class="badge badge-xs">Uskoro</span>
          </button>
        </div>
  
        <!-- PSN panel -->
        <div v-if="activeTab === 'psn'" class="space-y-4">
  
          <!-- ===== PSN SAVED PROFILE CARD ===== -->
          <div v-if="savedUsername" class="card bg-base-200 shadow">
            <div class="card-body p-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
  
                <!-- Avatar + info -->
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="avatar shrink-0">
                    <div class="w-14 h-14 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        :src="psnProfileData?.avatarUrl || `https://placehold.co/56x56/1a1a2e/ffffff?text=${savedUsername.charAt(0).toUpperCase()}`"
                        :alt="savedUsername"
                      />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-lg leading-tight truncate">{{ savedUsername }}</div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 32 32" class="h-3.5 w-3.5 opacity-50" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.262 24.248c-2.374-0.681-2.767-2.084-1.69-2.899 0.776-0.51 1.668-0.954 2.612-1.288l0.087-0.027 7.017-2.516v2.89l-5.030 1.839c-0.881 0.339-1.031 0.79-0.299 1.032 0.365 0.093 0.783 0.147 1.214 0.147 0.615 0 1.204-0.109 1.749-0.308l-0.035 0.011 2.422-0.882v2.592c-0.15 0.037-0.32 0.055-0.487 0.091-0.775 0.136-1.667 0.214-2.577 0.214-1.778 0-3.486-0.298-5.078-0.846l0.11 0.033zM18.049 24.544l7.868-2.843c0.893-0.322 1.032-0.781 0.307-1.022-0.363-0.089-0.779-0.14-1.208-0.14-0.622 0-1.22 0.108-1.774 0.305l0.037-0.011-5.255 1.874v-2.983l0.3-0.106c1.050-0.349 2.284-0.62 3.557-0.761l0.083-0.008c0.468-0.050 1.010-0.078 1.559-0.078 1.877 0 3.677 0.331 5.343 0.939l-0.108-0.035c2.309 0.751 2.549 1.839 1.969 2.589-0.559 0.557-1.235 0.998-1.988 1.282l-0.039 0.013-10.677 3.883v-2.869zM12.231 4.248v21.927l4.892 1.576v-18.39c0-0.862 0.38-1.438 0.992-1.238 0.795 0.225 0.95 1.017 0.95 1.881v7.342c3.050 1.491 5.451-0.003 5.451-3.939 0-4.045-1.407-5.842-5.546-7.282-1.785-0.648-4.040-1.294-6.347-1.805l-0.389-0.072z"/>
                      </svg>
                      <span class="text-xs opacity-50">PlayStation Network</span>
                    </div>
                    <div v-if="psnProfileData?.trophyLevel" class="text-xs opacity-60 mt-0.5">
                      🏆 Trophy Level {{ psnProfileData.trophyLevel }}
                    </div>
                    <div v-if="hasSynced && psnGames.length" class="text-xs opacity-50 mt-0.5">
                      {{ psnGames.length }} igara učitano
                    </div>
                  </div>
                </div>
  
                <!-- Action buttons -->
                <div class="flex flex-wrap gap-2 shrink-0">
                  <button class="btn btn-sm btn-primary gap-1" :disabled="syncLoading" @click="syncPsn">
                    <span v-if="syncLoading" class="loading loading-spinner loading-xs"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Sync
                  </button>
                  <button
                    v-if="hasSynced && selectedCount > 0"
                    class="btn btn-sm btn-success gap-1"
                    :disabled="importLoading"
                    @click="importSelected"
                  >
                    <span v-if="importLoading && !importProgress.startsWith('Sync')" class="loading loading-spinner loading-xs"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Import ({{ selectedCount }})
                  </button>
                  <button class="btn btn-sm btn-error btn-outline gap-1" :disabled="deletingProfile" @click="deletePsnProfile">
                    <span v-if="deletingProfile" class="loading loading-spinner loading-xs"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Obriši
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Username card (prikazuje se samo ako nema savedUsername) -->
          <div v-if="!savedUsername" class="card bg-base-200 shadow">
            <div class="card-body p-4 space-y-3">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <h2 class="font-semibold">PSN Online ID</h2>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <input v-model="psnUsername" class="input input-bordered flex-1" placeholder="npr. SomePlayer123" @keyup.enter="syncPsn"/>
                <button class="btn btn-outline" :disabled="savingUsername || !psnUsername.trim()" @click="savePsnUsername">
                  <span v-if="savingUsername" class="loading loading-spinner loading-sm"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                  </svg>
                  Spremi
                </button>
                <button class="btn btn-primary" :disabled="syncLoading || !psnUsername.trim()" @click="syncPsn">
                  <span v-if="syncLoading" class="loading loading-spinner loading-sm"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Sync
                </button>
              </div>
              <p class="text-xs text-base-content/50 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                PSN profil mora biti <strong class="mx-0.5">javan</strong> da bi sync radio.
              </p>
            </div>
          </div>
  
          <div v-if="syncError" class="alert alert-error shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ syncError }}</span>
          </div>
  
          <div v-if="syncLoading" class="space-y-2">
            <div v-for="i in 6" :key="i" class="skeleton h-20 w-full rounded-xl"></div>
          </div>
  
          <template v-if="!syncLoading && psnGames.length">
  
            <!-- Stats + controls card -->
            <div class="card bg-base-200 shadow">
              <div class="card-body p-3 space-y-3">
  
                <div class="flex flex-wrap gap-2 items-center">
                  <span class="badge badge-lg badge-ghost font-bold">{{ psnGames.length }} igara</span>
                  <span class="badge badge-lg badge-success badge-outline">{{ newCount }} novih</span>
                  <span class="badge badge-lg badge-info badge-outline">{{ existingCount }} postoji</span>
                </div>
  
                <input v-model="filterText" class="input input-sm input-bordered w-full" placeholder="Pretraži igre..."/>
  
                <div class="flex flex-wrap gap-2 items-center">
                  <div class="flex flex-wrap gap-1">
                    <button class="btn btn-xs btn-ghost gap-1" @click="selectAll(true)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                      </svg>
                      Sve nove
                    </button>
                    <button class="btn btn-xs btn-ghost gap-1" @click="selectAll(false)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Poništi nove
                    </button>
                    <div class="divider divider-horizontal mx-0"></div>
                    <button class="btn btn-xs btn-ghost gap-1" @click="selectAllSync(true)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Sve sync
                    </button>
                    <button class="btn btn-xs btn-ghost gap-1" @click="selectAllSync(false)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Poništi sync
                    </button>
                  </div>
                  <div class="ml-auto flex gap-2">
                    <button class="btn btn-sm btn-info gap-1" :disabled="importLoading || updateCount === 0" @click="updateSelected">
                      <span v-if="importLoading && importProgress.startsWith('Sync')" class="loading loading-spinner loading-sm"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Sync ({{ updateCount }})
                    </button>
                    <button class="btn btn-sm btn-success gap-1" :disabled="importLoading || selectedCount === 0" @click="importSelected">
                      <span v-if="importLoading && !importProgress.startsWith('Sync')" class="loading loading-spinner loading-sm"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Import ({{ selectedCount }})
                    </button>
                  </div>
                </div>
  
                <div v-if="importLoading && importTotal > 0" class="space-y-1">
                  <div class="flex justify-between text-xs opacity-60">
                    <span>{{ importProgress }}</span>
                    <span>{{ importDone }}/{{ importTotal }}</span>
                  </div>
                  <progress class="progress progress-success w-full" :value="importDone" :max="importTotal"></progress>
                </div>
  
              </div>
            </div>
  
            <!-- MOBILE cards -->
            <div class="flex flex-col gap-4 lg:hidden">
              <div
                v-for="g in filteredGames" :key="g._key"
                class="card bg-base-200 shadow-md transition-opacity"
                :class="g._exists ? 'opacity-70' : ''"
              >
                <div class="card-body p-4 space-y-3">
                  <div class="flex gap-4 items-start">
                    <div class="flex flex-col gap-1 items-center pt-1 shrink-0">
                      <input v-if="!g._exists" type="checkbox" class="checkbox checkbox-success" v-model="selectedMap[g._key]"/>
                      <input v-else type="checkbox" class="checkbox checkbox-info" v-model="updateMap[g._key]"/>
                      <span class="text-xs opacity-40">{{ g._exists ? 'sync' : 'new' }}</span>
                    </div>
                    <div v-if="g.imageUrl" class="avatar shrink-0">
                      <div class="w-16 h-20 rounded-xl overflow-hidden">
                        <img :src="g.imageUrl" :alt="g.name" loading="lazy" class="object-cover w-full h-full"/>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0 space-y-1.5">
                      <div class="font-bold text-base leading-snug">{{ g.name }}</div>
                      <div class="flex flex-wrap gap-1.5">
                        <span class="badge badge-sm" :class="g.platformCategory === 'ps5_native_game' ? 'badge-primary' : 'badge-ghost'">{{ mapPlatform(g.platformCategory) }}</span>
                        <span v-if="g._exists" class="badge badge-sm badge-info">Postoji</span>
                        <span v-else class="badge badge-sm badge-success badge-outline">Nova</span>
                        <span v-if="g.hoursPlayed != null" class="badge badge-sm badge-ghost">{{ g.hoursPlayed }}h</span>
                        <span v-if="g.trophyPercent != null" class="badge badge-sm badge-warning badge-outline">{{ g.trophyPercent }}% trofeja</span>
                      </div>
                      <div class="text-xs opacity-40" v-if="g.lastPlayed">Zadnje: {{ formatDate(g.lastPlayed) }}</div>
                    </div>
                  </div>
                  <template v-if="!g._exists">
                    <div class="divider my-0"></div>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="flex flex-col gap-1">
                        <span class="text-xs opacity-60 font-medium">Ocjena</span>
                        <div class="rating rating-md">
                          <input v-for="star in [1,2,3,4,5]" :key="star" type="radio"
                            :name="'mob-r-' + g._key" class="mask mask-star-2 bg-orange-400"
                            :value="star"
                            :checked="(gameExtras[g._key] ??= defaultExtras()).rating === star"
                            @change="(gameExtras[g._key] ??= defaultExtras()).rating = star"/>
                        </div>
                      </div>
                      <div class="flex flex-col gap-1">
                        <span class="text-xs opacity-60 font-medium">Status</span>
                        <select class="select select-sm select-bordered w-full" v-model="(gameExtras[g._key] ??= defaultExtras()).status">
                          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                        </select>
                      </div>
                      <div class="flex flex-col gap-1">
                        <span class="text-xs opacity-60 font-medium">Grupa</span>
                        <select class="select select-sm select-bordered w-full" v-model="(gameExtras[g._key] ??= defaultExtras()).groupId">
                          <option :value="null">Bez grupe</option>
                          <option v-for="grp in groups" :key="grp.id" :value="grp.id">{{ grp.name }}</option>
                        </select>
                      </div>
                      <div class="flex flex-col gap-1">
                        <span class="text-xs opacity-60 font-medium">Bilješka</span>
                        <input type="text" class="input input-sm input-bordered w-full" placeholder="Opcionalno..."
                          v-model="(gameExtras[g._key] ??= defaultExtras()).notes"/>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
  
            <!-- DESKTOP table -->
            <div class="hidden lg:block overflow-x-auto rounded-xl">
              <table class="table table-zebra">
                <thead>
                  <tr class="bg-base-300 text-sm">
                    <th class="w-10 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                    </th>
                    <th class="w-10 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-info mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </th>
                    <th>Naziv</th>
                    <th class="w-16">Platf.</th>
                    <th class="w-16">Sati</th>
                    <th class="w-36">Trofeji</th>
                    <th class="w-28">Ocjena</th>
                    <th class="w-28">Status</th>
                    <th class="w-36">Grupa</th>
                    <th class="w-36">Bilješka</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="g in filteredGames" :key="g._key" :class="[g._exists ? 'opacity-70' : '', 'h-16']">
                    <td class="text-center">
                      <input type="checkbox" class="checkbox checkbox-success" v-model="selectedMap[g._key]" :disabled="g._exists"/>
                    </td>
                    <td class="text-center">
                      <input type="checkbox" class="checkbox checkbox-info" v-model="updateMap[g._key]" :disabled="!g._exists"/>
                    </td>
                    <td>
                      <div class="flex items-center gap-3">
                        <div v-if="g.imageUrl" class="avatar shrink-0">
                          <div class="w-10 h-14 rounded-lg overflow-hidden">
                            <img :src="g.imageUrl" :alt="g.name" loading="lazy" class="object-cover w-full h-full"/>
                          </div>
                        </div>
                        <div>
                          <div class="font-semibold text-base leading-tight">{{ g.name }}</div>
                          <div class="text-xs opacity-40 mt-0.5" v-if="g.lastPlayed">{{ formatDate(g.lastPlayed) }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="g.platformCategory === 'ps5_native_game' ? 'badge-primary' : 'badge-ghost'">
                        {{ mapPlatform(g.platformCategory) }}
                      </span>
                    </td>
                    <td class="tabular-nums">{{ g.hoursPlayed != null ? g.hoursPlayed + 'h' : '—' }}</td>
                    <td>
                      <span v-if="g.trophyPercent != null" class="tabular-nums text-sm">
                        {{ g.trophyPercent }}%
                        <span class="opacity-40 text-xs">({{ g.trophiesEarned ?? 0 }}/{{ g.trophiesTotal ?? 0 }})</span>
                      </span>
                      <span v-else class="opacity-30">—</span>
                    </td>
                    <td>
                      <div class="rating rating-sm" v-if="!g._exists">
                        <input v-for="star in [1,2,3,4,5]" :key="star" type="radio"
                          :name="'dt-r-' + g._key" class="mask mask-star-2 bg-orange-400" :value="star"
                          :checked="(gameExtras[g._key] ??= defaultExtras()).rating === star"
                          @change="(gameExtras[g._key] ??= defaultExtras()).rating = star"/>
                      </div>
                      <span v-else class="opacity-30">—</span>
                    </td>
                    <td>
                      <select v-if="!g._exists" class="select select-sm select-bordered w-full"
                        v-model="(gameExtras[g._key] ??= defaultExtras()).status">
                        <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
                      </select>
                      <span v-else class="opacity-30">—</span>
                    </td>
                    <td>
                      <select v-if="!g._exists" class="select select-sm select-bordered w-full"
                        v-model="(gameExtras[g._key] ??= defaultExtras()).groupId">
                        <option :value="null">—</option>
                        <option v-for="grp in groups" :key="grp.id" :value="grp.id">{{ grp.name }}</option>
                      </select>
                      <span v-else class="opacity-30">—</span>
                    </td>
                    <td>
                      <input v-if="!g._exists" type="text" class="input input-sm input-bordered w-full"
                        placeholder="Bilješka..."
                        v-model="(gameExtras[g._key] ??= defaultExtras()).notes"/>
                      <span v-else class="opacity-30">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div v-if="importError" class="alert alert-error shadow">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ importError }}</span>
            </div>
  
            <div v-if="importDoneCount > 0 && !importLoading" class="alert alert-success shadow">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong>{{ importDoneCount }}</strong> igara uspješno importano / ažurirano.</span>
              <router-link class="btn btn-sm btn-outline ml-auto" to="/library">Otvori kolekciju</router-link>
            </div>
  
          </template>
  
          <div v-if="!syncLoading && hasSynced && psnGames.length === 0" class="alert alert-warning shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <span>Nisu pronađene igre. Provjeri je li profil javan i je li username točan.</span>
          </div>
  
        </div>
  
        <!-- Coming soon -->
        <div v-else class="card bg-base-200 shadow">
          <div class="card-body items-center text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-lg font-semibold mt-3">Uskoro dostupno</p>
            <p class="text-base-content/50 text-sm">Ovaj importer je u izradi.</p>
          </div>
        </div>
  
      </template>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useUserStore } from '../stores/user';
  import { supabase } from '../supabase';
  import { getOrCreateCatalogEntry } from '../services/gameCatalog';
  import { useGamesApi } from '../services/gamesApi';
  
  function normalizeTitle(s) {
    return String(s || '').toLowerCase()
      .replace(/[™®©]/g, '').replace(/[:\-–—_]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  const STATUS_OPTIONS = [
    { value: 'backlog',   label: 'Backlog' },
    { value: 'playing',   label: 'Playing' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused',    label: 'Paused' },
    { value: 'dropped',   label: 'Dropped' },
  ];
  
  export default {
    setup() {
      const userStore = useUserStore();
      const gamesApi = useGamesApi();
  
      const activeTab = ref('psn');
      const psnUsername = ref('');
      const savedUsername = ref('');
      const savingUsername = ref(false);
      const deletingProfile = ref(false);
      const psnProfileData = ref(null);
      const syncLoading = ref(false);
      const syncError = ref('');
      const hasSynced = ref(false);
      const psnGames = ref([]);
      const filterText = ref('');
      const selectedMap = ref({});
      const updateMap = ref({});
      const gameExtras = ref({});
      const importLoading = ref(false);
      const importProgress = ref('');
      const importDone = ref(0);
      const importTotal = ref(0);
      const importError = ref('');
      const importDoneCount = ref(0);
      const groups = ref([]);
      const statusOptions = STATUS_OPTIONS;
  
      const defaultExtras = () => ({ rating: 0, notes: '', status: 'completed', groupId: null });
  
      const selectedCount = computed(() => Object.values(selectedMap.value).filter(Boolean).length);
      const updateCount = computed(() => Object.values(updateMap.value).filter(Boolean).length);
      const newCount = computed(() => psnGames.value.filter(g => !g._exists).length);
      const existingCount = computed(() => psnGames.value.filter(g => g._exists).length);
  
      const filteredGames = computed(() => {
        const q = filterText.value.trim().toLowerCase();
        return q ? psnGames.value.filter(g => g.name.toLowerCase().includes(q)) : psnGames.value;
      });
  
      const mapPlatform = (cat) => cat === 'ps5_native_game' ? 'PS5' : cat === 'ps4_game' ? 'PS4' : 'PS';
      const mapPlatformFull = (cat) => cat === 'ps5_native_game' ? 'PlayStation 5' : cat === 'ps4_game' ? 'PlayStation 4' : 'PlayStation';
      const formatDate = (iso) => { try { return new Date(iso).toLocaleDateString('hr-HR'); } catch { return iso; } };
  
      const loadGroups = async () => {
        const userId = userStore.user?.id;
        if (!userId) return;
        const { data } = await supabase.from('groups').select('id, name').eq('user_id', userId).order('name');
        groups.value = data || [];
      };
  
      const savePsnUsername = async () => {
        syncError.value = '';
        const value = psnUsername.value.trim();
        if (!value) return;
        try {
          savingUsername.value = true;
          const { error } = await supabase.auth.updateUser({ data: { psn_username: value } });
          if (error) throw error;
          await userStore.fetchUser();
          savedUsername.value = value;
        } catch (e) {
          syncError.value = e?.message || 'Greška pri spremanju.';
        } finally {
          savingUsername.value = false;
        }
      };
  
      const deletePsnProfile = async () => {
        syncError.value = '';
        try {
          deletingProfile.value = true;
          const { error } = await supabase.auth.updateUser({ data: { psn_username: '' } });
          if (error) throw error;
          await userStore.fetchUser();
          savedUsername.value = '';
          psnUsername.value = '';
          psnProfileData.value = null;
          psnGames.value = [];
          hasSynced.value = false;
          selectedMap.value = {};
          updateMap.value = {};
          importDoneCount.value = 0;
        } catch (e) {
          syncError.value = e?.message || 'Greška pri brisanju profila.';
        } finally {
          deletingProfile.value = false;
        }
      };
  
      const fetchExistingTitles = async () => {
        const userId = userStore.user?.id;
        if (!userId) return new Set();
        const { data } = await supabase.from('games').select('title').eq('user_id', userId);
        return new Set((data || []).map(x => normalizeTitle(x.title)));
      };
  
      const markExisting = async () => {
        const existingSet = await fetchExistingTitles();
        psnGames.value = psnGames.value.map(g => {
          const key = g.psnTitleId ? String(g.psnTitleId) : normalizeTitle(g.name);
          if (!gameExtras.value[key]) gameExtras.value[key] = defaultExtras();
          return { ...g, _key: key, _exists: existingSet.has(normalizeTitle(g.name)) };
        });
        const nextSelected = {}, nextUpdate = {};
        for (const g of psnGames.value) {
          nextSelected[g._key] = !g._exists;
          nextUpdate[g._key] = g._exists;
        }
        selectedMap.value = nextSelected;
        updateMap.value = nextUpdate;
      };
  
      const syncPsn = async () => {
        syncError.value = '';
        importError.value = '';
        importDoneCount.value = 0;
        filterText.value = '';
        const value = psnUsername.value.trim();
        if (!value) return;
        try {
          syncLoading.value = true;
          const res = await fetch('/.netlify/functions/psn-import', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ psnUsername: value })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'PSN sync nije uspio.');
          psnGames.value = data.games || [];
          if (data.profile) psnProfileData.value = data.profile;
          hasSynced.value = true;
          await markExisting();
        } catch (e) {
          syncError.value = e?.message || 'Greška pri PSN syncu.';
        } finally {
          syncLoading.value = false;
        }
      };
  
      const selectAll = (value) => {
        const next = { ...selectedMap.value };
        for (const g of psnGames.value) { if (!g._exists) next[g._key] = value; }
        selectedMap.value = next;
      };
  
      const selectAllSync = (value) => {
        const next = { ...updateMap.value };
        for (const g of psnGames.value) { if (g._exists) next[g._key] = value; }
        updateMap.value = next;
      };
  
      const importSelected = async () => {
        importError.value = '';
        importDoneCount.value = 0;
        importProgress.value = '';
        importDone.value = 0;
        importTotal.value = 0;
        try {
          importLoading.value = true;
          const userId = userStore.user?.id;
          if (!userId) throw new Error('Nema user_id.');
          const toImport = psnGames.value.filter(g => selectedMap.value[g._key] && !g._exists);
          if (!toImport.length) return;
          importTotal.value = toImport.length;
          let done = 0;
  
          for (const g of toImport) {
            importProgress.value = `Importiram: ${g.name}`;
            importDone.value = done;
            const extras = gameExtras.value[g._key] || defaultExtras();
  
            let gameData = {
              user_id: userId,
              title: g.name,
              platform: mapPlatformFull(g.platformCategory),
              play_time: g.hoursPlayed != null ? Math.round(g.hoursPlayed) : null,
              rating: extras.rating > 0 ? extras.rating : null,
              notes: extras.notes || '',
              start_date: g.firstPlayed || null,
              end_date: extras.status === 'completed' ? (g.lastPlayed || null) : null,
              status: extras.status || 'completed',
              currently_playing: extras.status === 'playing',
              progress_mode: 'trophies_psn',
              progress_value: g.trophiesEarned != null ? Math.round(g.trophiesEarned) : null,
              progress_total: g.trophiesTotal != null ? Math.round(g.trophiesTotal) : null,
              progress_unit: 'trophies',
              progress_source: 'psn',
              achievement_percent: g.trophyPercent != null ? Math.round(g.trophyPercent) : null,
              game_api_id: null,
              image_url: g.imageUrl ?? null,
              background_image: g.imageUrl ?? null
            };
  
            try {
              const searchResults = await gamesApi.searchGames(g.name);
              const firstResult = searchResults?.results?.[0];
              if (firstResult) {
                const details = await gamesApi.getGameDetails(firstResult.id);
                if (details) {
                  gameData = {
                    ...gameData,
                    title: details.name || g.name,
                    genre: details.genres?.map(x => x.name).join(', ') || null,
                    publisher: details.publishers?.map(x => x.name).join(', ') || null,
                    game_api_id: String(details.id),
                    image_url: details.background_image || g.imageUrl || null,
                    background_image: details.background_image || g.imageUrl || null,
                    description: details.description_raw || null,
                    metacritic_score: details.metacritic || null,
                    esrb_rating: details.esrb_rating?.name || null,
                    release_date: details.released || null,
                    website_url: details.website || null,
                    developers: JSON.stringify(details.developers?.map(d => d.name) || []),
                    genres_list: JSON.stringify(details.genres?.map(x => x.name) || []),
                    platforms_list: JSON.stringify(details.platforms?.map(p => p.platform.name) || []),
                    publishers_list: JSON.stringify(details.publishers?.map(x => x.name) || [])
                  };
                  try {
                    const screenshots = await gamesApi.getGameScreenshots(firstResult.id);
                    gameData.screenshot_urls = JSON.stringify(screenshots?.map(s => s.image) || []);
                  } catch { /* nije kritično */ }
                  try {
                    const seriesData = await gamesApi.getGameSeries(firstResult.id);
                    const seriesGames = seriesData?.results || [];
                    if (seriesGames.length > 0) {
                      gameData.series_games = JSON.stringify(
                        seriesGames.map(sg => ({
                          id: sg.id,
                          name: sg.name,
                          released: sg.released,
                          background_image: sg.background_image
                        }))
                      );
                    }
                  } catch { /* nije kritično */ }
                }
              }
            } catch { /* RAWG fallback */ }
  
            // ── game_catalog helper ──
            if (gameData.game_api_id) {
              const staticData = {
                title: gameData.title ?? null,
                description: gameData.description ?? null,
                background_image: gameData.background_image ?? null,
                release_date: gameData.release_date ?? null,
                metacritic_score: gameData.metacritic_score ?? null,
                esrb_rating: gameData.esrb_rating ?? null,
                website_url: gameData.website_url ?? null,
                genre: gameData.genre ?? null,
                publisher: gameData.publisher ?? null,
                developers: gameData.developers ?? null,
                genres_list: gameData.genres_list ?? null,
                platforms_list: gameData.platforms_list ?? null,
                publishers_list: gameData.publishers_list ?? null,
                screenshot_urls: gameData.screenshot_urls ?? null,
                series_games: gameData.series_games ?? null,
              };
              gameData.catalog_id = await getOrCreateCatalogEntry(gameData.game_api_id, staticData);
            }

            const { data: inserted, error } = await supabase.from('games').insert([gameData]).select('id').single();
            if (error) throw new Error(`${g.name}: ${error.message}`);
  
            if (extras.groupId && inserted?.id) {
              await supabase.from('game_groups').insert([{
                user_id: userId,
                game_id: inserted.id,
                group_id: extras.groupId
              }]).then(() => {}).catch(() => {});
            }
  
            done++;
            importDone.value = done;
          }
  
          importDoneCount.value = done;
          importProgress.value = '';
          importTotal.value = 0;
          await markExisting();
        } catch (e) {
          importError.value = e?.message || 'Greška pri importu.';
          importProgress.value = '';
          importTotal.value = 0;
        } finally {
          importLoading.value = false;
        }
      };
  
      const updateSelected = async () => {
        importError.value = '';
        importDoneCount.value = 0;
        importProgress.value = '';
        importDone.value = 0;
        importTotal.value = 0;
        try {
          importLoading.value = true;
          const userId = userStore.user?.id;
          if (!userId) throw new Error('Nema user_id.');
          const toUpdate = psnGames.value.filter(g => updateMap.value[g._key] && g._exists);
          if (!toUpdate.length) return;
          importTotal.value = toUpdate.length;
          let done = 0;
          for (const g of toUpdate) {
            importProgress.value = `Sync: ${g.name}`;
            importDone.value = done;
            const { error } = await supabase.from('games').update({
              play_time: g.hoursPlayed != null ? Math.round(g.hoursPlayed) : null,
              achievement_percent: g.trophyPercent != null ? Math.round(g.trophyPercent) : null,
              progress_value: g.trophiesEarned != null ? Math.round(g.trophiesEarned) : null,
              progress_total: g.trophiesTotal != null ? Math.round(g.trophiesTotal) : null,
              progress_mode: 'trophies_psn',
              progress_unit: 'trophies',
              progress_source: 'psn',
              updated_at: new Date().toISOString()
            }).eq('user_id', userId).ilike('title', g.name);
            if (error) throw new Error(`${g.name}: ${error.message}`);
            done++;
            importDone.value = done;
          }
          importDoneCount.value = done;
          importProgress.value = '';
          importTotal.value = 0;
        } catch (e) {
          importError.value = e?.message || 'Greška pri ažuriranju.';
          importProgress.value = '';
          importTotal.value = 0;
        } finally {
          importLoading.value = false;
        }
      };
  
      onMounted(async () => {
  await userStore.fetchUser();
  const saved = userStore.user?.user_metadata?.psn_username || '';
  psnUsername.value = saved;
  savedUsername.value = saved;
  await loadGroups();

  if (saved) {
    try {
      const res = await fetch('/.netlify/functions/psn-import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ psnUsername: saved })
      });
      const data = await res.json();
      if (res.ok && data.profile) psnProfileData.value = data.profile;
      if (res.ok && data.games?.length) {
        psnGames.value = data.games;
        hasSynced.value = true;
        await markExisting();
      }
    } catch { /* fallback na inicijal */ }
  }
});

  
      return {
        userStore, activeTab, psnUsername, savedUsername, savingUsername,
        deletingProfile, psnProfileData,
        syncLoading, syncError, hasSynced, psnGames, filterText, filteredGames,
        selectedMap, updateMap, gameExtras, groups, statusOptions,
        selectedCount, updateCount, newCount, existingCount,
        importLoading, importProgress, importDone, importTotal, importError, importDoneCount,
        mapPlatform, formatDate, defaultExtras,
        savePsnUsername, deletePsnProfile, syncPsn, selectAll, selectAllSync, importSelected, updateSelected
      };
    }
  };
  </script>
  