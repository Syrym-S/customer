import { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Button, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";

import { DEFAULT_LANGUAGE } from "../i18n/language";
import { useLanguagesStore } from "../model/languages.store";

export function LanguageSwitcher({ sx }) {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const availableLanguages = useLanguagesStore((state) => state.availableLanguages);

  const currentLanguage =
    i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE;

  function handleOpen(event) {
    const anchorElement = event.currentTarget;

    anchorElement.blur();
    setAnchorEl(anchorElement);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleSelect(language) {
    handleClose();

    if (language === currentLanguage) {
      return;
    }

    i18n.changeLanguage(language);
  }

  return (
    <>
      <Tooltip title={t("settings.language.switcherLabel")}>
        <Button
          variant="outlined"
          onClick={handleOpen}
          aria-label={t("settings.language.switcherLabel")}
          sx={{
            minWidth: 0,
            px: 1.25,
            color: "text.primary",
            borderColor: "divider",
            textTransform: "uppercase",
            ...sx,
          }}
        >
          {currentLanguage}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        // Opening the list leaves the page scroll untouched, so the scrollbar
        // is not swapped for padding and the header controls stay put. The
        // menu keeps hanging off its button because the header is sticky.
        disableScrollLock
      >
        {availableLanguages.map((language) => (
          <MenuItem
            key={language}
            selected={language === currentLanguage}
            onClick={() => handleSelect(language)}
          >
            <ListItemText>{t(`settings.languages.${language}`)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

LanguageSwitcher.propTypes = {
  sx: PropTypes.object,
};
