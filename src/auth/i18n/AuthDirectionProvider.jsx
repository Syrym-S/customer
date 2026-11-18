import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { prefixer } from "stylis";
import i18n from "./index";

const caches = {
  ltr: createCache({ key: "auth-ltr" }),
  rtl: createCache({ key: "auth-rtl", stylisPlugins: [prefixer, rtlPlugin] }),
};

const themes = {
  ltr: createTheme({ direction: "ltr" }),
  rtl: createTheme({ direction: "rtl" }),
};

export default function AuthDirectionProvider({ children }) {
  useTranslation("translation", { i18n });
  const language = i18n.resolvedLanguage || i18n.language;
  const direction = i18n.dir(language);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousDir = root.getAttribute("dir");
    const previousLang = root.getAttribute("lang");

    // Set direction on HTML so portaled menus and dialogs inherit it too.
    root.setAttribute("dir", direction);
    root.setAttribute("lang", language);

    return () => {
      if (previousDir === null) root.removeAttribute("dir");
      else root.setAttribute("dir", previousDir);
      if (previousLang === null) root.removeAttribute("lang");
      else root.setAttribute("lang", previousLang);
    };
  }, [direction, language]);

  return (
    <CacheProvider value={caches[direction]}>
      <ThemeProvider theme={themes[direction]}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
