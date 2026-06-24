import {
    Alert,
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    Stack,
} from '@mui/material';

import { FactoringDetailsHeader } from './factorings-details/FactoringDetailsHeader';
import { FactoringSummarySection } from './factorings-details/sections/FactoringSummarySection';
import { FactoringFinanceSection } from './factorings-details/sections/FactoringFinanceSection';
import { FactoringParticipantsSection } from './factorings-details/sections/FactoringParticipantsSection';
import { FactoringVerificationSection } from './factorings-details/sections/FactoringVerificationSection';
import { FactoringDetailsActions } from './factorings-details/FactoringDetailsActions';

export function FactoringDetailsModal({
    open,
    factoring,
    loading,
    error,
    accepting,
    acceptError,
    onClose,
    onAccept,
}) {
    const canAccept = factoring && factoring.verified_customer !== true;

    return (
        <Dialog
            open={open}
            onClose={accepting ? undefined : onClose}
            maxWidth='md'
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            <FactoringDetailsHeader factoring={factoring} />

            <DialogContent sx={{ px: 3 }}>
                {loading && (
                    <Box
                        sx={{
                            minHeight: 240,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {acceptError && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {acceptError}
                    </Alert>
                )}

                {!loading && factoring && (
                    <Stack spacing={2}>
                        <FactoringSummarySection factoring={factoring} />

                        <FactoringFinanceSection factoring={factoring} />

                        <FactoringParticipantsSection factoring={factoring} />

                        <FactoringVerificationSection factoring={factoring} />
                    </Stack>
                )}
            </DialogContent>

            <FactoringDetailsActions
                factoring={factoring}
                accepting={accepting}
                canAccept={canAccept}
                onClose={onClose}
                onAccept={onAccept}
            />
        </Dialog>
    );
}
