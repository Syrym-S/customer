import { useTranslation } from "react-i18next";
import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Radio,
  Stack,
  Typography,
} from "@mui/material";

import { PageContainer } from "../../shared/ui/PageContainer";
import { notifySuccess } from "../../shared/model/notifications.store";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../../shared/i18n/language";

export function SettingsPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage =
    i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE;

  async function handleSelectLanguage(language) {
    if (language === currentLanguage) {
      return;
    }

    await i18n.changeLanguage(language);

    notifySuccess(t("settings.language.saved"));
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={600}>
          {t("settings.title")}
        </Typography>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t("settings.language.title")}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {t("settings.language.description")}
            </Typography>
          </Stack>

          <List sx={{ mt: 1 }}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <ListItemButton
                key={language}
                selected={language === currentLanguage}
                onClick={() => handleSelectLanguage(language)}
                sx={{ borderRadius: 1 }}
              >
                <Radio
                  checked={language === currentLanguage}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-label": t(`settings.languages.${language}`),
                  }}
                />

                <ListItemText
                  primary={t(`settings.languages.${language}`)}
                  secondary={language.toUpperCase()}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
