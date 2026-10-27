<template>
    <div class="space-y-6 pb-6">
  
      <div class="pt-2 text-start">
        <h1 class="text-3xl font-bold">Importer</h1>
        <p class="text-base-content/60 mt-1 text-sm">Dodaj igre s platformi direktno u Gamenote</p>
      </div>

      <div v-if="toast.show" class="toast toast-top toast-end z-[100]">
        <div class="alert shadow-lg" :class="toast.type === 'success' ? 'alert-success' : 'alert-error'">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
  
      <div v-if="!userStore.isLoggedIn" class="alert alert-warning shadow">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <span>Prijavi se da bi koristio importere.</span>
        <router-link to="/login" class="btn btn-sm btn-primary ml-auto">Prijava</router-link>
      </div>
  
      <template v-else>
  
        <!-- Platforme i alati -->
        <div>
          <div role="tablist" class="tabs tabs-box gap-1 max-w-full overflow-x-auto overflow-y-clip" aria-label="Importeri i alati">
            <button role="tab" class="tab tab-lifted gap-1.5" :class="activeTab === 'psn' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'text-base-content/60 hover:text-base-content'" :aria-selected="activeTab === 'psn'" @click="activeTab = 'psn'" aria-label="PlayStation" :title="isConnected ? `PlayStation · povezan profil: ${psnProfileData?.onlineId || 'PSN'}` : 'PlayStation · profil nije povezan'" :aria-describedby="isConnected ? 'psn-connection-status' : undefined">
              <svg fill="currentColor" viewBox="0 0 32 32" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.262 24.248c-2.374-0.681-2.767-2.084-1.69-2.899 0.776-0.51 1.668-0.954 2.612-1.288l0.087-0.027 7.017-2.516v2.89l-5.030 1.839c-0.881 0.339-1.031 0.79-0.299 1.032 0.365 0.093 0.783 0.147 1.214 0.147 0.615 0 1.204-0.109 1.749-0.308l-0.035 0.011 2.422-0.882v2.592c-0.15 0.037-0.32 0.055-0.487 0.091-0.775 0.136-1.667 0.214-2.577 0.214-1.778 0-3.486-0.298-5.078-0.846l0.11 0.033zM18.049 24.544l7.868-2.843c0.893-0.322 1.032-0.781 0.307-1.022-0.363-0.089-0.779-0.14-1.208-0.14-0.622 0-1.22 0.108-1.774 0.305l0.037-0.011-5.255 1.874v-2.983l0.3-0.106c1.050-0.349 2.284-0.62 3.557-0.761l0.083-0.008c0.468-0.050 1.010-0.078 1.559-0.078 1.877 0 3.677 0.331 5.343 0.939l-0.108-0.035c2.309 0.751 2.549 1.839 1.969 2.589-0.559 0.557-1.235 0.998-1.988 1.282l-0.039 0.013-10.677 3.883v-2.869zM12.231 4.248v21.927l4.892 1.576v-18.39c0-0.862 0.38-1.438 0.992-1.238 0.795 0.225 0.95 1.017 0.95 1.881v7.342c3.050 1.491 5.451-0.003 5.451-3.939 0-4.045-1.407-5.842-5.546-7.282-1.785-0.648-4.040-1.294-6.347-1.805l-0.389-0.072z"/>
              </svg>
              <span class="font-semibold text-xs sm:text-sm"><span class="sm:hidden">PSN</span><span class="hidden sm:inline">PlayStation</span></span>
              <svg v-if="isConnected" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 shrink-0 text-success" data-testid="psn-connected" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="m8 12 3 3 5-6" /></svg>
              <span v-if="isConnected" id="psn-connection-status" class="sr-only">Povezan profil: {{ psnProfileData?.onlineId || 'PSN' }}</span>
            </button>
            <button role="tab" class="tab tab-lifted gap-1.5" :class="activeTab === 'steam' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'text-base-content/60 hover:text-base-content'" :aria-selected="activeTab === 'steam'" @click="activeTab = 'steam'" aria-label="Steam" :title="steamConnection.connected ? `Steam · povezan profil: ${steamConnection.name}` : 'Steam · profil nije povezan'" :aria-describedby="steamConnection.connected ? 'steam-connection-status' : undefined">
              <svg fill="currentColor" viewBox="0 0 32 32" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.102 12.129c0-1.564 1.268-2.831 2.831-2.831s2.831 1.268 2.831 2.831c0 1.564-1.267 2.831-2.831 2.831-1.563 0-2.83-1.267-2.83-2.83v0zM24.691 12.135c0-2.081-1.687-3.768-3.768-3.768s-3.768 1.687-3.768 3.768c0 2.081 1.687 3.768 3.768 3.768 2.080-0.003 3.765-1.688 3.768-3.767v-0zM10.427 23.76l-1.841-0.762c0.524 1.078 1.611 1.808 2.868 1.808 1.317 0 2.448-0.801 2.93-1.943l0.008-0.021c0.155-0.362 0.246-0.784 0.246-1.226 0-1.757-1.424-3.181-3.181-3.181-0.405 0-0.792 0.076-1.148 0.213l0.022-0.007 1.903 0.787c0.852 0.364 1.439 1.196 1.439 2.164 0 1.296-1.051 2.347-2.347 2.347-0.324 0-0.632-0.066-0.913-0.184l0.015 0.006zM15.974 1.004c-7.857 0.001-14.301 6.046-14.938 13.738l-0.004 0.054 8.038 3.322c0.668-0.462 1.495-0.737 2.387-0.737h-0c0.079 0 0.156 0.005 0.235 0.008l3.575-5.176v-0.074c0.003-3.12 2.533-5.648 5.653-5.648 3.122 0 5.653 2.531 5.653 5.653s-2.531 5.653-5.653 5.653h-0.131l-5.094 3.638c0 0.065 0.005 0.131 0.005 0.199 0 2.342-1.899 4.241-4.241 4.241-2.047 0-3.756-1.451-4.153-3.38l-0.005-0.027-5.755-2.383c1.841 6.345 7.601 10.905 14.425 10.905 8.281 0 14.994-6.713 14.994-14.994s-6.713-14.994-14.994-14.994z"/>
              </svg>
              <span class="font-semibold text-xs sm:text-sm">Steam</span>
              <svg v-if="steamConnection.connected" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 shrink-0 text-success" data-testid="steam-connected" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="m8 12 3 3 5-6" /></svg>
              <span v-if="steamConnection.connected" id="steam-connection-status" class="sr-only">Povezan profil: {{ steamConnection.name }}</span>
            </button>
            <button role="tab" class="tab tab-lifted gap-1.5 opacity-40 cursor-not-allowed" disabled>
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="m24 12c0-.001 0-.001 0-.002 0-3.618-1.606-6.861-4.144-9.054l-.015-.013c-1.91 1.023-3.548 2.261-4.967 3.713l-.004.004c.044.046.087.085.131.132 3.719 4.012 7.106 9.73 6.546 12.471 1.53-1.985 2.452-4.508 2.452-7.246 0-.002 0-.004 0-.006z"/><path d="m12.591 3.955c1.68-1.104 3.699-1.833 5.872-2.022l.048-.003c-1.837-1.21-4.09-1.929-6.511-1.929-2.171 0-4.207.579-5.962 1.591l.058-.031c.658.567 2.837.781 5.484 2.4.143.089.316.142.502.142.189 0 .365-.055.513-.149l-.004.002z"/><path d="m9.166 6.778c.046-.049.093-.09.138-.138-1.17-1.134-2.446-2.174-3.806-3.1l-.099-.064c-.302-.221-.681-.354-1.091-.354-.146 0-.288.017-.425.049l.013-.002c-2.398 2.198-3.896 5.344-3.896 8.84 0 2.909 1.037 5.576 2.762 7.651l-.016-.02c-1.031-2.547 2.477-8.672 6.419-12.862z"/><path d="m12.084 9.198c-3.962 3.503-9.477 8.73-8.632 11.218 2.174 2.213 5.198 3.584 8.542 3.584 3.493 0 6.637-1.496 8.826-3.883l.008-.009c.486-2.618-4.755-7.337-8.744-10.91z"/>
              </svg>
              <span class="font-bold hidden sm:inline">Xbox</span>
              <span class="badge badge-xs badge-ghost hidden sm:inline-flex">Uskoro</span>
            </button>
            <button role="tab" class="tab tab-lifted gap-1.5" :class="activeTab === 'migrate' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'text-base-content/60 hover:text-base-content'" :aria-selected="activeTab === 'migrate'" @click="activeTab = 'migrate'" title="Migracija podataka">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/></svg>
              <span class="font-bold hidden sm:inline">Migracija podataka</span>
            </button>
            <button role="tab" class="tab tab-lifted gap-1.5" :class="activeTab === 'backup' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'text-base-content/60 hover:text-base-content'" :aria-selected="activeTab === 'backup'" @click="activeTab = 'backup'" title="Sigurnosna kopija">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span class="font-bold hidden sm:inline">Sigurnosna kopija</span>
            </button>
            <button role="tab" class="tab tab-lifted gap-1.5 tooltip tooltip-bottom" data-tip="Osvježava metapodatke svih igara u biblioteci (naslovnicu, opis, žanrove, datume, ocjene, snimke zaslona) iz Gamenote API-a, bez mijenjanja tvojih ocjena, stanja i napretka." :class="activeTab === 'refresh' ? 'tab-active [--tab-bg:var(--color-base-300)]!' : 'text-base-content/60 hover:text-base-content'" :aria-selected="activeTab === 'refresh'" @click="activeTab = 'refresh'" title="Osvježi metadata igara">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span class="font-bold hidden sm:inline">Osvježi metadata igara</span>
            </button>
          </div>
        </div>
  
        <SteamImporter v-show="activeTab === 'steam'" @connection-change="steamConnection = $event" />

        <!-- PSN panel -->
        <div v-if="activeTab === 'psn'" class="space-y-4">
  
          <!-- ===== PSN POVEZANI RAČUN ===== -->
          <div v-if="isConnected" class="card bg-base-200 shadow">
            <div class="card-body p-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
  
                <!-- Avatar + info -->
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="avatar shrink-0">
                    <div class="w-14 h-14 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-neutral text-neutral-content flex items-center justify-center">
                      <img v-if="psnProfileData?.avatarUrl" :src="psnProfileData.avatarUrl" :alt="psnProfileData?.onlineId || 'PSN'" class="w-full h-full object-cover"/>
                      <span v-else-if="psnProfileData?.onlineId" class="text-xl font-bold">{{ psnProfileData.onlineId.charAt(0).toUpperCase() }}</span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-lg leading-tight truncate">{{ psnProfileData?.onlineId || 'PSN račun povezan' }}</div>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <svg fill="currentColor" viewBox="0 0 32 32" class="h-3.5 w-3.5 opacity-50" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.262 24.248c-2.374-0.681-2.767-2.084-1.69-2.899 0.776-0.51 1.668-0.954 2.612-1.288l0.087-0.027 7.017-2.516v2.89l-5.030 1.839c-0.881 0.339-1.031 0.79-0.299 1.032 0.365 0.093 0.783 0.147 1.214 0.147 0.615 0 1.204-0.109 1.749-0.308l-0.035 0.011 2.422-0.882v2.592c-0.15 0.037-0.32 0.055-0.487 0.091-0.775 0.136-1.667 0.214-2.577 0.214-1.778 0-3.486-0.298-5.078-0.846l0.11 0.033zM18.049 24.544l7.868-2.843c0.893-0.322 1.032-0.781 0.307-1.022-0.363-0.089-0.779-0.14-1.208-0.14-0.622 0-1.22 0.108-1.774 0.305l0.037-0.011-5.255 1.874v-2.983l0.3-0.106c1.050-0.349 2.284-0.62 3.557-0.761l0.083-0.008c0.468-0.050 1.010-0.078 1.559-0.078 1.877 0 3.677 0.331 5.343 0.939l-0.108-0.035c2.309 0.751 2.549 1.839 1.969 2.589-0.559 0.557-1.235 0.998-1.988 1.282l-0.039 0.013-10.677 3.883v-2.869zM12.231 4.248v21.927l4.892 1.576v-18.39c0-0.862 0.38-1.438 0.992-1.238 0.795 0.225 0.95 1.017 0.95 1.881v7.342c3.050 1.491 5.451-0.003 5.451-3.939 0-4.045-1.407-5.842-5.546-7.282-1.785-0.648-4.040-1.294-6.347-1.805l-0.389-0.072z"/>
                      </svg>
                      <span class="text-xs opacity-50">PlayStation Network</span>
                    </div>
                    <div v-if="psnProfileData?.trophyLevel" class="text-xs opacity-60 mt-0.5 flex items-center gap-1">
                      <Icon icon="mdi:trophy-outline" class="h-3.5 w-3.5 shrink-0" aria-hidden="true"/>
                      <span>Trophy Level {{ psnProfileData.trophyLevel }}</span>
                    </div>
                    <div v-if="hasSynced && psnGames.length" class="text-xs opacity-50 mt-0.5">
                      {{ psnGames.length }} igara učitano
                    </div>
                    <div v-if="lastSyncedAt" class="text-xs opacity-50 mt-0.5">
                      Zadnja sinkronizacija: {{ formatSyncedAt(lastSyncedAt) }}
                    </div>
                  </div>
                </div>
  
                <!-- Action buttons -->
                <div class="flex flex-wrap gap-2 shrink-0">
                  <button class="btn btn-sm btn-error btn-outline gap-1 tooltip tooltip-left" data-tip="Briše PSN vezu iz ovog preglednika. Kolekcija ostaje netaknuta." aria-label="Odspoji" :disabled="syncLoading || importLoading" @click="disconnectPsn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Odspoji
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- ===== NIJE POVEZANO ===== -->
          <div v-else class="card bg-base-200 shadow">
            <div class="card-body p-4 space-y-3">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <h2 class="font-semibold">Poveži svoj PlayStation račun</h2>
              </div>
              <p class="text-sm text-base-content/60">
                Sinkroniziraj odigrane igre, vrijeme igranja i trofeje direktno sa svog PSN računa. Podaci se dohvaćaju lokalno u tvom pregledniku.
              </p>
              <button class="btn btn-primary w-fit gap-1.5" @click="openWizard">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                </svg>
                Poveži PSN račun
              </button>
              <p class="text-xs text-base-content/50 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Trebat ćeš vlastiti NPSSO token — upute su unutar čarobnjaka.
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
            <p v-if="syncStage" class="text-xs opacity-60">{{ syncStage }}</p>
            <div v-for="i in 6" :key="i" class="skeleton h-20 w-full rounded-xl"></div>
          </div>
  
          <template v-if="!syncLoading && psnGames.length">
  
            <ImporterGameList
              source="psn" :games="psnListGames" :selected-new="selectedMap" :selected-existing="updateMap"
              :extras="gameExtras" :groups="groups" :status-options="statusOptions"
              :busy="syncLoading || importLoading" refresh-label="Osvježi s PSN-a"
              metadata-required :progress="importProgress" :done="importDone" :total="importTotal"
              @resolve="resolvePsnGame" @poster="setPsnPoster" @select="selectPsnGame" @refresh="syncPsn" @import="importSelected" @sync="updateSelected"
            />

<div v-if="metadataWarning" role="status" class="alert alert-warning">{{ metadataWarning }}</div>
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
  
          <div v-if="isConnected && !syncLoading && !hasSynced" class="alert shadow bg-base-200 border border-base-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>PSN račun je povezan. Pokreni prvu sinkronizaciju za dohvat igara.</span>
            <button class="btn btn-sm btn-primary gap-1 ml-auto shrink-0" :disabled="syncLoading" @click="syncPsn">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Sinkroniziraj sad
            </button>
          </div>

          <div v-if="!syncLoading && hasSynced && psnGames.length === 0" class="alert alert-warning shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <span>Nisu pronađene igre na ovom PSN računu.</span>
          </div>

          <!-- ===== ČAROBNJAK ZA POVEZIVANJE ===== -->
          <div v-if="wizardOpen" class="modal modal-open" @click.self="closeWizard">
            <div class="modal-box max-w-lg space-y-4">
              <h3 class="font-bold text-lg">Poveži PSN račun</h3>
              <ol class="space-y-4">
                <li class="flex gap-3">
                  <span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">1</span>
                  <div class="text-sm leading-relaxed pt-1">
                    Prijavi se na <a class="link link-primary" href="https://www.playstation.com/" target="_blank" rel="noopener">playstation.com</a>
                  </div>
                </li>
                <li class="flex gap-3">
                  <span
                    class="shrink-0 w-7 h-7 rounded-full font-bold text-sm flex items-center justify-center"
                    :class="wizardNpsso.trim() ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60'"
                  >2</span>
                  <div class="text-sm leading-relaxed space-y-1.5 pt-0.5">
                    <p>Otvori ssocookie stranicu u istom pregledniku:</p>
                    <a class="btn btn-xs btn-outline gap-1" href="https://ca.account.sony.com/api/v1/ssocookie" target="_blank" rel="noopener">
                      ca.account.sony.com/api/v1/ssocookie
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                    <p class="opacity-70">Kopiraj vrijednost <code class="bg-base-300 px-1 rounded">npsso</code> iz JSON odgovora.</p>
                  </div>
                </li>
                <li class="flex gap-3">
                  <span
                    class="shrink-0 w-7 h-7 rounded-full font-bold text-sm flex items-center justify-center"
                    :class="isConnected ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/60'"
                  >3</span>
                  <div class="text-sm leading-relaxed pt-1">
                    Zalijepi token ovdje i poveži se. <span class="opacity-60">Cijeli JSON odgovor također radi.</span>
                  </div>
                </li>
              </ol>
              <div class="alert bg-base-200 border border-base-300 text-xs text-base-content/70">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>NPSSO je ekvivalent lozinke. Sprema se samo u ovaj preglednik i ne čuva se na Gamenote serverima.</span>
              </div>
              <input
                v-model="wizardNpsso"
                type="password"
                class="input input-bordered w-full font-mono"
                placeholder='{"npsso":"…"} ili samo token'
                @keyup.enter="connectPsn"
              />
              <div v-if="wizardError" class="alert alert-error text-sm py-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ wizardError }}</span>
              </div>
              <PsnCredit/>
              <div class="modal-action">
                <button class="btn btn-ghost" @click="closeWizard">Odustani</button>
                <button class="btn btn-primary gap-1" :disabled="wizardLoading || wizardNpssoParsed.length < 30" @click="connectPsn">
                  <span v-if="wizardLoading" class="loading loading-spinner loading-sm"></span>
                  Poveži se
                </button>
              </div>
            </div>
          </div>

        </div>
  
        <!-- MIGRACIJA RAWG/IGDB podataka -->
        <div v-if="activeTab === 'migrate'" class="space-y-4">

          <!-- Backup tooltip -->
          <div class="card bg-base-200 shadow">
            <div class="card-body p-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="flex items-start gap-2 flex-1 min-w-0">
                  <div class="tooltip tooltip-right shrink-0" data-tip="Uvijek prvo spremi sigurnosnu kopiju prije bilo kakvih promjena u kolekciji.">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="font-bold leading-tight">Napravi backup prije migracije</h2>
                    <p class="text-sm text-base-content/60 mt-0.5">Migracija mijenja podatke u tvojoj kolekciji. Prvo preuzmi sigurnosnu kopiju!</p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 shrink-0">
                  <button class="btn btn-sm btn-info btn-outline gap-1" :disabled="backupLoading" @click="exportBackup">
                    <span v-if="backupLoading" class="loading loading-spinner loading-xs"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Preuzmi backup
                  </button>
                  <button class="btn btn-sm btn-ghost gap-1" @click="activeTab = 'backup'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    Uvezi backup
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Scan card -->
          <div class="card bg-base-200 shadow">
            <div class="card-body p-4 space-y-3">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <h2 class="text-lg font-bold">RAWG podaci u biblioteci</h2>
              </div>
              <p class="text-sm text-base-content/60">Pronalazi nove (Gamenote) ID-jeve za igre dodane prije prelaska na novi API te ažurira njihove metapodatke (naslovnicu, opis, žanrove, datume, ocjene…). Tvoji dodani podaci se NEĆE izgubiti!
              Preporučuje se da ovo napraviš na računalu jer je iskustvo puno bolje i brže.</p>
              <button class="btn btn-outline btn-sm gap-1 w-fit" :disabled="migrateScanLoading" @click="scanMigration">
                <span v-if="migrateScanLoading" class="loading loading-spinner loading-sm"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Skeniraj biblioteku
              </button>

              <div v-if="migrateScanError" class="alert alert-error shadow">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ migrateScanError }}</span>
              </div>

              <div v-if="!migrateScanLoading && migrateGames.length" class="flex flex-wrap gap-2 items-center">
                <span class="badge badge-lg badge-success badge-outline font-bold">{{ migrateKandidatCount }} kandidata</span>
                <span class="badge badge-lg badge-info badge-outline">{{ migrateLinkedCount }} već povezano</span>
                <span class="badge badge-lg badge-ghost">{{ migrateNoMatchCount }} bez rezultata</span>
              </div>
            </div>
          </div>

          <template v-if="!migrateScanLoading && migrateGames.length">

            <!-- Controls card -->
            <div class="card bg-base-200 shadow">
              <div class="card-body p-3 space-y-3">
                <input v-model="migrateFilter" class="input input-sm input-bordered w-full" placeholder="Pretraži igre..."/>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                  <div class="flex flex-wrap gap-1">
                    <button class="btn btn-xs btn-ghost gap-1" @click="migrateSelectAll(true)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                      </svg>
                      Sve kandidate
                    </button>
                    <button class="btn btn-xs btn-ghost gap-1" @click="migrateSelectAll(false)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      Poništi
                    </button>
                  </div>
                  <button class="btn btn-sm btn-success gap-1" :disabled="migrateLoading || migrateSelectedCount === 0" @click="runMigration">
                    <span v-if="migrateLoading" class="loading loading-spinner loading-sm"></span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                    </svg>
                    Migriraj ({{ migrateSelectedCount }})
                  </button>
                </div>

                <div v-if="migrateLoading && migrateTotal > 0" class="space-y-1">
                  <div class="flex justify-between text-xs opacity-60">
                    <span>{{ migrateProgress }}</span>
                    <span>{{ migrateDone }}/{{ migrateTotal }}</span>
                  </div>
                  <progress class="progress progress-success w-full" :value="migrateDone" :max="migrateTotal"></progress>
                </div>
              </div>
            </div>

            <!-- MOBILE cards -->
            <div class="flex flex-col gap-4 lg:hidden">
              <div v-for="g in filteredMigrationGames" :key="g._key" class="card bg-base-200 shadow-md transition-opacity" :class="g.status === 'kandidat' ? '' : 'opacity-70'">
                <div class="card-body p-4 space-y-3">
                  <div class="flex gap-4 items-start">
                    <div class="flex flex-col gap-1 items-center pt-1 shrink-0">
                      <input v-if="g.status === 'kandidat'" type="checkbox" class="checkbox checkbox-success" v-model="migrateSelectedMap[g._key]"/>
                      <span v-else class="text-xs opacity-40">{{ g.status === 'linked' ? 'link' : '—' }}</span>
                    </div>
                    <div v-if="g.imageUrl" class="avatar shrink-0">
                      <div class="w-16 h-20 rounded-xl overflow-hidden">
                        <img :src="g.imageUrl" :alt="g.db.title" loading="lazy" class="object-cover w-full h-full"/>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0 space-y-1.5">
                      <div class="font-bold text-base leading-snug">{{ g.db.title }}</div>
                      <div class="flex flex-wrap gap-1.5">
                        <span class="badge badge-md text-center" :class="g.status === 'kandidat' ? 'badge-success badge-outline' : g.status === 'linked' ? 'badge-info' : 'badge-ghost'">{{ migrateStatusLabel(g.status) }}</span>
                        <span v-if="g.newId" class="badge badge-md" :class="g.score < 3 ? 'badge-warning' : 'badge-ghost'">{{ (g.score || 0).toFixed(2) }}</span>
                      </div>
                      <div v-if="g.newId" class="text-sm opacity-70 line-clamp-1">{{ g.newName }} <span class="opacity-50">(ID {{ g.newId }})</span></div>
                      <div class="text-sm opacity-40">Stari ID: {{ g.oldId }}</div>
                    </div>
                  </div>
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
                    <th>Naziv</th>
                    <th>Stari ID (RAWG)</th>
                    <th>Novi ID (Gamenote)</th>
                    <th>Datum</th>
                    <th class="w-28 text-center">Pouzdanost</th>
                    <th class="min-w-[10rem] text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="g in filteredMigrationGames" :key="g._key" :class="g.status !== 'kandidat' ? 'opacity-70' : ''">
                    <td class="text-center">
                      <input type="checkbox" class="checkbox checkbox-success" :disabled="g.status !== 'kandidat'" v-model="migrateSelectedMap[g._key]"/>
                    </td>
                    <td>
                      <div class="flex items-center gap-3">
                        <div v-if="g.imageUrl" class="avatar shrink-0">
                          <div class="w-10 h-14 rounded-lg overflow-hidden">
                            <img :src="g.imageUrl" :alt="g.db.title" loading="lazy" class="object-cover w-full h-full"/>
                          </div>
                        </div>
                        <div class="font-semibold leading-tight">{{ g.db.title }}</div>
                      </div>
                    </td>
                    <td class="tabular-nums text-sm opacity-60">{{ g.oldId }}</td>
                    <td>
                      <span v-if="g.newId" class="tabular-nums">
                        {{ g.newId }} <span class="opacity-40 text-xs">{{ g.newName }}</span>
                      </span>
                      <span v-else class="opacity-30">—</span>
                    </td>
                    <td class="text-sm">{{ g.newReleased || '—' }}</td>
                    <td class="text-center">
                      <span v-if="g.newId" class="badge badge-md" :class="g.score < 3 ? 'badge-warning' : 'badge-ghost'">
                        {{ (g.score || 0).toFixed(2) }}
                      </span>
                      <span v-else class="opacity-30">—</span>
                    </td>
                    <td class="text-center">
                      <span class="badge badge-md text-center whitespace-normal" :class="g.status === 'kandidat' ? 'badge-success badge-outline' : g.status === 'linked' ? 'badge-info' : 'badge-ghost'">
                        {{ migrateStatusLabel(g.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="migrateError" class="alert alert-error shadow">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ migrateError }}</span>
            </div>

            <div v-if="migrateDoneCount > 0 && !migrateLoading" class="alert alert-success shadow">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong>{{ migrateDoneCount }}</strong> igara uspješno migrirano.</span>
              <router-link class="btn btn-sm btn-outline ml-auto" to="/library">Otvori kolekciju</router-link>
            </div>

          </template>

          <div v-if="!migrateScanLoading && migrateScanned && migrateGames.length === 0" class="alert alert-success shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Nema igara koje treba migrirati — sve je već povezano s novim API-jem.</span>
          </div>

        </div>

        <!-- BACKUP (uvoz / izvoz) -->
        <div v-if="activeTab === 'backup'" class="space-y-4">
          <div class="card bg-base-200 shadow">
            <div class="card-body p-4 sm:p-5 space-y-4">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h2 class="text-lg font-bold">Sigurnosna kopija podataka</h2>
              </div>
              <p class="text-sm text-base-content/60">
                Preuzmi kompletnu sigurnosnu kopiju svoje kolekcije (igre, grupe i povezivanja) ili uvezi ranije spremljenu kopiju.
              </p>
              <div class="flex flex-col sm:flex-row gap-3">
                <button @click="exportBackup" class="btn btn-outline btn-info" :disabled="backupLoading || importing">
                  <span v-if="backupLoading" class="loading loading-spinner"></span>
                  <span v-else class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Preuzmi backup
                  </span>
                </button>
                <label class="btn btn-outline btn-warning cursor-pointer" :class="{ 'btn-disabled': importing || backupLoading }">
                  <span v-if="importing" class="loading loading-spinner"></span>
                  <span v-else class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    Uvezi backup
                  </span>
                  <input type="file" accept=".json" hidden @change="importBackup" :disabled="importing" />
                </label>
              </div>
              <div class="alert bg-base-200 border border-base-300 text-sm text-base-content/70">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Uvoz <strong>zamjenjuje</strong> sve trenutne podatke podacima iz backup datoteke. Preporučamo prvo preuzeti backup.</span>
              </div>
            </div>
          </div>

          <!-- Modal za uvoz backupa -->
          <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="card bg-base-200 w-full max-w-md mx-4 shadow-2xl">
              <div class="card-body p-6">
                <h3 class="text-xl font-bold text-warning">Uvezi backup</h3>
                <p class="text-sm leading-relaxed mt-2">
                  Ovo će <strong>zamijeniti</strong> sve tvoje trenutne podatke
                  (igre, grupe, pratitelje) podacima iz backup datoteke.
                </p>
                <p class="text-sm text-base-content/60 mt-1">Jesi li siguran da želiš nastaviti?</p>

                <div class="flex gap-2 mt-6">
                  <button @click="closeImportModal" class="btn btn-ghost flex-1">Odustani</button>
                  <button @click="confirmImport" class="btn btn-warning flex-1">
                    <span v-if="importing" class="loading loading-spinner"></span>
                    <span v-else>Uvezi backup</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Osvježi metadata igara -->
        <div v-if="activeTab === 'refresh'" class="space-y-4">
          <div class="card bg-base-200 shadow">
            <div class="card-body p-4 sm:p-5 space-y-4">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <h2 class="text-lg font-bold">Osvježi metadata igara</h2>
              </div>
              <p class="text-sm text-base-content/60">
                Gamenote prolazi kroz tvoje dodane igre i osvježava metapodatke svih igara koje imaju povezan Gamenote ID — naslovnicu, opis, žanrove, datume, ocjene i snimke zaslona. Tvoje ocjene, stanje, bilješke i progresija se ne mijenjaju.
              </p>
              <div class="flex flex-wrap gap-3">
                <button class="btn btn-outline btn-primary gap-1" :disabled="refreshLoading" @click="runRefresh">
                  <span v-if="refreshLoading" class="loading loading-spinner loading-sm"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Osvježi biblioteku
                </button>
              </div>

              <div v-if="refreshLoading && refreshTotal > 0" class="space-y-1">
                <div class="flex justify-between text-xs opacity-60">
                  <span>{{ refreshProgress }}</span>
                  <span>{{ refreshDone }}/{{ refreshTotal }}</span>
                </div>
                <progress class="progress progress-primary w-full" :value="refreshDone" :max="refreshTotal"></progress>
              </div>

              <div v-if="refreshError" class="alert alert-error shadow">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ refreshError }}</span>
              </div>

              <div v-if="refreshDoneCount > 0 && !refreshLoading" class="alert alert-success shadow">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span><strong>{{ refreshDoneCount }}</strong> igara osvježeno iz Gamenote API-a.</span>
              </div>
            </div>
          </div>
        </div>
  
      </template>
    </div>
  </template>
  
  <script>
import { validateBackup } from '../services/backupValidation';
import { fetchUserRows } from '../services/libraryData';
  import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useUserStore } from '../stores/user';
  import { supabase } from '../supabase';
import { useGamesApi } from '../services/gamesApi';
import { GAME_STATUS } from '../constants/gameStatus';
import { hasAllAchievements } from '../services/importerStatus';
import { Icon } from '@iconify/vue';
import PsnCredit from '../components/PsnCredit.vue';
import SteamImporter from '../components/SteamImporter.vue';
import ImporterGameList from '../components/ImporterGameList.vue';
import { loadImporterMetadata } from '../services/importerMetadata';
import { resolveImporterGame, loadImporterChoices, saveImporterChoices } from '../services/importerResolution';
import { httpUrl } from '../services/safeContent';
import { otherPlatforms } from '../services/importerMatching';
import { buildPsnRow, buildPsnPatch, buildPsnIndex, platformName } from '../services/psnImport';
import {
  connectWithNpsso, disconnectPsn as clearPsnConnection,
  hasPsnConnection, fetchSyncData, saveSnapshot, loadSnapshot, normalizeTitle,
  extractNpsso
} from '../services/psnService';

  const THROW = (err) => { if (err) throw err; };
  
  export default {
    components: { PsnCredit, Icon, SteamImporter, ImporterGameList },
    setup() {
      const userStore = useUserStore();
      const gamesApi = useGamesApi();
      const ownerId = userStore.user?.id;
      let disposed = false;
      const assertOwner = () => {
        if (disposed || !ownerId || userStore.user?.id !== ownerId) throw new Error('Korisnik je promijenjen. Ponovno otvori importer.');
      };
      onBeforeUnmount(() => { disposed = true; });
  
      const activeTab = ref('psn');
      const isConnected = ref(hasPsnConnection());
      const steamConnection = ref({ connected: false, name: '' });
      const lastSyncedAt = ref(loadSnapshot()?.syncedAt || null);
      const wizardOpen = ref(false);
      const wizardNpsso = ref('');
      const wizardLoading = ref(false);
      const wizardError = ref('');
      const psnProfileData = ref(null);
      const syncLoading = ref(false);
      const syncError = ref('');
      const syncStage = ref('');
      const hasSynced = ref(false);
      const psnGames = ref([]);
      let psnLibraryRows = [];
      const psnChoices = ref(loadImporterChoices(ownerId, 'psn'));
      const selectedMap = ref({});
      const updateMap = ref({});
      const gameExtras = ref({});
      const importLoading = ref(false);
      const importProgress = ref('');
      const importDone = ref(0);
      const importTotal = ref(0);
      const importError = ref('');
      const metadataWarning = ref('');
      const importDoneCount = ref(0);
const groups = ref([]);
const statusOptions = GAME_STATUS;

const backupLoading = ref(false);
const importing = ref(false);
const showImportModal = ref(false);
const importFileData = ref(null);
const toast = reactive({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => toast.show = false, 3000);
};

const migrateScanLoading = ref(false);
const migrateScanned = ref(false);
const migrateScanError = ref('');
const migrateGames = ref([]);
const migrateFilter = ref('');
const migrateSelectedMap = ref({});
const migrateLoading = ref(false);
const migrateProgress = ref('');
const migrateDone = ref(0);
const migrateTotal = ref(0);
const migrateError = ref('');
const migrateDoneCount = ref(0);

const refreshLoading = ref(false);
const refreshProgress = ref('');
const refreshDone = ref(0);
const refreshTotal = ref(0);
const refreshError = ref('');
const refreshDoneCount = ref(0);
  
      const defaultExtras = (game = {}) => ({
        rating: 0, notes: '', groupId: null, statusAutomatic: true,
        status: hasAllAchievements(game.trophiesEarned, game.trophiesTotal) ? 'completed' : 'backlog',
      });

      const filteredMigrationGames = computed(() => {
        const q = migrateFilter.value.trim().toLowerCase();
        if (!q) return migrateGames.value;
        return migrateGames.value.filter(g =>
          (g.db.title || '').toLowerCase().includes(q) ||
          (g.newName || '').toLowerCase().includes(q) ||
          String(g.oldId).includes(q) ||
          (g.newId || '').includes(q)
        );
      });
      const migrateSelectedCount = computed(() => Object.values(migrateSelectedMap.value).filter(Boolean).length);
      const migrateKandidatCount = computed(() => migrateGames.value.filter(g => g.status === 'kandidat').length);
      const migrateLinkedCount = computed(() => migrateGames.value.filter(g => g.status === 'linked').length);
      const migrateNoMatchCount = computed(() => migrateGames.value.filter(g => g.status === 'nomatch').length);
  
      const mapPlatform = (cat) => cat === 'ps5_native_game' ? 'PS5' : cat === 'ps4_game' ? 'PS4' : 'PS';
      const psnListGames = computed(() => psnGames.value.map(game => ({
        key: game._key, name: game.name, exists: game._exists, blocked: game._blocked,
        otherPlatforms: game._otherPlatforms || [],
        candidates: game._resolution?.candidates || [], needsChoice: game._resolution?.needsChoice, resolution: game._resolution?.resolution,
        imageUrl: game.imageUrl || game._metadata?.image_url || null, platform: mapPlatform(game.platformCategory),
        platformPrimary: game.platformCategory === 'ps5_native_game',
        playtime: game.hoursPlayed != null ? `${game.hoursPlayed} h` : '—',
        progress: game.trophyPercent, progressLabel: 'trofeja',
        progressValue: game.trophiesEarned, progressTotal: game.trophiesTotal,
        lastPlayed: game.lastPlayed,
      })));
      const selectPsnGame = ({ key, existing, value }) => {
        if (existing) updateMap.value[key] = value;
        else selectedMap.value[key] = value;
      };

      const PLATFORM_MAP = {
        'pc (microsoft windows)': 'PC',
        'linux': 'Other',
        'mac': 'Other',
        'classic macintosh': 'Other',
        'web': 'Other',
        'legacy': 'Other',
        'xbox series x|s': 'Xbox Series X/S',
        'xbox series x/s': 'Xbox Series X/S',
        'xbox one': 'Xbox One',
        'xbox 360': 'Other',
        'xbox': 'Other',
        'playstation 5': 'PlayStation 5',
        'playstation 4': 'PlayStation 4',
        'playstation 3': 'Other',
        'playstation 2': 'Other',
        'playstation': 'Other',
        'playstation portable': 'Other',
        'psp': 'Other',
        'ps vita': 'Other',
        'nintendo switch': 'Nintendo Switch',
        'nintendo switch 2': 'Nintendo Switch 2',
        'wii': 'Other',
        'ios': 'iOS',
        'android': 'Android'
      };
      const normalizePlatformName = (name) => {
        const key = String(name || '').trim().toLowerCase();
        return PLATFORM_MAP[key] || 'Other';
      };
  
      const loadGroups = async () => {
        const userId = userStore.user?.id;
        if (!userId) return;
        const data = await fetchUserRows(supabase, 'groups', userId, { columns: 'id,name', order: 'name' });
        groups.value = data || [];
      };
  
      const openWizard = () => { wizardError.value = ''; wizardOpen.value = true; };
      const closeWizard = () => {
        wizardOpen.value = false;
        wizardNpsso.value = '';
        wizardError.value = '';
      };
      const wizardNpssoParsed = computed(() => extractNpsso(wizardNpsso.value));

      const connectPsn = async () => {
        wizardError.value = '';
        try {
          wizardLoading.value = true;
          psnProfileData.value = await connectWithNpsso(wizardNpssoParsed.value);
          isConnected.value = true;
          closeWizard();
          showToast('PSN račun povezan!');
          await syncPsn();
        } catch (e) {
          wizardError.value = e?.message || 'Povezivanje nije uspjelo.';
        } finally {
          wizardLoading.value = false;
        }
      };

      const disconnectPsn = () => {
        clearPsnConnection();
        isConnected.value = false;
        lastSyncedAt.value = null;
        psnProfileData.value = null;
        psnGames.value = [];
        hasSynced.value = false;
        selectedMap.value = {};
        updateMap.value = {};
        gameExtras.value = {};
        importDoneCount.value = 0;
        showToast('PSN veza uklonjena iz ovog preglednika.');
      };

      const formatSyncedAt = (ts) => {
        try { return new Date(ts).toLocaleString('hr-HR', { dateStyle: 'short', timeStyle: 'short' }); } catch { return ''; }
      };
   
      // indeks: npcId → titleId → naziv
      const loadLibraryIndex = async () => {
        const userId = userStore.user?.id;
        if (!userId) return new Map();
        assertOwner();
        psnLibraryRows = await fetchUserRows(supabase, 'games', userId, { columns: 'id,title,platform,psn_np_communication_id,psn_title_id' });
        assertOwner();
        return buildPsnIndex(psnLibraryRows);
      };
      const applyPsnMatches = () => {
        const index = buildPsnIndex(psnLibraryRows);
        psnGames.value = psnGames.value.map(game => {
          const key = game.psnTitleId ? String(game.psnTitleId) : normalizeTitle(game.name);
          if (!gameExtras.value[key]) gameExtras.value[key] = defaultExtras(game);
          if (gameExtras.value[key].statusAutomatic) gameExtras.value[key].status = defaultExtras(game).status;
          const match = resolveImporterGame(psnLibraryRows, 'psn', game, psnChoices.value[key], index);
          return {
            ...game, _key: key, _exists: Boolean(match.row), _blocked: match.blocked, _resolution: match,
            _matchId: match.row?.id || null, _otherPlatforms: otherPlatforms(psnLibraryRows, game.name, platformName(game.platformCategory)),
          };
        });
        const nextSelected = {}, nextUpdate = {};
        for (const game of psnGames.value) {
          nextSelected[game._key] = !game._exists && !game._blocked && (selectedMap.value[game._key] ?? true);
          nextUpdate[game._key] = game._exists && !game._blocked && (updateMap.value[game._key] ?? true);
        }
        selectedMap.value = nextSelected;
        updateMap.value = nextUpdate;
      };
      const markExisting = async () => {
        await loadLibraryIndex();
        applyPsnMatches();
      };
      const resolvePsnGame = ({ key, value }) => {
        if (importLoading.value || syncLoading.value) return;
        psnChoices.value[key] = value === 'separate' ? { mode: 'separate' } : { mode: 'link', targetId: value.slice(5) };
        saveImporterChoices(ownerId, 'psn', psnChoices.value);
        applyPsnMatches();
        const game = psnGames.value.find(game => game._key === key);
        selectedMap.value[key] = !game._exists && !game._blocked;
        updateMap.value[key] = game._exists && !game._blocked;
      };
      const setPsnPoster = ({ key, url }) => {
        const game = psnGames.value.find(game => game._key === key);
        if (game) game._posterUrl = httpUrl(url);
      };

      const syncPsn = async () => {
        syncError.value = '';
        importError.value = '';
        metadataWarning.value = '';
        importDoneCount.value = 0;
        try {
          syncLoading.value = true;
          syncStage.value = '';
          const data = await fetchSyncData((msg) => { syncStage.value = msg; });
          assertOwner();
          psnGames.value = data.games || [];
          psnProfileData.value = data.profile;
          hasSynced.value = true;
          saveSnapshot(data);
          lastSyncedAt.value = Date.now();
          await markExisting();
          showToast(`Sinkronizacija dovršena: ${psnGames.value.length} igara.`);
        } catch (e) {
          if (e?.name === 'PsnAuthRequiredError') {
            isConnected.value = hasPsnConnection();
            openWizard();
            syncError.value = e.message;
          } else {
            syncError.value = e?.message || 'Greška pri PSN syncu.';
          }
        } finally {
          syncLoading.value = false;
          syncStage.value = '';
        }
      };
  
      const importSelected = async () => {
        if (importLoading.value) return;
        importError.value = '';
        metadataWarning.value = '';
        importDoneCount.value = 0;
        importDone.value = 0;
        const toImport = psnGames.value.filter(game => selectedMap.value[game._key] && !game._exists && !game._blocked);
        if (!toImport.length) return;
        importLoading.value = true;
        importTotal.value = toImport.length;
        const missingMetadata = [];
        const unresolved = [];
        try {
          assertOwner();
          let index = await loadLibraryIndex();
          for (const game of toImport) {
            assertOwner();
            const match = resolveImporterGame(psnLibraryRows, 'psn', game, psnChoices.value[game._key], index);
            if (match.blocked) { unresolved.push(game.name); continue; }
            if (match.row) continue;
            importProgress.value = `Importiram: ${game.name}`;
            const extras = gameExtras.value[game._key] || defaultExtras();
            const metadata = await loadImporterMetadata(gamesApi, game.name);
            if (!metadata) { missingMetadata.push(game.name); importDone.value++; continue; }
            const row = { ...buildPsnRow(ownerId, game, extras), ...metadata };
            if (match.separate) row.title = game.name;
            row.image_url = game._posterUrl || metadata.image_url;
            extras.status = row.status;
            game._metadata = metadata;
            assertOwner();
            const { data, error } = await supabase.from('games').insert([row]).select('id');
            if (error) throw error;
            if (!data?.[0]?.id) throw new Error('Spremanje nije potvrđeno. Osvježi popis prije ponavljanja.');
            importDoneCount.value++;
            importDone.value++;
            psnLibraryRows.push({ ...row, id: data[0].id });
            index = buildPsnIndex(psnLibraryRows);
            if (match.separate) {
              psnChoices.value[game._key] = { mode: 'separate', entryId: data[0].id };
              saveImporterChoices(ownerId, 'psn', psnChoices.value);
            }
            if (extras.groupId) {
              assertOwner();
              const { error: groupError } = await supabase.from('game_groups').insert([{ user_id: ownerId, game_id: data[0].id, group_id: extras.groupId }]);
              if (groupError) throw new Error('Igra je dodana, ali grupa nije spremljena. Dodaj je u grupu iz detalja igre.');
            }
          }
          showToast(`Import dovršen: ${importDoneCount.value} igara.`);
        } catch (error) {
          importError.value = `Dodano: ${importDoneCount.value}. ${error.message || 'Import nije uspio.'}`;
        } finally {
          try { assertOwner(); await markExisting(); }
          catch (error) { if (!disposed) importError.value += ` ${error.message}`; }
          if (missingMetadata.length) metadataWarning.value = `Nisu dodane igre bez potvrđenog podudaranja u Gamenote katalogu: ${missingMetadata.join(', ')}. Pronađi ih kroz Dodaj igru.`;
          if (unresolved.length) metadataWarning.value += ` Odaberi postojeću igru ili zaseban unos za: ${unresolved.join(', ')}.`;
          importLoading.value = false;
          importProgress.value = '';
          importTotal.value = 0;
        }
      };

      const updateSelected = async () => {
        if (importLoading.value) return;
        importError.value = '';
        metadataWarning.value = '';
        importDoneCount.value = 0;
        importDone.value = 0;
        const toUpdate = psnGames.value.filter(game => updateMap.value[game._key] && game._exists);
        if (!toUpdate.length) return;
        importLoading.value = true;
        importTotal.value = toUpdate.length;
        try {
          assertOwner();
          const index = await loadLibraryIndex();
          const targets = new Set();
          for (const game of toUpdate) {
            const match = resolveImporterGame(psnLibraryRows, 'psn', game, psnChoices.value[game._key], index);
            if (match.row && targets.has(match.row.id)) throw new Error('Odaberi samo jedan izvor napretka za istu igru.');
            if (match.row) targets.add(match.row.id);
          }
          for (const game of toUpdate) {
            assertOwner();
            const resolution = resolveImporterGame(psnLibraryRows, 'psn', game, psnChoices.value[game._key], index);
            const match = resolution.row;
            if (!match || resolution.blocked) continue;
            importProgress.value = `Sinkroniziram: ${game.name}`;
            const { data, error } = await supabase.from('games').update(buildPsnPatch(game, match))
              .eq('user_id', ownerId).eq('id', match.id).eq('platform', match.platform).select('id');
            if (error) throw error;
            if (!data?.length) throw new Error('Igra je promijenjena ili uklonjena. Osvježi popis.');
            importDoneCount.value++;
            importDone.value++;
          }
          showToast(`Sinkronizirano: ${importDoneCount.value} igara.`);
        } catch (error) {
          importError.value = `Sinkronizirano: ${importDoneCount.value}. ${error.message || 'Ažuriranje nije uspjelo.'}`;
        } finally {
          importLoading.value = false;
          importProgress.value = '';
          importTotal.value = 0;
        }
      };

    const exportBackup = async () => {
      if (backupLoading.value || importing.value) return;
      backupLoading.value = true;
      try {
        assertOwner();
        const uid = ownerId;
        const [gamesRes, groupsRes, gameGroupsRes] = await Promise.all([
          fetchUserRows(supabase, 'games', uid),
          fetchUserRows(supabase, 'groups', uid),
          fetchUserRows(supabase, 'game_groups', uid)
        ]);

        assertOwner();
        const backup = {
          version: 1,
          exportedAt: new Date().toISOString(),
          games: gamesRes,
          groups: groupsRes,
          gameGroups: gameGroupsRes
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gamenote-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Backup preuzet!');
      } catch (error) {
        console.error('Greška pri backupu:', error);
        showToast(error.message || 'Greška pri izradi backupa', 'error');
      } finally {
        backupLoading.value = false;
      }
    };

    const importBackup = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = validateBackup(JSON.parse(text));

        if (!data.version || !Array.isArray(data.games) || !Array.isArray(data.groups) || !Array.isArray(data.gameGroups)) {
          THROW(new Error('Neispravan format backup datoteke.'));
        }

        if (data.version !== 1) {
          THROW(new Error('Nepodržana verzija backupa.'));
        }

        importFileData.value = data;
        showImportModal.value = true;
      } catch (error) {
        console.error('Greška pri čitanju backupa:', error);
        showToast(error.message || 'Neispravna datoteka', 'error');
      }

      event.target.value = '';
    };

    const closeImportModal = () => {
      showImportModal.value = false;
      importFileData.value = null;
    };

    const confirmImport = async () => {
      if (!importFileData.value || importing.value) return;
      assertOwner();

      importing.value = true;
      showImportModal.value = false;

      try {
        const data = validateBackup(importFileData.value);
        assertOwner();

        if (data.games.length === 0 && data.groups.length === 0 && data.gameGroups.length === 0) {
          THROW(new Error('Backup datoteka ne sadrži podatke (svi nizovi su prazni).'));
        }

        const mappedGames = data.games.map(g => ({
          ...g,
          catalog_id: null,
          play_time: g.play_time != null ? Number(g.play_time) : null,
          rating: g.rating != null ? Number(g.rating) : null,
          achievement_percent: g.achievement_percent != null ? Number(g.achievement_percent) : null,
          metacritic_score: g.metacritic_score != null ? Number(g.metacritic_score) : null,
          progress_value: g.progress_value != null ? Number(g.progress_value) : null,
          progress_total: g.progress_total != null ? Number(g.progress_total) : null
        }));
        const mappedGroups = data.groups;
        const mappedGameGroups = data.gameGroups;

        const { data: result, error } = await supabase.rpc('import_user_backup', {
          p_games: JSON.parse(JSON.stringify(mappedGames)),
          p_groups: JSON.parse(JSON.stringify(mappedGroups)),
          p_game_groups: JSON.parse(JSON.stringify(mappedGameGroups))
        });

        if (error) THROW(error);
        if (!result?.ok) THROW(new Error(result?.error || 'Nepoznata greška pri uvozu.'));

        importFileData.value = null;
        await loadGroups();
        await markExisting();
        showToast(`Backup uspješno uvezen! (${result.inserted.games} igara, ${result.inserted.groups} grupa)`);
      } catch (error) {
        console.error('Greška pri uvozu backupa:', error);
        showToast(error.message || 'Uvoz nije uspio. Provjeri podatke i pokušaj ponovno.', 'error');
        importFileData.value = null;
      } finally {
        importing.value = false;
      }
    };

    const migrateStatusLabel = (s) => s === 'kandidat' ? 'Kandidat' : s === 'linked' ? 'Već povezano' : 'Bez rezultata';

    const migrateSelectAll = (value) => {
      const next = { ...migrateSelectedMap.value };
      for (const g of migrateGames.value) { if (g.status === 'kandidat') next[g._key] = value; }
      migrateSelectedMap.value = next;
    };

    const scanMigration = async () => {
      migrateScanError.value = '';
      migrateDoneCount.value = 0;
      migrateError.value = '';
      migrateFilter.value = '';
      const userId = userStore.user?.id;
      if (!userId) return;
      try {
        migrateScanLoading.value = true;
        migrateScanned.value = false;
        migrateGames.value = [];

        const data = await fetchUserRows(supabase, 'games', userId);

        const candidates = (data || []).filter(g => g.game_api_id != null && String(g.game_api_id).trim() !== '');
        const rows = [];
        migrateTotal.value = candidates.length;
        migrateDone.value = 0;

        for (const g of candidates) {
          migrateProgress.value = `Skeniram: ${g.title}`;
          const year = (g.release_date && String(g.release_date).slice(0, 4)) || null;
          let match = null;
          try { match = await gamesApi.matchGame(g.title, year); } catch (e) { match = null; }

          const oldId = String(g.game_api_id);
          let status = 'nomatch';
          let newId = null, newName = null, newReleased = null, score = 0;

          if (match && match.id != null) {
            const mid = String(match.id);
            if (mid === oldId) {
              status = 'linked';
              newId = mid;
            } else {
              status = 'kandidat';
              newId = mid;
              newName = match.name || null;
              newReleased = match.released || null;
              score = Number(match.score) || 0;
            }
          }

          rows.push({
            db: g,
            _key: String(g.id),
            oldId,
            newId,
            newName,
            newReleased,
            score,
            status,
            imageUrl: g.image_url || g.background_image || null
          });
          migrateDone.value++;
        }

        migrateGames.value = rows;
        migrateScanned.value = true;
        migrateProgress.value = '';

        const next = {};
        for (const r of rows) next[r._key] = r.status === 'kandidat';
        migrateSelectedMap.value = next;
      } catch (e) {
        migrateScanError.value = e?.message || 'Greška pri skeniranju biblioteke.';
      } finally {
        migrateScanLoading.value = false;
      }
    };

    const buildGameMetadata = async (apiId, extra = {}) => {
      const update = { updated_at: new Date().toISOString(), ...extra };
      const details = await gamesApi.getGameDetails(apiId);
      if (!details?.id) throw new Error('Metapodaci nisu dostupni. Pokušaj ponovno.');
      let screenshots = [];
      let seriesGames = [];
      try { screenshots = (await gamesApi.getGameScreenshots(apiId)) || []; } catch (e) { console.error('[Importers] screenshots failed:', e); }
      try {
        const sr = await gamesApi.getGameSeries(apiId);
        seriesGames = (sr && sr.results) || [];
      } catch (e) { console.error('[Importers] series failed:', e); }

      if (details && details.id != null) {
        update.background_image = details.background_image || null;
        update.image_url = details.background_image || null;
        if (details.released != null) update.release_date = details.released;
        if (details.description_raw != null) update.description = details.description_raw;
        if (details.website != null) update.website_url = details.website;
        if (details.metacritic != null) update.metacritic_score = details.metacritic;
        if (details.esrb_rating?.name != null) update.esrb_rating = details.esrb_rating.name;
        update.developers = JSON.stringify((details.developers || []).map(d => d.name));
        update.genres_list = JSON.stringify((details.genres || []).map(x => x.name));
        update.platforms_list = JSON.stringify((details.platforms || []).map(p => p.platform ? normalizePlatformName(p.platform.name) : null).filter(Boolean));
        update.publishers_list = JSON.stringify((details.publishers || []).map(p => p.name));
      }

      if (screenshots.length > 0) {
        update.screenshot_urls = JSON.stringify(screenshots.map(s => s.image));
      }
      if (seriesGames.length > 0) {
        update.series_games = JSON.stringify(seriesGames.map(sg => ({
          id: sg.id,
          name: sg.name,
          released: sg.released,
          background_image: sg.background_image
        })));
      }
      return update;
    };

    const runMigration = async () => {
      migrateError.value = '';
      migrateDoneCount.value = 0;
      migrateProgress.value = '';
      migrateDone.value = 0;
      migrateTotal.value = 0;
      const userId = userStore.user?.id;
      if (!userId) {
        migrateError.value = 'Nema user_id.';
        return;
      }
      const toMigrate = migrateGames.value.filter(g => migrateSelectedMap.value[g._key] && g.status === 'kandidat');
      if (!toMigrate.length) return;

      try {
        migrateLoading.value = true;
        migrateTotal.value = toMigrate.length;
        let done = 0;

        for (const g of toMigrate) {
          migrateProgress.value = `Migriram: ${g.db.title}`;
          migrateDone.value = done;

          const year = (g.db.release_date && String(g.db.release_date).slice(0, 4)) || null;
          const match = await gamesApi.matchGame(g.db.title, year);
          const newId = match && match.id != null ? String(match.id) : (g.newId || null);
          if (!newId) {
            done++;
            migrateDone.value = done;
            continue;
          }

          const update = await buildGameMetadata(newId, { game_api_id: newId });

          assertOwner();
          if (String(g.db.website_url || '').startsWith('https://store.steampowered.com/app/')) delete update.website_url;
          const { error } = await supabase.from('games').update(update).eq('user_id', userId).eq('id', g.db.id);
          if (error) THROW(new Error(`${g.db.title}: ${error.message}`));

          g.status = 'linked';
          g.newReleased = update.release_date || g.newReleased;
          done++;
          migrateDone.value = done;
        }

        migrateDoneCount.value = done;
        migrateProgress.value = '';
        migrateTotal.value = 0;

        const next = {};
        for (const r of migrateGames.value) next[r._key] = r.status === 'kandidat';
        migrateSelectedMap.value = next;
      } catch (e) {
        migrateError.value = e?.message || 'Greška pri migraciji.';
        migrateProgress.value = '';
        migrateTotal.value = 0;
      } finally {
        migrateLoading.value = false;
      }
    };

    const runRefresh = async () => {
      refreshError.value = '';
      refreshDoneCount.value = 0;
      refreshProgress.value = '';
      refreshDone.value = 0;
      refreshTotal.value = 0;
      const userId = userStore.user?.id;
      if (!userId) {
        refreshError.value = 'Nema user_id.';
        return;
      }
      try {
        refreshLoading.value = true;
        const data = await fetchUserRows(supabase, 'games', userId);
        const toRefresh = (data || []).filter(g => g.game_api_id != null && String(g.game_api_id).trim() !== '');
        if (!toRefresh.length) {
          refreshDoneCount.value = 0;
          return;
        }
        refreshTotal.value = toRefresh.length;
        let done = 0;
        for (const g of toRefresh) {
          refreshProgress.value = `Osvježavam: ${g.title}`;
          refreshDone.value = done;
          try {
            const update = await buildGameMetadata(String(g.game_api_id));
            assertOwner();
            if (String(g.website_url || '').startsWith('https://store.steampowered.com/app/')) delete update.website_url;
            const { error: updateError } = await supabase.from('games').update(update).eq('user_id', userId).eq('id', g.id);
            if (updateError) THROW(updateError);
            done++;
          } catch (e) {
            refreshError.value = `Neke igre nisu osvježene: ${e.message || 'greška dohvata'}`;
          }
          refreshDone.value = done;
        }
        refreshDoneCount.value = done;
        refreshProgress.value = '';
        refreshTotal.value = 0;
        showToast(`${done} igara osvježeno iz Gamenote API-a.`);
      } catch (e) {
        refreshError.value = e?.message || 'Greška pri osvježavanju.';
        refreshProgress.value = '';
        refreshTotal.value = 0;
      } finally {
        refreshLoading.value = false;
      }
    };

    onMounted(async () => {
  try {
  assertOwner();
  await loadGroups();

  // hydrate iz cachea
  isConnected.value = hasPsnConnection();
  const snap = loadSnapshot();
  if (snap) {
    lastSyncedAt.value = snap.syncedAt || null;
    psnProfileData.value = snap.profile || null;
    if (Array.isArray(snap.games) && snap.games.length) {
      psnGames.value = snap.games;
      hasSynced.value = true;
      await markExisting();
    }
  }
  } catch (error) { syncError.value = error.message || 'Učitavanje nije uspjelo.'; }
});

  
      return {
        userStore, activeTab, psnListGames, selectPsnGame, resolvePsnGame, setPsnPoster, isConnected, steamConnection, lastSyncedAt, formatSyncedAt,
        wizardOpen, wizardNpsso, wizardNpssoParsed, wizardLoading, wizardError, openWizard, closeWizard, connectPsn, disconnectPsn,
        syncStage, psnProfileData,
        syncLoading, syncError, hasSynced, psnGames,
        selectedMap, updateMap, gameExtras, groups, statusOptions,
        importLoading, importProgress, importDone, importTotal, importError, metadataWarning, importDoneCount,
        syncPsn, importSelected, updateSelected,
        backupLoading, importing, showImportModal, importFileData, toast,
        exportBackup, importBackup, closeImportModal, confirmImport,
        migrateScanLoading, migrateScanned, migrateScanError, migrateGames, migrateFilter,
        migrateSelectedMap, migrateLoading, migrateProgress, migrateDone, migrateTotal,
        migrateError, migrateDoneCount,
        filteredMigrationGames, migrateSelectedCount, migrateKandidatCount, migrateLinkedCount, migrateNoMatchCount,
        migrateStatusLabel, migrateSelectAll, scanMigration, runMigration,
        refreshLoading, refreshProgress, refreshDone, refreshTotal, refreshError, refreshDoneCount,
        runRefresh
      };
    }
  };
  </script>
