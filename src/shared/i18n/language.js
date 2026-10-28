// Текущий язык интерфейса. Источник один — здесь, чтобы и заголовок
// Accept-Language, и будущая загрузка словарей читали одно значение.

// Коды по BCP 47 — в таком виде их ждёт бэкенд в Accept-Language.
export const SUPPORTED_LANGUAGES = [
  "kk",
  "ru",
  "en",
  "es",
  "pt",
  "tr",
  "ar",
  "zh",
  "uz",
  "ky",
  "ka",
  "fr",
  "de",
  "tg",
  "ur",
];

export const DEFAULT_LANGUAGE = "ru";

const STORAGE_KEY = "customer.language";

// Имена файлов словарей исторически не совпадают с кодами языков.
const ALIASES = { kz: "kk", kaz: "kk", eng: "en", rus: "ru" };

export function normalizeLanguage(value) {
  if (!value) return null;

  // ru-RU, en_US, zh-Hans-CN -> ru, en, zh
  const base = String(value).toLowerCase().replace("_", "-").split("-")[0];
  const code = ALIASES[base] || base;

  return SUPPORTED_LANGUAGES.includes(code) ? code : null;
}

function readStoredLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // localStorage недоступен (приватный режим, заблокированные cookies).
    return null;
  }
}

let currentLanguage =
  normalizeLanguage(window?.APP_DATA?.language) ||
  readStoredLanguage() ||
  normalizeLanguage(window?.navigator?.language) ||
  DEFAULT_LANGUAGE;

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(value) {
  const code = normalizeLanguage(value);

  if (!code) return currentLanguage;

  currentLanguage = code;

  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Не критично: язык останется выбранным до перезагрузки страницы.
  }

  return currentLanguage;
}
