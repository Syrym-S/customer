import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./index";
import { AuthLocaleContext } from "./auth-locale.context";

export function useAuthTranslation() {
  const localized = useContext(AuthLocaleContext);
  const { t: translate } = useTranslation("translation", { i18n });

  // Translate stored validation/server messages when rendering, so switching
  // languages also updates existing errors without resetting the form.
  const t = useCallback(
    (message, options) => {
      if (message && typeof message === "object" && typeof message.key === "string") {
        const values = Object.fromEntries(
          Object.entries(message.values || {}).map(([key, value]) => [
            key,
            Array.isArray(value)
              ? value.map((text) => localized ? translate(text) : text).join(", ")
              : value,
          ]),
        );
        return localized
          ? translate(message.key, { ...options, ...values })
          : message.key;
      }

      return localized && typeof message === "string" && message
        ? translate(message, options)
        : message;
    },
    [localized, translate],
  );

  return { t, i18n, localized };
}
