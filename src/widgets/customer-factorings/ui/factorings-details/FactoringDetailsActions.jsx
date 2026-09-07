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
import { FactoringChatButton } from "./FactoringChatButton";

export function FactoringDetailsActions({
  factoring,
  factoringId,
  initiatingSigning,
  canAccept,
  onClose,
  onInitiateSigning,
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

          {canAccept && (
            <Button
              variant="contained"
              onClick={handleOpenConfirm}
              disabled={initiatingSigning}
            >
              {initiatingSigning ? "Открываем подписание..." : "Подтвердить"}
            </Button>
          )}

          <Button onClick={onClose} disabled={initiatingSigning}>
            Закрыть
          </Button>
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
    </>
  );
}
