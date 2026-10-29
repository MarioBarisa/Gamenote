// src/views/Profile.vue
<template>
  <div v-if="loadError" role="alert" class="alert alert-error mb-4">{{ loadError }}</div>
  <div class="profile">
    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Profil</h1>
    
    <div class="profile-sections">
      <div class="profile-sidebar">
        <section class="card bg-base-200 profile-details" aria-labelledby="profile-details-title">
          <div class="card-body">
            <div class="flex items-center gap-4 mb-4">
              <div class="avatar shrink-0">
                <div class="w-16 rounded-full ring ring-primary ring-offset-2">
                  <img :src="profileImageFailed ? fallbackAvatar : profileImageUrl" alt="Profilna slika" @error="handleImageError" />
                </div>
              </div>
              <h2 id="profile-details-title" class="text-lg sm:text-xl font-semibold">Osobni podaci</h2>
            </div>

            <form class="profile-form" @submit.prevent="updateProfile">
              <div class="form-control">
                <label for="profile-name" class="label mb-1">Ime</label>
                <input id="profile-name" v-model="profileForm.name" type="text" autocomplete="nickname"
                  class="input input-bordered w-full" placeholder="Vaše ime" required />
              </div>
              <div class="form-control">
                <label for="profile-email" class="label mb-1">Email</label>
                <input id="profile-email" type="email" :value="userStore.user?.email"
                  class="input input-bordered w-full opacity-50" disabled />
              </div>
              <div class="form-control">
                <label for="profile-avatar" class="label mb-1">Profilna slika</label>
                <input id="profile-avatar" type="file" accept="image/*" class="file-input file-input-bordered w-full"
                  :disabled="uploading" @change="handleFileUpload" />
                <div class="flex flex-wrap justify-between gap-1 mt-2 text-xs text-base-content/60">
                  <span>Maksimalno 3 MB (JPG, PNG, GIF, WebP)</span>
                  <span v-if="uploading" class="text-info">Uploadam...</span>
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-full" :disabled="updating">
                <span v-if="updating" class="loading loading-spinner"></span>
                <span v-else>Spremi promjene</span>
              </button>
            </form>
          </div>
        </section>

        <section class="card bg-base-200 profile-security" aria-labelledby="profile-security-title">
          <div class="card-body">
            <h2 id="profile-security-title" class="text-lg sm:text-xl font-semibold mb-4">Sigurnost</h2>
            <form class="profile-form" @submit.prevent="updatePassword">
              <div class="form-control">
                <label for="profile-new-password" class="label mb-1">Nova lozinka</label>
                <input id="profile-new-password" v-model="passwordForm.newPassword" type="password" autocomplete="new-password"
                  class="input input-bordered w-full" placeholder="Minimalno 6 znakova" minlength="6" />
              </div>
              <div class="form-control">
                <label for="profile-confirm-password" class="label mb-1">Potvrdi lozinku</label>
                <input id="profile-confirm-password" v-model="passwordForm.confirmPassword" type="password" autocomplete="new-password"
                  class="input input-bordered w-full" placeholder="Ponovite lozinku" />
              </div>
              <div v-if="passwordForm.newPassword && !passwordsMatch" class="text-error text-sm">
                Lozinke se ne poklapaju
              </div>
              <button type="submit" class="btn btn-secondary w-full" :disabled="updatingPassword || !passwordsMatch">
                <span v-if="updatingPassword" class="loading loading-spinner"></span>
                <span v-else>Promijeni lozinku</span>
              </button>
            </form>
          </div>
        </section>
      </div>

      <div class="profile-main">
        <!-- Kartica i izvoz dijele prikaz -->
        <section class="card bg-base-200 profile-gamercard" aria-labelledby="profile-gamercard-title">
          <div class="card-body">
            <div class="flex flex-wrap justify-between items-center mb-4 gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <h2 id="profile-gamercard-title" class="text-lg sm:text-xl font-semibold">Tvoja Gamenote kartica</h2>
                  <button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="O Gamenote signature boji i titulama" @click="cardInfo.showModal()">
                    <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></svg>
                  </button>
                </div>
                <p class="text-sm text-base-content/60 mt-1"></p>
              </div>
              <div class="flex flex-wrap gap-2" role="group" aria-label="Izvoz kartice" :aria-busy="exporting">
                <button type="button" class="btn btn-sm btn-ghost" :disabled="loading || !!loadError" @click="openCardEditor">Uredi karticu</button>
                <button type="button" class="btn btn-sm btn-primary" aria-label="Preuzmi karticu" title="Preuzmi PNG" :disabled="exporting || loading || !!loadError" @click="exportCard">
                  <span v-if="exporting" class="loading loading-spinner loading-xs" aria-hidden="true"></span>
                  <svg v-else class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4"/></svg>
                  <span class="hidden sm:inline">Preuzmi karticu</span><span class="sm:hidden">PNG</span>
                </button>
              </div>
            </div>
            <p v-if="cardColor === 'signature'" class="text-xs text-base-content/60 mb-3">
              Gamenote signature · {{ signature.genre || 'Automatski' }}
            </p>
            <div v-if="loading" class="skeleton h-80 w-full" role="status" aria-label="Učitavanje kartice"></div>
            <GamerCard v-else-if="!loadError" ref="gamingCardRef" card-id="gaming-card" :games="games"
              :name="userStore.user?.user_metadata?.name || 'Igrač'" :email="userStore.user?.email || ''" :avatar-url="profileImageUrl"
              :created-at="userStore.user?.created_at || ''" :color="cardColor" :theme="cardTheme" />
            <p v-if="exporting" role="status" class="text-sm text-base-content/70 mt-2">Pripremam sliku visoke rezolucije…</p>
          </div>
        </section>

        <section class="card bg-base-200 profile-achievements" aria-labelledby="profile-achievements-title">
          <div class="card-body">
            <h2 id="profile-achievements-title" class="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <AchievementIcon name="medal" class="size-5 text-warning" />
              Postignuća
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div v-for="achievement in achievements" :key="achievement.id"
                   class="flex flex-col items-center p-4 bg-base-100 rounded-lg"
                   :class="achievement.unlocked ? 'opacity-100' : 'opacity-50'">
                <AchievementIcon :name="achievement.icon" class="size-7 mb-2" :class="achievement.iconColor" />
                <p class="font-medium text-sm text-center">{{ achievement.title }}</p>
                <p class="text-xs text-base-content/70 text-center">{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="card bg-base-200 profile-account" aria-labelledby="profile-account-title">
        <div class="card-body">
          <h2 id="profile-account-title" class="text-lg sm:text-xl font-semibold mb-4">Račun</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h3 class="font-medium">Sesija</h3>
                <p class="text-sm text-base-content/60 mt-1">Odjavi se na ovom uređaju.</p>
              </div>
              <button type="button" class="btn btn-sm btn-outline shrink-0" @click="logout">Odjavi se</button>
            </div>
            <div class="flex items-center justify-between gap-4 border-t border-base-content/10 pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
              <div>
                <h3 class="font-medium">Brisanje računa</h3>
                <p class="text-sm text-base-content/60 mt-1">Trajno ukloni račun i podatke.</p>
              </div>
              <button type="button" class="btn btn-sm btn-outline btn-error shrink-0" :disabled="deletingAccount" @click="showDeleteModal = true">
                <span v-if="deletingAccount" class="loading loading-spinner"></span>
                <span v-else>Obriši račun</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    
    <dialog ref="cardInfo" class="modal" aria-labelledby="card-info-title">
      <div class="modal-box card-info-copy">
        <h2 id="card-info-title" class="text-xl font-semibold shrink-0 mb-4">Gamenote signature i titule</h2>
        <div class="card-info-scroll">
          <h3 class="font-semibold mb-2">Tvoja signature boja</h3>
          <p class="text-sm text-base-content/75">Zadana boja Gamercarda prati omiljeni žanr: žanr koji se pojavljuje na najviše igara u tvojoj biblioteci. Jedna igra može pripadati više žanrova. Kod izjednačenja koristi se prvi među jednako zastupljenim žanrovima.</p>
          <div class="overflow-x-auto mt-3">
            <table class="table table-sm">
              <thead><tr><th>Žanrovi</th><th>daisyUI paleta</th></tr></thead>
              <tbody>
                <tr v-for="rule in GENRE_THEMES" :key="rule.theme">
                  <td class="whitespace-normal">{{ rule.genres.join(', ') }}</td>
                  <td><span class="inline-flex items-center gap-2"><CardThemePreview :theme="signatureForGenre(rule.genres[0])" />{{ rule.theme }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3 class="font-semibold mt-6 mb-2">Kako dobivaš titulu</h3>
          <p class="text-sm text-base-content/75">Zbrajaju se zabilježeni sati svih igara u biblioteci. Dobivaš najvišu titulu čiji si prag dosegnuo; prag vrijedi od navedenog broja sati, uključivo.</p>
          <table class="table table-sm mt-3">
            <thead><tr><th>Titula</th><th>Ukupno sati</th></tr></thead>
            <tbody><tr v-for="title in PLAYER_TITLES" :key="title.hours"><td>{{ title.label }}</td><td>Od {{ formatCardNumber(title.hours) }} h</td></tr></tbody>
          </table>
          <p class="text-sm text-base-content/75 mt-3">Omiljena igra je ona s najviše zabilježenih sati. Igra bez vremena igranja ne ulazi u taj izbor.</p>
        </div>
        <form method="dialog" class="modal-action"><button class="btn btn-primary">Razumijem</button></form>
      </div>
      <form method="dialog" class="modal-backdrop"><button aria-label="Zatvori informacije">Zatvori</button></form>
    </dialog>

    <dialog ref="cardEditor" class="modal" aria-labelledby="card-editor-title" @close="onCardEditorClose">
      <div v-if="cardEditorOpen" class="modal-box card-editor-box">
        <div class="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 id="card-editor-title" class="text-xl font-semibold">Uredi Gamenote karticu</h2>
            <p class="text-sm text-base-content/60 mt-1">Odaberi temu i boju podloge pa provjeri izgled prije spremanja.</p>
          </div>
          <button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Zatvori uređivanje kartice" @click="closeCardEditor">✕</button>
        </div>
        <div class="card-palette-controls mb-5" role="group" aria-label="daisyUI palete">
          <button type="button" class="btn btn-sm btn-ghost signature-choice" :aria-pressed="draftCardColor === 'signature'" @click="selectSignature">
            <span class="signature-swatch" :style="{ backgroundColor: signature.primary }" aria-hidden="true"></span>
            Gamenote signature
            <span class="sr-only"> · {{ signature.genre || 'Prema omiljenom žanru' }}</span>
          </button>
          <div class="card-quick-themes" role="group" aria-label="Predefinirane teme">
            <button v-for="theme in SIGNATURE_THEMES" :key="theme.value" type="button"
              class="btn btn-sm sm:btn-circle btn-ghost theme-choice tooltip tooltip-bottom" :data-tip="theme.label"
              :aria-label="theme.label" :aria-pressed="draftCardColor === theme.value"
              @click="selectDraftTheme(theme.value)">
              <span class="theme-swatch" :style="{ backgroundColor: theme.primary }" aria-hidden="true"></span>
              <span class="sm:hidden">{{ theme.label }}</span>
            </button>
          </div>
          <div class="card-custom-controls">
            <label class="btn btn-sm btn-ghost card-color-choice" title="Vlastita boja" :class="{ 'card-choice-active': draftCardColor.startsWith('#') }">
              <input type="color" aria-label="Vlastita boja kartice" :value="draftColorHex"
                class="card-custom-color" @input="draftCardColor = $event.target.value" />
              <span>Vlastita boja</span>
            </label>
            <CardThemePicker :model-value="draftCardTheme" @update:model-value="changeDraftTheme" />
          </div>
        </div>
        <GamerCard class="card-editor-preview" card-id="gaming-card-preview" :games="games" :color="draftCardColor" :theme="draftCardTheme"
          :name="userStore.user?.user_metadata?.name || 'Igrač'" :email="userStore.user?.email || ''" :avatar-url="profileImageUrl"
          :created-at="userStore.user?.created_at || ''" />
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="closeCardEditor">Odustani</button>
          <button type="button" class="btn btn-primary" @click="saveCardEditor">Spremi izgled</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button aria-label="Zatvori uređivač">Zatvori</button></form>
    </dialog>

    <div v-if="toast.show" class="toast toast-top toast-end">
      <div class="alert" :class="toast.type === 'success' ? 'alert-success' : 'alert-error'">
        <span>{{ toast.message }}</span>
      </div>
    </div>

    <!-- Modal za brisanje računa -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="card bg-base-200 w-full max-w-md mx-4 shadow-2xl">
        <div class="card-body p-6">

          <!-- Gamenote logo -->
          <div class="flex justify-center mb-4">
            <GamenoteBanner class="h-10 w-auto max-w-full object-contain" />
          </div>

          <h3 class="text-xl font-bold text-center text-error">Obriši račun</h3>

          <div class="mt-4 p-4 bg-error/10 rounded-lg border border-error/30">
            <p class="text-sm leading-relaxed">
              Ova radnja će trajno obrisati vaš korisnički račun i sve povezane podatke.
              Ovo se <strong>ne može poništiti</strong>.
            </p>
          </div>

          <!-- Re-auth forma ako je sesija istekla -->
          <div v-if="needsReauth" class="mt-4 p-3 bg-warning/20 rounded-lg border border-warning/40">
            <p class="text-sm font-medium mb-2">Sesija je istekla — prijavite se ponovno:</p>
            <input v-model="reauthEmail" type="email" class="input input-bordered w-full mb-2" placeholder="Email" />
            <input v-model="reauthPassword" type="password" class="input input-bordered w-full mb-2" placeholder="Lozinka" />
            <p v-if="reauthError" class="text-error text-sm mb-2">{{ reauthError }}</p>
            <button @click="handleReauthAndDelete" class="btn btn-warning w-full" :disabled="deletingAccount">
              <span v-if="deletingAccount" class="loading loading-spinner"></span>
              <span v-else>Prijavi se i obriši račun</span>
            </button>
          </div>

          <!-- Normalna potvrda (bez re-auth) -->
          <div v-else class="mt-4">
            <label class="label">
              <span class="label-text">Upišite <span class="font-mono font-bold">DELETE</span> za potvrdu:</span>
            </label>
            <input
              v-model="deleteConfirmInput"
              type="text"
              class="input input-bordered w-full text-center font-mono text-lg tracking-widest"
              placeholder="DELETE"
              @keyup.enter="handleDeleteAccount"
            />
          </div>

          <div class="flex gap-2 mt-6">
            <button @click="closeDeleteModal" class="btn btn-ghost flex-1" :disabled="deletingAccount">Odustani</button>
            <button
              v-if="!needsReauth"
              @click="handleDeleteAccount"
              class="btn btn-error flex-1"
              :disabled="deleteConfirmInput !== 'DELETE' || deletingAccount"
            >
              <span v-if="deletingAccount" class="loading loading-spinner"></span>
              <span v-else>Obriši račun</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { disconnectPsn } from '../services/psnService';
import { clearImporterChoices } from '../services/importerResolution';
import { fetchUserRows } from '../services/libraryData';
import { requestAppApi } from '../services/appApi';
import { localAvatar } from '../services/safeContent';
import { ref, reactive, onMounted, computed, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import Chart from 'chart.js/auto';
import GamenoteBanner from '../components/GamenoteBanner.vue';
import GamerCard from '../components/GamerCard.vue';
import CardThemePicker from '../components/CardThemePicker.vue';
import CardThemePreview from '../components/CardThemePreview.vue';
import AchievementIcon from '../components/AchievementIcon.vue';
import { getProfileAchievements } from '../services/profileAchievements.js';
import { getGamerCardStats, PLAYER_TITLES, formatCardNumber } from '../services/gamerCard.js';
import { SIGNATURE_THEMES, GENRE_THEMES, signatureForGenre, cardColorValue, cardColorHex, validCardColor, loadCardColor, saveCardColor, loadCardTheme, saveCardTheme } from '../services/cardAppearance.js';

const THROW = (err) => { if (err) throw err; };

export default {
  components: { GamenoteBanner, GamerCard, CardThemePicker, CardThemePreview, AchievementIcon },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const games = ref([]);
    const loading = ref(false);
    const updating = ref(false);
    const updatingPassword = ref(false);
    const uploading = ref(false);
    const genreChartRef = ref(null);
    const platformChartRef = ref(null);
    const gamingCardRef = ref(null);
    const exporting = ref(false);
    const cardColor = ref(loadCardColor(userStore.user?.id));
    const cardTheme = ref(loadCardTheme(userStore.user?.id));
    const cardInfo = ref(null);
    const cardEditor = ref(null);
    const cardEditorOpen = ref(false);
    const draftCardColor = ref('signature');
    const draftCardTheme = ref('');
    const signature = computed(() => signatureForGenre(getGamerCardStats(games.value).favoriteGenre?.name));
    const draftColorHex = computed(() => cardColorHex(cardColorValue(draftCardColor.value, signature.value.genre)));

    const openCardEditor = async () => {
      draftCardColor.value = cardColor.value;
      draftCardTheme.value = cardTheme.value || signature.value.value;
      if (cardColor.value === 'signature') draftCardTheme.value = signature.value.value;
      else if (cardColor.value.startsWith('theme:')) draftCardTheme.value = cardColor.value;
      cardEditorOpen.value = true;
      await nextTick();
      cardEditor.value.showModal();
    };
    const closeCardEditor = () => {
      cardEditor.value.close();
      cardEditorOpen.value = false;
    };
    const onCardEditorClose = () => {
      if (!cardEditor.value?.open) cardEditorOpen.value = false;
    };
    const selectSignature = () => {
      draftCardColor.value = 'signature';
      draftCardTheme.value = signature.value.value;
    };
    const selectDraftTheme = (value) => {
      draftCardColor.value = value;
      draftCardTheme.value = value;
    };
    const changeDraftTheme = (value) => {
      draftCardTheme.value = value;
      if (!validCardColor(draftCardColor.value)) draftCardColor.value = value;
    };
    const saveCardEditor = () => {
      cardColor.value = draftCardColor.value;
      cardTheme.value = draftCardTheme.value;
      closeCardEditor();
    };
    watch(cardColor, value => saveCardColor(userStore.user?.id, value));
    watch(cardTheme, value => saveCardTheme(userStore.user?.id, value));
    watch(() => userStore.user?.id, id => {
      cardColor.value = loadCardColor(id);
      cardTheme.value = loadCardTheme(id);
    });
    const profileImageFailed = ref(false);
    const fallbackAvatar = computed(() => localAvatar(userStore.user?.user_metadata?.name));
    let genreChart = null;
    let platformChart = null;
    
    
    const profileForm = reactive({
      name: userStore.user?.user_metadata?.name || '',
      avatarUrl: userStore.user?.user_metadata?.avatar_url || ''
    });
    
    watch(() => profileForm.avatarUrl, () => { profileImageFailed.value = false; });
    watch(() => userStore.user?.user_metadata?.avatar_url, value => {
      if (!profileForm.avatarUrl) profileForm.avatarUrl = value || '';
    });

    const passwordForm = reactive({
      newPassword: '',
      confirmPassword: ''
    });
    
    
    const toast = reactive({
      show: false,
      message: '',
      type: 'success'
    });

    // Delete account state
    const showDeleteModal = ref(false);
    const deleteConfirmInput = ref('');
    const deletingAccount = ref(false);
    const needsReauth = ref(false);
    const reauthEmail = ref('');
    const reauthPassword = ref('');
    const reauthError = ref('');

    const profileImageUrl = computed(() => {
      return profileForm.avatarUrl || localAvatar(userStore.user?.user_metadata?.name);
    });
    
    const passwordsMatch = computed(() => {
      return passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 6;
    });
    
    const statistics = computed(() => {
      const card = getGamerCardStats(games.value);
      return {
        totalGames: card.total,
        currentlyPlaying: card.playing,
        completed: card.completed,
        totalPlayTime: card.hours
      };
    });

    const recentGames = computed(() => {
      return games.value.slice(0, 6).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    
    const averagePlayTime = computed(() => {
      if (statistics.value.totalGames === 0) return '0';
      return Math.round(statistics.value.totalPlayTime / statistics.value.totalGames);
    });
    
    const genreData = computed(() => {
      const genreCount = {};
      games.value.forEach(game => {
        if (game.genre) {
          game.genre.split(',').forEach(g => {
            const genre = g.trim();
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });
      return genreCount;
    });
    
    const platformData = computed(() => {
      const platformCount = {};
      games.value.forEach(game => {
        if (game.platform) {
          platformCount[game.platform] = (platformCount[game.platform] || 0) + 1;
        }
      });
      return platformCount;
    });
    
    
    const showToast = (message, type = 'success') => {
      toast.message = message;
      toast.type = type;
      toast.show = true;
      setTimeout(() => toast.show = false, 3000);
    };
    
    const handleImageError = () => {
      profileImageFailed.value = true;
    };
    
    // pošalji na imgBB
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // sprijeci velike slike
      if (file.size > 3 * 1024 * 1024) {
        showToast('Slika je prevelika. Maksimalno 3 MB.', 'error');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        showToast('Molimo odaberite sliku.', 'error');
        return;
      }
      
      uploading.value = true;
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) THROW(new Error('Prijavi se ponovno.'));
        const image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1]);
          reader.onerror = () => reject(new Error('Sliku nije moguće pročitati.'));
          reader.readAsDataURL(file);
        });
        const data = await requestAppApi({ action: 'avatar', image }, { token: sessionData.session.access_token });
        profileForm.avatarUrl = data.url;
        showToast('Slika uspješno prenesena!');
      } catch (error) {
        console.error('Greška pri uploadu:', error);
        showToast(error.message || 'Greška pri uploadu slike', 'error');
      } finally {
        uploading.value = false;
        event.target.value = '';
      }
    };
    
    const updateProfile = async () => {
      updating.value = true;
      
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: profileForm.name,
            avatar_url: profileForm.avatarUrl
          }
        });
        
        if (error) THROW(error);
        
        await userStore.fetchUser();
        showToast('Profil uspješno ažuriran!');
      } catch (error) {
        console.error('Greška pri ažuriranju profila:', error);
        showToast('Greška pri ažuriranju profila', 'error');
      } finally {
        updating.value = false;
      }
    };
    
    const updatePassword = async () => {
      if (!passwordsMatch.value) return;
      
      updatingPassword.value = true;
      
      try {
        const { error } = await supabase.auth.updateUser({
          password: passwordForm.newPassword
        });
        
        if (error) THROW(error);
        
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        showToast('Lozinka uspješno promijenjena!');
      } catch (error) {
        console.error('Greška pri mijenjanju lozinke:', error);
        showToast('Greška pri mijenjanju lozinke', 'error');
      } finally {
        updatingPassword.value = false;
      }
    };
    
    const logout = async () => {
      try {
        await disconnectPsn(userStore.user?.id);
        localStorage.removeItem('gamenote.steam.snapshot.' + userStore.user?.id);
        await userStore.logout();
        router.push('/login');
      } catch (error) {
        console.error('Greška pri odjavi:', error);
      }
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    const renderCharts = () => {
      if (games.value.length === 0) return;
      
      // Grafikon žanrova --> MAKNUO SAM
      if (genreChartRef.value && Object.keys(genreData.value).length) {
        if (genreChart) genreChart.destroy();
        
        genreChart = new Chart(genreChartRef.value, {
          type: 'doughnut',
          data: {
            labels: Object.keys(genreData.value),
            datasets: [{
              data: Object.values(genreData.value),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                '#FF9F40', '#8C9EFF', '#69F0AE', '#FFD54F', '#7986CB'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
      
      // Grafikon platforma  --> MAKNUO SAM
      if (platformChartRef.value && Object.keys(platformData.value).length) {
        if (platformChart) platformChart.destroy();
        
        platformChart = new Chart(platformChartRef.value, {
          type: 'bar',
          data: {
            labels: Object.keys(platformData.value),
            datasets: [{
              label: 'Broj igara',
              data: Object.values(platformData.value),
              backgroundColor: '#36A2EB'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });
      }
    };
    
    const loadError = ref('');
    const fetchGames = async () => {
      loadError.value = '';
      if (!userStore.user) return;
      
      loading.value = true;
      
      try {
        const data = await fetchUserRows(supabase, 'games', userStore.user.id);
        games.value = data || [];
        renderCharts();
      } catch (error) {
        loadError.value = error.message || 'Knjižnicu nije moguće učitati. Osvježi stranicu.';
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchGames();
    });
    
    onUnmounted(() => {
      if (genreChart) genreChart.destroy();
      if (platformChart) platformChart.destroy();
    });
    
    const achievements = computed(() => getProfileAchievements(games.value));

    const exportCard = async () => {
      if (!gamingCardRef.value || exporting.value || loading.value || loadError.value) return;
      exporting.value = true;
      let downloadUrl;
      try {
        const blob = await gamingCardRef.value.exportImage();
        downloadUrl = URL.createObjectURL(blob);
        const userName = (userStore.user?.user_metadata?.name || 'igrac').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 80);
        const link = document.createElement('a');
        link.download = `gamenote-kartica-${userName}.png`;
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Kartica je spremna za preuzimanje (PNG).');
      } catch (error) {
        console.error('Greška pri izvozu kartice:', error);
        showToast(error.message || 'Karticu nije moguće izvesti. Pokušaj ponovno.', 'error');
      } finally {
        exporting.value = false;
        if (downloadUrl) setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
      }
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      deleteConfirmInput.value = '';
      needsReauth.value = false;
      reauthEmail.value = '';
      reauthPassword.value = '';
      reauthError.value = '';
    };

    const handleDeleteAccount = async () => {
      if (deleteConfirmInput.value !== 'DELETE' || deletingAccount.value) return;

      deletingAccount.value = true;

      try {
        const { error } = await supabase.rpc('delete_user_account');

        if (error) {
          if (error.message?.includes('JWT') || error.code === 'PGRST301') {
            needsReauth.value = true;
            deletingAccount.value = false;
            return;
          }
          THROW(error);
        }

        clearImporterChoices(userStore.user?.id);
        await disconnectPsn(userStore.user?.id);
        localStorage.removeItem('gamenote.steam.snapshot.' + userStore.user?.id);
        await userStore.logout();
        router.push('/login');
      } catch (error) {
        console.error('Greška pri brisanju računa:', error);
        showToast(error.message || 'Greška pri brisanju računa', 'error');
        deletingAccount.value = false;
      }
    };

    const handleReauthAndDelete = async () => {
      if (deletingAccount.value) return;
      reauthError.value = '';

      deletingAccount.value = true;

      try {
        const accountId = userStore.user?.id;
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: reauthEmail.value,
          password: reauthPassword.value
        });

        if (signInError || signInData.user?.id !== accountId) {
          reauthError.value = 'Pogrešna e-mail adresa ili lozinka.';
          deletingAccount.value = false;
          return;
        }

        const { error } = await supabase.rpc('delete_user_account');

        if (error) THROW(error);

        clearImporterChoices(userStore.user?.id);
        await disconnectPsn(userStore.user?.id);
        localStorage.removeItem('gamenote.steam.snapshot.' + userStore.user?.id);
        await userStore.logout();
        router.push('/login');
      } catch (error) {
        console.error('Greška pri brisanju računa:', error);
        showToast(error.message || 'Greška pri brisanju računa', 'error');
        deletingAccount.value = false;
      }
    };

    return { loadError,
      userStore,
      loading,
      updating,
      updatingPassword,
      uploading,
      profileForm,
      passwordForm,
      profileImageUrl,
      profileImageFailed,
      fallbackAvatar,
      SIGNATURE_THEMES,
      cardTheme,
      draftCardTheme,
      selectSignature,
      selectDraftTheme,
      changeDraftTheme,
      GENRE_THEMES,
      signatureForGenre,
      PLAYER_TITLES,
      formatCardNumber,
      cardInfo,
      signature,
      cardEditor,
      cardEditorOpen,
      draftCardColor,
      draftColorHex,
      openCardEditor,
      closeCardEditor,
      onCardEditorClose,
      saveCardEditor,
      cardColor,
      passwordsMatch,
      toast,
      updateProfile,
      updatePassword,
      logout,
      handleImageError,
      handleFileUpload,
      handleDeleteAccount,
      handleReauthAndDelete,
      closeDeleteModal,
      showDeleteModal,
      deleteConfirmInput,
      deletingAccount,
      needsReauth,
      reauthEmail,
      reauthPassword,
      reauthError,
      formatDate,
      statistics,
      recentGames,
      averagePlayTime,
      genreData,
      platformData,
      genreChartRef,
      platformChartRef,
      games,
      gamingCardRef,
      exporting,
      achievements,
      exportCard
    };
  }
};
</script>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.profile-sections {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
}

.profile-sidebar,
.profile-main {
  display: contents;
}

.profile-details { order: 1; }
.profile-gamercard { order: 2; }
.profile-achievements { order: 3; }
.profile-security { order: 4; }
.profile-account { order: 5; }

.profile-form {
  display: grid;
  gap: 16px;
}

.profile-form .form-control {
  margin: 0;
}

@media (min-width: 1024px) {
  .profile-sections {
    grid-template-columns: minmax(300px, 1fr) minmax(0, 2fr);
    align-items: start;
    gap: 24px;
  }

  .profile-sidebar,
  .profile-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
  }

  .profile-security {
    order: 2;
  }

  .profile-account {
    grid-column: 1 / -1;
  }
}

.card {
  border-radius: 12px;
  overflow: hidden;
}

.card-body {
  padding: clamp(16px, 2vw, 24px);
  min-width: 0;
}

.toast {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.loading {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 4px solid transparent;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.card-info-copy {
  display: flex;
  flex-direction: column;
  width: min(640px, calc(100vw - 32px));
  max-width: 800px;
  height: 560px;
  max-height: calc(100dvh - 96px);
  padding: clamp(28px, 4vw, 32px);
  overflow: hidden;
}

.card-info-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 8px;
}

.card-info-copy .modal-action {
  flex-shrink: 0;
  margin-top: 20px;
}

@media (min-width: 768px) {
  .card-info-copy {
    width: min(800px, calc(100vw - 64px));
    height: 720px;
  }
}

.card-info-copy p {
  text-align: justify;
}

.card-editor-box {
  width: min(1000px, calc(100vw - 24px));
  max-width: 1000px;
  max-height: 90dvh;
  padding: clamp(14px, 3vw, 28px);
}

.card-editor-box > .card-editor-preview {
  max-width: 760px;
  margin-inline: auto;
}

.card-palette-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.card-custom-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.card-quick-themes {
  display: flex;
  gap: 8px;
  min-width: 0;
}

@media (max-width: 639px) {
  .signature-choice {
    width: 100%;
    justify-content: flex-start;
  }

  .card-quick-themes {
    width: 100%;
    padding: 3px;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .card-custom-controls {
    width: 100%;
    justify-content: space-between;
  }
}

.card-palette-controls .btn {
  flex-shrink: 0;
  padding-block: 0;
}

.signature-choice,
.card-color-choice {
  padding-inline: 8px;
}

.signature-choice[aria-pressed="true"],
.card-quick-themes [aria-pressed="true"],
.card-choice-active,
.card-color-choice:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.signature-swatch,
.theme-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgb(128 128 128 / 35%);
}

.card-custom-color {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid rgb(128 128 128 / 35%);
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.card-custom-color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.card-custom-color::-webkit-color-swatch {
  border: 0;
  border-radius: 50%;
}

.card-custom-color::-moz-color-swatch {
  border: 0;
  border-radius: 50%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
