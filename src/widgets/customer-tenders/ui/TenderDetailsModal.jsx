import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';

import { useTendersContext } from '../model/useTendersContext';
import { useEffect, useMemo, useState } from 'react';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { LeadDetailsMap } from '../../customer-leads/ui/lead-details/LeadDetailsMap';
import { TenderDetailsContent } from './tender-details/TenderDetailsContent';
import { TenderDetailsHeader } from './tender-details/TenderDetailsHeader';
import { TenderDetailsEditActions } from './tender-details/TenderDetailsEditActions';
import {
    buildFallbackLeadRoutePoints,
    buildLeadRoutePayload,
    decodeRoutePolyline,
    getEncodedPolylineFromRoute,
    getRoutesFromGeneratedRoute,
} from '../../customer-leads/lib/route-polyline.helpers';
import { generateRoute } from '../../customer-leads/api/lead-route.repository';
import {
    createTenderEditForm,
    mapTenderEditFormToApi,
} from '../model/tender-edit-form.helpers';
import { TenderDetailsActions } from './tender-details/TenderDetailsActions';
import { useNavigate, useParams } from 'react-router-dom';

function getTenderRouteKey(lead) {
    if (!lead?.id) {
        return '';
    }

    return JSON.stringify({
        id: lead.id,
        from_location: lead.from_location || null,
        to_location: lead.to_location || null,
        waypoints: Array.isArray(lead.waypoints) ? lead.waypoints : [],
    });
}

export function TenderDetailsModal() {
    const navigate = useNavigate();
    const { tenderId } = useParams();

    const map = useCustomerMap();
    const {
        openTender,
        closeTenderDetails,
        isDetailsLoading,
        detailsError,
        acceptBet,
        cancelTender,
        deleteTender,
        removeParticipant,
        startTender,
        updateTender,
        addParticipantsToTender,
    } = useTendersContext();

    const [isEditing, setIsEditing] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [saveEditError, setSaveEditError] = useState(null);
    const [editForm, setEditForm] = useState(() => createTenderEditForm(null));

    const [route, setRoute] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [isRouteLoading, setIsRouteLoading] = useState(false);

    const [actionError, setActionError] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const isRoutePlaceholder = Boolean(openTender?.isRoutePlaceholder);
    const shouldShowDetailsLoader = isRoutePlaceholder && !detailsError;

    const shouldRenderTenderDetails = !isRoutePlaceholder;

    const isTenderDetailsRoute =
        Boolean(tenderId) ||
        /\/customer\/tenders\/[^/?#]+/.test(window.location.pathname);

    const leadForMap = openTender?.lead || null;

    const tenderRouteKey = useMemo(() => {
        return getTenderRouteKey(leadForMap);
    }, [leadForMap]);

    function handleClose() {
        closeTenderDetails();
        setIsEditing(false);
        setSaveEditError(null);
        setEditForm(createTenderEditForm(null));
        setRoute(null);
        setRoutePoints([]);
        setIsRouteLoading(false);
        setActionError('');

        if (isTenderDetailsRoute) {
            navigate('/customer/tenders', { replace: true });
        }
    }

    function handleStartEdit() {
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setEditForm(createTenderEditForm(openTender));
        setIsEditing(false);
        setSaveEditError(null);
    }

    function handleEditChange(eventOrName, maybeValue) {
        if (typeof eventOrName === 'string') {
            setEditForm((prevForm) => ({
                ...prevForm,
                [eventOrName]: maybeValue,
            }));

            return;
        }

        const { name, value } = eventOrName.target;

        setEditForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    }

    async function handleStartTender() {
        if (!openTender?.id) {
            return;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await startTender(openTender.id);
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось запустить тендер',
            );
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleAcceptWinner(betIndex) {
        if (!openTender?.id) {
            return;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await acceptBet(openTender.id, betIndex);

            return true;
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось выбрать победителя',
            );

            return false;
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleCancelTender() {
        if (!openTender?.id) {
            return;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await cancelTender(openTender.id);
        } catch (error) {
            setActionError(
                error.response?.data?.message || 'Не удалось отменить тендер',
            );
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleDeleteTender() {
        if (!openTender?.id) {
            return;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await deleteTender(openTender.id);
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось удалить тендер',
            );
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleDeleteParticipant(forwarderId) {
        if (!openTender?.id || forwarderId) {
            return;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await removeParticipant(openTender.id, forwarderId);
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось удалить участника',
            );
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleAddParticipants(forwarders) {
        if (
            !openTender?.id ||
            !Array.isArray(forwarders) ||
            forwarders.length === 0
        ) {
            return;
        }

        try {
            setIsActionLoading(true);
            setActionError('');

            await addParticipantsToTender(
                openTender.id,
                forwarders.map((forwarder) => forwarder.id),
            );
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось добавить участников',
            );
        } finally {
            setIsActionLoading(false);
        }
    }

    async function handleSaveEdit() {
        if (!openTender?.id || isSavingEdit) {
            return;
        }

        const payload = mapTenderEditFormToApi(editForm, openTender);

        if (Object.keys(payload).length === 0) {
            setIsEditing(false);
            setSaveEditError(null);
            return;
        }

        try {
            setIsSavingEdit(true);
            setSaveEditError(null);

            await updateTender(openTender.id, payload);

            setIsEditing(false);
        } catch (error) {
            setSaveEditError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось сохранить изменения тендера',
            );
        } finally {
            setIsSavingEdit(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        async function loadTenderRoute() {
            const lead = leadForMap;

            if (!tenderRouteKey || !lead?.id) {
                setRoute(null);
                setRoutePoints([]);
                setIsRouteLoading(false);
                return;
            }

            try {
                setIsRouteLoading(true);
                setRoute(null);
                setRoutePoints([]);

                const payload = buildLeadRoutePayload(lead);

                if (!payload) {
                    setRoute(null);
                    setRoutePoints([]);
                    return;
                }

                const generatedRoute = await generateRoute(payload);
                const routes = getRoutesFromGeneratedRoute(generatedRoute);
                const mainRoute = routes[0];

                if (!isMounted) {
                    return;
                }

                if (!mainRoute) {
                    console.warn(
                        'Маршруты тендера не найдены в response:',
                        generatedRoute,
                    );

                    setRoute(null);
                    setRoutePoints(buildFallbackLeadRoutePoints(lead));

                    return;
                }

                const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
                const decodedPoints = decodeRoutePolyline(encodedPolyline);

                if (!decodedPoints.length) {
                    console.warn('Polyline тендера не декодировался:', {
                        generatedRoute,
                        mainRoute,
                        encodedPolyline,
                    });

                    setRoute(null);
                    setRoutePoints(buildFallbackLeadRoutePoints(lead));

                    return;
                }

                setRoute(mainRoute);
                setRoutePoints(decodedPoints);
            } catch (error) {
                console.error('Не удалось построить маршрут тендера:', error);

                if (!isMounted) {
                    return;
                }

                setRoute(null);
                setRoutePoints(buildFallbackLeadRoutePoints(leadForMap));
            } finally {
                if (isMounted) {
                    setIsRouteLoading(false);
                }
            }
        }

        loadTenderRoute();

        return () => {
            isMounted = false;
        };
    }, [tenderRouteKey]);

    useEffect(() => {
        if (!openTender) {
            return;
        }

        setEditForm(createTenderEditForm(openTender));
        setIsEditing(false);
        setSaveEditError(null);
    }, [openTender]);

    if (!openTender) {
        return null;
    }

    return (
        <Dialog
            open={Boolean(openTender)}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            {isRoutePlaceholder ? (
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
                        Тендер #{openTender?.id}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Загружаем детали тендера...
                    </Typography>
                </DialogTitle>
            ) : (
                <TenderDetailsHeader tender={openTender} />
            )}

            <DialogContent
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 2,
                        md: 3,
                    },
                    overflowX: 'hidden',
                }}
            >
                {saveEditError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {saveEditError}
                    </Alert>
                )}

                {detailsError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {detailsError}
                    </Alert>
                )}

                {actionError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {actionError}
                    </Alert>
                )}

                {shouldShowDetailsLoader ? (
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

                        <Typography color="text.secondary">
                            Загружаем детали тендера...
                        </Typography>
                    </Box>
                ) : (
                    shouldRenderTenderDetails && (
                        <>
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

                            <TenderDetailsEditActions
                                isEditing={isEditing}
                                onStartEdit={handleStartEdit}
                                onCancelEdit={handleCancelEdit}
                            />

                            <TenderDetailsContent
                                tender={openTender}
                                isActionLoading={isActionLoading}
                                isEditing={isEditing}
                                editForm={editForm}
                                onEditChange={handleEditChange}
                                onAcceptWinner={handleAcceptWinner}
                                onDeleteParticipant={handleDeleteParticipant}
                                onAddParticipants={handleAddParticipants}
                            />
                        </>
                    )
                )}
            </DialogContent>

            {shouldRenderTenderDetails ? (
                <TenderDetailsActions
                    tender={openTender}
                    isEditing={isEditing}
                    isSaving={isSavingEdit}
                    isActionLoading={isActionLoading}
                    onSave={handleSaveEdit}
                    onClose={handleClose}
                    onStartTender={handleStartTender}
                    onCancelTender={handleCancelTender}
                    onDeleteTender={handleDeleteTender}
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
