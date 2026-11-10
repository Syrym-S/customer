import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { FactoringChatButton } from "./FactoringChatButton";
import { AppDialog } from "../../../../shared/ui/AppDialog";

const NON_CANCELLABLE_STATUSES = ["await_paid", "finished", "cancelled"];

export function FactoringDetailsActions({
  factoring,
  factoringId,
  initiatingSigning,
  canAccept,
  isCancelling,
  onClose,
  onInitiateSigning,
  onCancelFactoring,
}) {
  const { t } = useTranslation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const canCancel = !NON_CANCELLABLE_STATUSES.includes(factoring?.status);

  function handleOpenConfirm(event) {
    event?.currentTarget?.blur?.();
    setIsConfirmOpen(true);
  }

  function handleCloseConfirm() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsConfirmOpen(false);
  }

  async function handleConfirmSigning() {
    await onInitiateSigning?.();
    setIsConfirmOpen(false);
  }

  function handleOpenCancelConfirm(event) {
    event?.currentTarget?.blur?.();
    setIsCancelConfirmOpen(true);
  }

  function handleCloseCancelConfirm() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsCancelConfirmOpen(false);
  }

  async function handleConfirmCancel() {
    await onCancelFactoring?.();
    setIsCancelConfirmOpen(false);
  }

  return (
    <>
      <DialogActions
        disableSpacing
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 3,
          pt: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          {factoring?.verified_customer && (
            <Chip
              label={t("factorings.confirmations.confirmedByCustomer")}
              color="success"
              size="small"
              sx={{
                borderRadius: 999,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{
            width: { xs: "100%", sm: "auto" },
            justifyContent: { sm: "flex-end" },
          }}
        >
          {factoringId && (
            <FactoringChatButton
              factoringId={factoringId}
              factoring={factoring}
              onClose={onClose}
            />
          )}

          {canCancel && (
            <Button
              color="warning"
              variant="outlined"
              startIcon={<BlockOutlinedIcon />}
              onClick={handleOpenCancelConfirm}
              disabled={initiatingSigning || isCancelling}
            >
              {isCancelling ? t("factorings.cancel.inProgress") : t("factorings.cancel.action")}
            </Button>
          )}

          {canAccept && (
            <Button
              variant="contained"
              onClick={handleOpenConfirm}
              disabled={initiatingSigning || isCancelling}
            >
              {initiatingSigning ? t("factorings.confirmParticipation.opening") : t("common.actions.confirm")}
            </Button>
          )}
        </Stack>
      </DialogActions>

      <AppDialog open={isConfirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>{t("factorings.confirmParticipation.title")}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("factorings.confirmParticipation.text")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} disabled={initiatingSigning}>
            {t("common.actions.cancel")}
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmSigning}
            disabled={initiatingSigning}
          >
            {initiatingSigning ? t("factorings.confirmParticipation.opening") : t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </AppDialog>

      <AppDialog open={isCancelConfirmOpen} onClose={handleCloseCancelConfirm}>
        <DialogTitle>{t("factorings.cancel.action")}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("factorings.cancel.confirm")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCancelConfirm} disabled={isCancelling}>
            {t("common.actions.cancel")}
          </Button>

          <Button
            color="warning"
            variant="contained"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
          >
            {isCancelling ? t("factorings.cancel.inProgress") : t("factorings.cancel.action")}
          </Button>
        </DialogActions>
      </AppDialog>
    </>
  );
}
