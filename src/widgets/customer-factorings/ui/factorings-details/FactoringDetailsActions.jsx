import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import { FactoringChatButton } from "./FactoringChatButton";

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
        sx={{
          px: 3,
          pb: 3,
          pt: 2,
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          {factoring?.verified_customer && (
            <Chip
              label="Подтверждено заказчиком"
              color="success"
              size="small"
              sx={{
                borderRadius: 999,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Stack direction="row" spacing={1}>
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
              {isCancelling ? "Отмена..." : "Отменить факторинг"}
            </Button>
          )}

          {canAccept && (
            <Button
              variant="contained"
              onClick={handleOpenConfirm}
              disabled={initiatingSigning || isCancelling}
            >
              {initiatingSigning ? "Открываем подписание..." : "Подтвердить"}
            </Button>
          )}
        </Stack>
      </DialogActions>

      <Dialog open={isConfirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Подтверждение участия</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Хотите подтвердить своё участие в этом факторинге? Вы будете
            перенаправлены в окно подписания документов.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} disabled={initiatingSigning}>
            Отмена
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmSigning}
            disabled={initiatingSigning}
          >
            {initiatingSigning ? "Открываем подписание..." : "Подтвердить"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCancelConfirmOpen} onClose={handleCloseCancelConfirm}>
        <DialogTitle>Отменить факторинг</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отменить этот факторинг? Это действие
            нельзя будет отменить обратно.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCancelConfirm} disabled={isCancelling}>
            Отмена
          </Button>

          <Button
            color="warning"
            variant="contained"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Отмена..." : "Отменить факторинг"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
