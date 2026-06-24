import { Box, Button, Chip, DialogActions, Stack } from '@mui/material';

export function FactoringDetailsActions({
    factoring,
    accepting,
    canAccept,
    onClose,
    onAccept,
}) {
    return (
        <DialogActions
            sx={{
                px: 3,
                pb: 3,
                pt: 2,
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
            }}
        >
            <Box>
                {factoring?.verified_customer && (
                    <Chip
                        label='Подтверждено заказчиком'
                        color='success'
                        size='small'
                        sx={{
                            borderRadius: 999,
                            fontWeight: 600,
                        }}
                    />
                )}
            </Box>

            <Stack direction='row' spacing={1}>
                {canAccept && (
                    <Button
                        variant='contained'
                        onClick={onAccept}
                        disabled={accepting}
                    >
                        {accepting ? 'Подтверждение...' : 'Подтвердить'}
                    </Button>
                )}

                <Button onClick={onClose} disabled={accepting}>
                    Закрыть
                </Button>
            </Stack>
        </DialogActions>
    );
}
