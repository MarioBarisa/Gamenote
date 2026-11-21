import { createI18n } from 'vue-i18n';
import { computed } from 'vue';
import hr from './locales/hr.json' with { type: 'json' };
import en from './locales/en.json' with { type: 'json' };

export const languages = [
  { code: 'hr', label: 'Hrvatski', format: 'hr-HR', messages: hr },
  { code: 'en', label: 'English', format: 'en-US', messages: en },
];

const storageKey = 'gamenote.locale';
const fallbackLocale = 'en';
const prerenderLocale = 'hr';

export function resolveLocale(browserLanguage, savedLocale) {
  if (languages.some(language => language.code === savedLocale)) return savedLocale;
  const code = browserLanguage?.toLowerCase().split('-')[0];
  return languages.some(language => language.code === code) ? code : fallbackLocale;
}

/** @returns {import('vue-i18n').I18n<{}, {}, {}, string, false>} */
export function createAppI18n(locale = prerenderLocale) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale,
    messages: Object.fromEntries(languages.map(language => [language.code, language.messages])),
  });
}

export const i18n = createAppI18n();
export const { locale, t } = i18n.global;
export const formatLocale = computed(() => languages.find(language => language.code === locale.value)?.format ?? locale.value);

export function initializeLocale() {
  let savedLocale;
  try {
    savedLocale = window.localStorage.getItem(storageKey);
  } catch {
    // Odabir ostaje dostupan bez pohrane.
  }
  locale.value = resolveLocale(window.navigator.language, savedLocale);
  document.documentElement.lang = locale.value;
}

export function setLocale(value) {
  if (!languages.some(language => language.code === value)) return;
  locale.value = value;
  document.documentElement.lang = value;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    // Jezik vrijedi za otvorenu stranicu.
  }
}

const serviceErrorKeys = new Map(Object.entries(hr.serviceErrors).map(([key, message]) => [message, key]));

export function translateServiceError(message) {
  const key = serviceErrorKeys.get(message);
  return key ? t(`serviceErrors.${key}`) : message;
}
