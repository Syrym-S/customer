import { useEffect, useState } from 'react';
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

import { FactoringDetailsHeader } from './factorings-details/FactoringDetailsHeader';
import { FactoringSummarySection } from './factorings-details/sections/FactoringSummarySection';
import { FactoringFinanceSection } from './factorings-details/sections/FactoringFinanceSection';
import { FactoringParticipantsSection } from './factorings-details/sections/FactoringParticipantsSection';
import { FactoringVerificationSection } from './factorings-details/sections/FactoringVerificationSection';
import { FactoringDetailsActions } from './factorings-details/FactoringDetailsActions';
import { FactoringPartiesRequisitesSection } from './factorings-details/sections/FactoringPartiesRequisitesSection';
import { LeadDetailsMap } from '../../customer-leads/ui/lead-details/LeadDetailsMap';
import {
    buildLeadRoutePayload,
    decodeRoutePolyline,
    getEncodedPolylineFromRoute,
    getRoutesFromGeneratedRoute,
} from '../../customer-leads/lib/route-polyline.helpers';
import { generateRoute } from '../../customer-leads/api/lead-route.repository';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { useNavigate, useParams } from 'react-router-dom';

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

    const map = useCustomerMap();

    const [route, setRoute] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    const canAccept = factoring && factoring.verified_customer !== true;
    const leadForMap = factoring?.lead;

    const isFactoringDetailsRoute =
        Boolean(factoringIndex) ||
        /\/customer\/factorings\/[^/?#]+/.test(window.location.pathname);

    const shouldShowDetailsLoader = loading && !factoring;
    const shouldRenderFactoringDetails =
        Boolean(factoring) && !shouldShowDetailsLoader;

    useEffect(() => {
        let isMounted = true;

        async function loadFactoringRoute() {
            const lead = factoring?.lead;

            console.log('[factoring route debug]', {
                open,
                factoring,
                lead,
                leadId: lead?.id,
            });

            if (!open || !factoring || !lead?.id) {
                console.log('[factoring route skipped]', {
                    reason: 'open/factoring/lead.id missing',
                    open,
                    hasFactoring: Boolean(factoring),
                    hasLead: Boolean(lead),
                    leadId: lead?.id,
                });

                setRoute(null);
                setRoutePoints([]);
                setIsRouteLoading(false);
                return;
            }

            try {
                setIsRouteLoading(true);

                const payload = buildLeadRoutePayload(lead);

                console.log('[factoring route payload]', payload);

                if (!payload) {
                    console.log('[factoring route skipped]', {
                        reason: 'payload is empty',
                        lead,
                    });

                    setRoute(null);
                    setRoutePoints([]);
                    return;
                }

                const generatedRoute = await generateRoute(payload);

                console.log('[factoring generated route]', generatedRoute);

                const routes = getRoutesFromGeneratedRoute(generatedRoute);
                const mainRoute = routes[0];
                const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
                const decodedPoints = decodeRoutePolyline(encodedPolyline);

                if (!isMounted) {
                    return;
                }

                setRoute(mainRoute || null);
                setRoutePoints(decodedPoints || []);
            } catch (error) {
                console.error('[factoring route error]', error);

                if (!isMounted) {
                    return;
                }

                setRoute(null);
                setRoutePoints([]);
            } finally {
                if (isMounted) {
                    setIsRouteLoading(false);
                }
            }
        }

        loadFactoringRoute();

        return () => {
            isMounted = false;
        };
    }, [open, factoring]);

    function handleClose() {
        setRoute(null);
        setRoutePoints([]);
        setIsRouteLoading(false);
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
                            <LeadDetailsMap
                                map={map}
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
