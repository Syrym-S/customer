import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import kk from "./locales/kk.json";
import ru from "./locales/ru.json";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  detectInitialLanguage,
  storeLanguage,
} from "./language";

const initialLanguage = detectInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

function applyDocumentLanguage(language) {
  if (document?.documentElement) {
    document.documentElement.lang = language;
  }
}

applyDocumentLanguage(i18n.resolvedLanguage || initialLanguage);

i18n.on("languageChanged", (language) => {
  storeLanguage(language);
  applyDocumentLanguage(language);
});

export default i18n;
