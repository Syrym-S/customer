import { useTranslation } from "react-i18next";
import {
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Radio,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { PageContainer } from "../../shared/ui/PageContainer";
import {
  notifyError,
  notifySuccess,
} from "../../shared/model/notifications.store";
import { DEFAULT_LANGUAGE } from "../../shared/i18n/language";
import { useLanguagesStore } from "../../shared/model/languages.store";
import { usePushNotificationsStore } from "../../widgets/customer-notifications/model/push-notifications.store";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const availableLanguages = useLanguagesStore((state) => state.availableLanguages);

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isEnabled: isPushEnabled,
    isBusy: isPushBusy,
    enable: enablePush,
    disable: disablePush,
  } = usePushNotificationsStore();

  const currentLanguage =
    i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE;

  const isPushBlocked = pushPermission === "denied";

  async function handleTogglePush(shouldEnable) {
    try {
      if (!shouldEnable) {
        await disablePush();
        notifySuccess(t("settings.push.disabled"));
        return;
      }

      const isGranted = await enablePush();

      if (isGranted) {
        notifySuccess(t("settings.push.enabled"));
        return;
      }

      notifyError(t("settings.push.blocked"));
    } catch (error) {
      notifyError(
        error.response?.data?.message ||
          error.message ||
          t("settings.push.failed"),
      );
    }
  }

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
            {availableLanguages.map((language) => (
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

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                {t("settings.push.title")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {!isPushSupported
                  ? t("settings.push.unsupported")
                  : isPushBlocked
                    ? t("settings.push.blocked")
                    : t("settings.push.description")}
              </Typography>
            </Stack>

            <Switch
              checked={isPushEnabled}
              disabled={!isPushSupported || isPushBusy}
              onChange={(event) => handleTogglePush(event.target.checked)}
              inputProps={{ "aria-label": t("settings.push.title") }}
            />
          </Stack>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
