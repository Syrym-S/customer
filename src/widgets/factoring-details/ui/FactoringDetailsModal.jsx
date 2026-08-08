import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { FactoringDetailsHeader } from './FactoringDetailsHeader';
import { FactoringSummarySection } from './sections/FactoringSummarySection';
import { FactoringFinanceSection } from './sections/FactoringFinanceSection';
import { FactoringParticipantsSection } from './sections/FactoringParticipantsSection';
import { FactoringVerificationSection } from './sections/FactoringVerificationSection';
import { FactoringDetailsActions } from './FactoringDetailsActions';
import { FactoringPartiesRequisitesSection } from './sections/FactoringPartiesRequisitesSection';

import { useNavigate, useParams } from 'react-router-dom';
import { useLeadRoute } from '../../../features/view-lead-routes/model/useLeadRoute';
import { RouteDetailsMap } from '../../route-details-map/ui/RouteDetailsMap';

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
    const navigate = useNavigate();
    const { factoringIndex } = useParams();

    const canAccept = factoring && factoring.verified_customer !== true;
    const leadForMap = factoring?.lead;

    const {
        route,
        routePoints,
        isLoading: isRouteLoading,
    } = useLeadRoute(leadForMap, {
        enabled: Boolean(leadForMap),
    });

    const isFactoringDetailsRoute =
        Boolean(factoringIndex) ||
        /\/customer\/factorings\/[^/?#]+/.test(window.location.pathname);

    const shouldShowDetailsLoader = loading && !factoring;
    const shouldRenderFactoringDetails =
        Boolean(factoring) && !shouldShowDetailsLoader;

    function handleClose() {
        onClose();

        if (isFactoringDetailsRoute) {
            navigate('/customer/factorings', { replace: true });
        }
    }

    return (
        <Dialog
            open={open}
            onClose={accepting ? undefined : handleClose}
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
            {factoring ? (
                <FactoringDetailsHeader factoring={factoring} />
            ) : (
                <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
                    <Typography
                        sx={{
                            fontSize: {
                                xs: '18px',
                                sm: '20px',
                            },
                            fontWeight: 600,
                            lineHeight: 1.3,
                        }}
                    >
                        Факторинг #{factoringIndex || ''}
                    </Typography>

                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mt: 0.5 }}
                    >
                        Загружаем детали факторинга...
                    </Typography>
                </DialogTitle>
            )}

            <DialogContent sx={{ px: 3 }}>
                {shouldShowDetailsLoader && (
                    <Box
                        sx={{
                            minHeight: 360,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={32} />

                        <Typography color='text.secondary'>
                            Загружаем детали факторинга...
                        </Typography>
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

                {shouldRenderFactoringDetails && (
                    <Stack spacing={2}>
                        {leadForMap && (
                            <RouteDetailsMap
                                lead={leadForMap}
                                route={route}
                                routePoints={routePoints}
                                geoPoints={[]}
                                geoCurrentPoint={null}
                                isRouteLoading={isRouteLoading}
                            />
                        )}

                        <FactoringSummarySection factoring={factoring} />

                        <FactoringFinanceSection factoring={factoring} />

                        <FactoringParticipantsSection factoring={factoring} />

                        <FactoringVerificationSection factoring={factoring} />

                        <FactoringPartiesRequisitesSection
                            factoring={factoring}
                        />
                    </Stack>
                )}
            </DialogContent>

            {shouldRenderFactoringDetails ? (
                <FactoringDetailsActions
                    factoring={factoring}
                    accepting={accepting}
                    canAccept={canAccept}
                    onClose={handleClose}
                    onAccept={onAccept}
                />
            ) : (
                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button onClick={handleClose}>Закрыть</Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
