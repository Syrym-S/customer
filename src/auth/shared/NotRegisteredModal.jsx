import { useAuthTranslation } from "../i18n/useAuthTranslation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Box,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import {
  getEmailHref,
  getPhoneHref,
  handleContactLinkClick,
} from "../../shared/lib/contact-links";

export function NotRegisteredModal({ open, support }) {
  const { t } = useAuthTranslation();
  const { phone = "", email = "" } = support || {};

  const phoneHref = getPhoneHref(phone);
  const emailHref = getEmailHref(email);

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {t("Регистрация не подтверждена")}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {t("Ваша регистрация ожидает подтверждения. Для завершения проверки обратитесь к менеджеру.")}
        </DialogContentText>

        <Box mt={2}>
          {phone && (
            <Typography variant="body2">
              {t("Телефон:")}{" "}
              {phoneHref ? (
                <MuiLink
                  href={phoneHref}
                  onClick={(event) => handleContactLinkClick(event, phoneHref)}
                >
                  {phone}
                </MuiLink>
              ) : (
                phone
              )}
            </Typography>
          )}

          {email && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {t("Email:")}{" "}
              {emailHref ? (
                <MuiLink
                  href={emailHref}
                  onClick={(event) => handleContactLinkClick(event, emailHref)}
                >
                  {email}
                </MuiLink>
              ) : (
                email
              )}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
