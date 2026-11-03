import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ka from "./locales/ka.json";
import kk from "./locales/kk.json";
import ky from "./locales/ky.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import tg from "./locales/tg.json";
import tr from "./locales/tr.json";
import ur from "./locales/ur.json";
import uz from "./locales/uz.json";
import zh from "./locales/zh.json";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  detectInitialLanguage,
  getLanguageDirection,
  storeLanguage,
} from "./language";

const initialLanguage = detectInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    ka: { translation: ka },
    de: { translation: de },
    uz: { translation: uz },
    ky: { translation: ky },
    tg: { translation: tg },
    tr: { translation: tr },
    pt: { translation: pt },
    ar: { translation: ar },
    zh: { translation: zh },
    ur: { translation: ur },
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
    document.documentElement.dir = getLanguageDirection(language);
  }
}

applyDocumentLanguage(i18n.resolvedLanguage || initialLanguage);

i18n.on("languageChanged", (language) => {
  storeLanguage(language);
  applyDocumentLanguage(language);
});

export default i18n;
