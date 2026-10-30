import { create } from 'zustand';

import { fetchLanguagesApi } from '../api/languages.api';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n/language';
import i18n from '../i18n';

export const useLanguagesStore = create((set, get) => ({
   availableLanguages: SUPPORTED_LANGUAGES,
   isLoaded: false,

   async loadLanguages() {
      try {
         const results = await fetchLanguagesApi();

         const codes = results
            .map((item) => item.code)
            .filter((code) => SUPPORTED_LANGUAGES.includes(code));

         const availableLanguages = codes.length ? codes : SUPPORTED_LANGUAGES;

         set({ availableLanguages, isLoaded: true });

         const currentLanguage = i18n.resolvedLanguage || i18n.language;

         if (!availableLanguages.includes(currentLanguage)) {
            i18n.changeLanguage(DEFAULT_LANGUAGE);
         }
      } catch {
         set({ availableLanguages: SUPPORTED_LANGUAGES, isLoaded: false });
      }
   },
}));
