import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Slider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';

import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import {
    AVATAR_ALLOWED_IMAGE_TYPES,
    createCroppedAvatarFile,
    getAvatarCropAreaError,
    getAvatarMaxZoom,
    prepareAvatarSource,
    revokeAvatarSourceUrl,
} from '../model/avatar-crop.helpers';
import { AppDialog } from '../../../shared/ui/AppDialog';

const MIN_ZOOM = 1;
const ZOOM_STEP = 0.1;
const ROTATION_STEP = 90;

const INITIAL_CROP = {
    x: 0,
    y: 0,
};

export function AvatarCropModal({ open, onClose, onApply }) {
    const { t } = useTranslation();
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const inputRef = useRef(null);
    const sourceUrlRef = useRef('');

    // Каждая загрузка файла получает свой номер: пока готовится один файл,
    // пользователь может выбрать другой или закрыть окно — устаревший
    // результат нужно выбросить вместе с его blob-ссылкой.
    const prepareRequestRef = useRef(0);

    const [source, setSource] = useState(null);
    const [crop, setCrop] = useState(INITIAL_CROP);
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [error, setError] = useState('');
    const [isPreparing, setIsPreparing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const resetCropState = useCallback(() => {
        prepareRequestRef.current += 1;

        revokeAvatarSourceUrl(sourceUrlRef.current);
        sourceUrlRef.current = '';

        setSource(null);
        setCrop(INITIAL_CROP);
        setZoom(MIN_ZOOM);
        setRotation(0);
        setCroppedAreaPixels(null);
        setError('');
        setIsPreparing(false);
        setIsProcessing(false);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, []);

    useEffect(() => {
        if (open) {
            return;
        }

        resetCropState();
    }, [open, resetCropState]);

    useEffect(
        () => () => {
            revokeAvatarSourceUrl(sourceUrlRef.current);
        },
        [],
    );

    const maxZoom = useMemo(
        () => (source ? getAvatarMaxZoom(source) : MIN_ZOOM),
        [source],
    );

    const isZoomAvailable = maxZoom > MIN_ZOOM;

    const cropAreaError = getAvatarCropAreaError(croppedAreaPixels);

    const isBusy = isPreparing || isProcessing;

    const canApply =
        Boolean(source) &&
        Boolean(croppedAreaPixels) &&
        !cropAreaError &&
        !isBusy;

    function handleOpenFileDialog() {
        inputRef.current?.click();
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file) {
            return;
        }

        resetCropState();

        const requestId = prepareRequestRef.current;

        setIsPreparing(true);

        try {
            const preparedSource = await prepareAvatarSource(file);

            if (prepareRequestRef.current !== requestId) {
                revokeAvatarSourceUrl(preparedSource.url);

                return;
            }

            sourceUrlRef.current = preparedSource.url;

            setSource(preparedSource);
        } catch (prepareError) {
            if (prepareRequestRef.current !== requestId) {
                return;
            }

            setError(prepareError.message || t('profile.avatar.uploadFailed'));
        } finally {
            if (prepareRequestRef.current === requestId) {
                setIsPreparing(false);
            }
        }
    }

    const handleCropComplete = useCallback((_croppedArea, nextCroppedAreaPixels) => {
        setCroppedAreaPixels(nextCroppedAreaPixels);
    }, []);

    function handleRotate() {
        setRotation((previousRotation) => (previousRotation + ROTATION_STEP) % 360);
    }

    function handleZoomChange(_event, nextZoom) {
        setZoom(Array.isArray(nextZoom) ? nextZoom[0] : nextZoom);
    }

    function handleClose() {
        if (isBusy) {
            return;
        }

        onClose();
    }

    async function handleApply() {
        if (!canApply) {
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const { dataUrl, file } = await createCroppedAvatarFile({
                sourceUrl: source.url,
                croppedAreaPixels,
                rotation,
                mimeType: source.mimeType,
                fileName: source.fileName,
            });

            onApply(dataUrl, file);
            onClose();
        } catch (cropError) {
            setError(cropError.message || t('profile.avatar.cropFailed'));
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <AppDialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ pt: 3, pr: 7, fontSize: { xs: 18, sm: 20 } }}>
                {t('profile.avatar.cropTitle')}
            </DialogTitle>

            <DialogCloseButton onClick={handleClose} disabled={isBusy} />

            <DialogContent>
                <Stack spacing={2}>
                    <Typography variant='body2' color='text.secondary'>
                        {source
                            ? t('profile.avatar.cropHint')
                            : t('profile.avatar.requirements')}
                    </Typography>

                    {(error || cropAreaError) && (
                        <Alert severity='error'>{error || cropAreaError}</Alert>
                    )}

                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            height: { xs: 280, sm: 340 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: source ? 'common.black' : 'background.default',
                            border: '1px dashed',
                            borderColor: 'divider',
                        }}
                    >
                        {isPreparing && (
                            <Stack
                                alignItems='center'
                                justifyContent='center'
                                sx={{ position: 'absolute', inset: 0, zIndex: 1 }}
                            >
                                <CircularProgress size={32} />
                            </Stack>
                        )}

                        {source && !isPreparing && (
                            <Cropper
                                image={source.url}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                minZoom={MIN_ZOOM}
                                maxZoom={maxZoom}
                                cropShape='round'
                                showGrid={false}
                                restrictPosition
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                            />
                        )}

                        {!source && !isPreparing && (
                            <Stack
                                spacing={1.5}
                                alignItems='center'
                                justifyContent='center'
                                sx={{ height: '100%', p: 2 }}
                            >
                                <AddPhotoAlternateOutlinedIcon
                                    sx={{ fontSize: 48, color: 'text.disabled' }}
                                />

                                <Button
                                    variant='outlined'
                                    onClick={handleOpenFileDialog}
                                >
                                    {t('profile.avatar.selectPhoto')}
                                </Button>
                            </Stack>
                        )}
                    </Box>

                    {source && (
                        <Stack spacing={1}>
                            <Stack
                                direction='row'
                                spacing={1.5}
                                alignItems='center'
                            >
                                {/* Исходник ровно 400×400: зумить некуда,
                                    иначе кроп ушёл бы ниже минимума. */}
                                {isZoomAvailable && (
                                    <>
                                        <ZoomOutRoundedIcon
                                            fontSize='small'
                                            sx={{ color: 'text.secondary' }}
                                        />

                                        <Slider
                                            value={zoom}
                                            min={MIN_ZOOM}
                                            max={maxZoom}
                                            step={ZOOM_STEP}
                                            onChange={handleZoomChange}
                                            disabled={isProcessing}
                                            aria-label={t('profile.avatar.zoom')}
                                        />

                                        <ZoomInRoundedIcon
                                            fontSize='small'
                                            sx={{ color: 'text.secondary' }}
                                        />
                                    </>
                                )}

                                <IconButton
                                    size='small'
                                    onClick={handleRotate}
                                    disabled={isProcessing}
                                    aria-label={t('profile.avatar.rotate')}
                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                >
                                    <RotateRightRoundedIcon fontSize='small' />
                                </IconButton>
                            </Stack>

                            <Box>
                                <Button
                                    size='small'
                                    onClick={handleOpenFileDialog}
                                    disabled={isProcessing}
                                >
                                    {t('profile.avatar.changePhoto')}
                                </Button>
                            </Box>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={isBusy}>
                    {t('common.actions.cancel')}
                </Button>

                <Button
                    variant='contained'
                    onClick={handleApply}
                    disabled={!canApply}
                >
                    {isProcessing
                        ? t('common.actions.saving')
                        : t('common.actions.save')}
                </Button>
            </DialogActions>

            <input
                ref={inputRef}
                type='file'
                accept={AVATAR_ALLOWED_IMAGE_TYPES.join(',')}
                hidden
                onChange={handleFileChange}
            />
        </AppDialog>
    );
}

AvatarCropModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
};
