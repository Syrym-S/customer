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

import { useTendersContext } from '../../../entities/tender/model/useTendersContext';
import { useEffect, useState } from 'react';
import { TenderDetailsContent } from './components/TenderDetailsContent';
import { TenderDetailsHeader } from './components/TenderDetailsHeader';
import { TenderDetailsEditActions } from './components/TenderDetailsEditActions';

import {
    createTenderEditForm,
    mapTenderEditFormToApi,
} from '../../../features/edit-tender/model/tender-edit-form.helpers';
import { TenderDetailsActions } from './components/TenderDetailsActions';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeadRoute } from '../../../features/view-lead-routes/model/useLeadRoute';
import { RouteDetailsMap } from '../../route-details-map/ui/RouteDetailsMap';

export function TenderDetailsModal() {
    const navigate = useNavigate();
    const { tenderId } = useParams();

    const {
        openTender,
        closeTenderDetails,
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

    const [actionError, setActionError] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const isRoutePlaceholder = Boolean(openTender?.isRoutePlaceholder);
    const shouldShowDetailsLoader = isRoutePlaceholder && !detailsError;

    const shouldRenderTenderDetails = !isRoutePlaceholder;

    const isTenderDetailsRoute =
        Boolean(tenderId) ||
        /\/customer\/tenders\/[^/?#]+/.test(window.location.pathname);

    const leadForMap = openTender?.lead || null;

    const {
        route,
        routePoints,
        isLoading: isRouteLoading,
    } = useLeadRoute(leadForMap, {
        enabled: Boolean(leadForMap),
    });

    function handleClose() {
        closeTenderDetails();
        setIsEditing(false);
        setSaveEditError(null);
        setEditForm(createTenderEditForm(null));
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
        if (!openTender?.id || !forwarderId) {
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
            maxWidth='md'
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
                        variant='body2'
                        color='text.secondary'
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
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {saveEditError}
                    </Alert>
                )}

                {detailsError && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {detailsError}
                    </Alert>
                )}

                {actionError && (
                    <Alert severity='error' sx={{ mb: 2 }}>
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

                        <Typography color='text.secondary'>
                            Загружаем детали тендера...
                        </Typography>
                    </Box>
                ) : (
                    shouldRenderTenderDetails && (
                        <>
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
