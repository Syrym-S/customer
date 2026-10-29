export const SUPPORTED_LANGUAGES = ["ru", "kk", "en"];

export const DEFAULT_LANGUAGE = "ru";

const STORAGE_KEY = "customer.language";

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
