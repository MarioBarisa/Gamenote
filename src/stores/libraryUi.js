import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'gamenote_library_ui';

const DEFAULTS = {
  activeFilter: 'all',
  searchQuery: '',
  sortField: 'created_at',
  sortOrder: 'desc'
};

// Pamti stanje /library pogleda (filteri, pretraga, sortiranje + scroll)
// dok korisnik ode u detalje igre, da se pri povratku sve vrati.
// sessionStorage: preživi reload, počisti se zatvaranjem taba.
export const useLibraryUiStore = defineStore('libraryUi', () => {
  const activeFilter = ref(DEFAULTS.activeFilter);
  const searchQuery = ref(DEFAULTS.searchQuery);
  const sortField = ref(DEFAULTS.sortField);
  const sortOrder = ref(DEFAULTS.sortOrder);
  const savedScrollY = ref(0);
  const shouldRestore = ref(false);

  const loadState = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.activeFilter === 'string') activeFilter.value = saved.activeFilter;
      if (typeof saved.searchQuery === 'string') searchQuery.value = saved.searchQuery;
      if (typeof saved.sortField === 'string') sortField.value = saved.sortField;
      if (typeof saved.sortOrder === 'string') sortOrder.value = saved.sortOrder;
    } catch (e) {
      console.warn('Ne mogu učitati stanje biblioteke:', e);
    }
  };

  const persistState = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        activeFilter: activeFilter.value,
        searchQuery: searchQuery.value,
        sortField: sortField.value,
        sortOrder: sortOrder.value
      }));
    } catch (e) {
      console.warn('Ne mogu spremiti stanje biblioteke:', e);
    }
  };

  const saveViewState = ({ filter, search, field, order }) => {
    if (filter !== undefined) activeFilter.value = filter;
    if (search !== undefined) searchQuery.value = search;
    if (field !== undefined) sortField.value = field;
    if (order !== undefined) sortOrder.value = order;
    persistState();
  };

  // Pozvati pri odlasku iz /library u detalje igre
  const markForRestore = (scrollY = 0) => {
    savedScrollY.value = scrollY;
    shouldRestore.value = true;
  };

  // Pozvati nakon restorea — potroši flag da svježi dolasci idu na vrh
  const consumeRestore = () => {
    const y = savedScrollY.value;
    savedScrollY.value = 0;
    shouldRestore.value = false;
    return y;
  };

  loadState();

  return {
    activeFilter,
    searchQuery,
    sortField,
    sortOrder,
    savedScrollY,
    shouldRestore,
    saveViewState,
    markForRestore,
    consumeRestore
  };
});
