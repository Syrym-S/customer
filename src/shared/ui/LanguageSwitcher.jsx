import { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Button, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../i18n/language";

export function LanguageSwitcher({ sx }) {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {SUPPORTED_LANGUAGES.map((language) => (
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
