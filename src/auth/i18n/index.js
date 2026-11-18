import i18next from "i18next";

import ru from "./locales/ru.json";
import en from "./locales/en.json";
import kz from "./locales/kz.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import tr from "./locales/tr.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";
import uz from "./locales/uz.json";
import ky from "./locales/ky.json";
import ka from "./locales/ka.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import tg from "./locales/tg.json";
import ur from "./locales/ur.json";

const savedLanguage = localStorage.getItem("language");
const language = savedLanguage === "kz" ? "kk" : savedLanguage;

const i18n = i18next.createInstance();

i18n.init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    kk: { translation: kz },
    es: { translation: es },
    pt: { translation: pt },
    tr: { translation: tr },
    ar: { translation: ar },
    zh: { translation: zh },
    uz: { translation: uz },
    ky: { translation: ky },
    ka: { translation: ka },
    fr: { translation: fr },
    de: { translation: de },
    tg: { translation: tg },
    ur: { translation: ur },
  },
  lng: language || "ru",
  fallbackLng: "ru",
  // Original Russian messages are shared translation keys, including punctuation.
  keySeparator: false,
  nsSeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("language", language);
});

export default i18n;
