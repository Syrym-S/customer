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

export function NotRegisteredModal({ open, support }) {
  const { t } = useAuthTranslation();
  const { phone = "", email = "" } = support || {};

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
              <MuiLink href={`tel:${phone}`}>
                {phone}
              </MuiLink>
            </Typography>
          )}

          {email && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {t("Email:")}{" "}
              <MuiLink href={`mailto:${email}`}>
                {email}
              </MuiLink>
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
