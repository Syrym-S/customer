export const SUPPORTED_LANGUAGES = ["ru", "kk", "en", "de", "uz", "ky", "tg", "pt", "ar", "es", "tr", "fr", "ka", "zh", "ur"];

export const DEFAULT_LANGUAGE = "ru";

export const RTL_LANGUAGES = ["ar", "ur"];

export function getLanguageDirection(language) {
  return RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
}

const STORAGE_KEY = "language";

export function normalizeLanguage(value) {
  if (!value) return null;

  const code = String(value).toLowerCase().replace("_", "-").split("-")[0];

  return SUPPORTED_LANGUAGES.includes(code) ? code : null;
}

export function readStoredLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function storeLanguage(value) {
  const code = normalizeLanguage(value);

  if (!code) return null;

  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    return code;
  }

  return code;
}

function detectBrowserLanguage() {
  const candidates = [
    ...(window?.navigator?.languages || []),
    window?.navigator?.language,
  ];

  for (const candidate of candidates) {
    const code = normalizeLanguage(candidate);

    if (code) return code;
  }

  return null;
}

export function detectInitialLanguage() {
  return (
    normalizeLanguage(window?.APP_DATA?.language) ||
    readStoredLanguage() ||
    detectBrowserLanguage() ||
    DEFAULT_LANGUAGE
  );
}
