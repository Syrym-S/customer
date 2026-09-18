import { useRef } from 'react';

import {
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { validateAndReadProfilePhoto } from '../model/profile-photo.helpers';

export function ProfilePhotoUploader({
    value,
    error,
    disabled,
    isLoading,
    onChange,
    onError,
    onRemove,
}) {
    const inputRef = useRef(null);

    function handleOpenFileDialog() {
        inputRef.current?.click();
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file) {
            return;
        }

        try {
            const photoUrl = await validateAndReadProfilePhoto(file);

            onError('');
            onChange(photoUrl, file);
        } catch (fileError) {
            onError(fileError.message || 'Не удалось загрузить фото');
        }
    }

    function handleRemovePhoto() {
        onError('');
        onRemove();
    }

    return (
        <Box>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                spacing={2}
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                }}
            >
                <Box sx={{ flexShrink: 0 }}>
                    <Box
                        sx={{
                            position: 'relative',
                            width: 96,
                            height: 96,
                            borderRadius: '50%',
                            '&:hover .profile-photo-overlay, &:focus-within .profile-photo-overlay':
                                {
                                    opacity: 1,
                                    pointerEvents: 'auto',
                                },
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'background.default',
                                }}
                            >
                                <CircularProgress size={28} />
                            </Box>
                        ) : (
                            <Avatar
                                src={value || undefined}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    fontSize: 32,
                                    bgcolor: value ? undefined : 'primary.light',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                        )}

                        {!isLoading && (
                            <Stack
                                className='profile-photo-overlay'
                                direction='row'
                                spacing={1}
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(22,36,62,0.8)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    transition: 'opacity 0.15s ease',
                                    display: {
                                        xs: 'none',
                                        sm: 'flex',
                                    },
                                }}
                            >
                                <IconButton
                                    size='small'
                                    onClick={handleOpenFileDialog}
                                    disabled={disabled}
                                    aria-label='Загрузить фото'
                                    sx={{
                                        color: '#fff',
                                        bgcolor: 'rgba(255,255,255,0.35)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.45)',
                                        },
                                    }}
                                >
                                    <PhotoCameraOutlinedIcon fontSize='small' />
                                </IconButton>

                                {value && (
                                    <IconButton
                                        size='small'
                                        onClick={handleRemovePhoto}
                                        disabled={disabled}
                                        aria-label='Удалить фото'
                                        sx={{
                                            color: 'error.main',
                                            bgcolor: 'rgba(255,255,255,0.65)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.75)',
                                            },
                                        }}
                                    >
                                        <DeleteOutlineRoundedIcon fontSize='small' />
                                    </IconButton>
                                )}
                            </Stack>
                        )}
                    </Box>

                    <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                            display: 'block',
                            mt: 0.5,
                            fontSize: 10,
                            fontStyle: 'italic',
                            textAlign: {
                                xs: 'left',
                                sm: 'center',
                            },
                        }}
                    >
                        .png, .jpeg · 400–600px
                    </Typography>
                </Box>

                <Box>
                    {!isLoading && (
                        <Stack
                            direction='row'
                            spacing={1}
                            sx={{
                                display: {
                                    xs: 'flex',
                                    sm: 'none',
                                },
                                mb: 1,
                            }}
                        >
                            <IconButton
                                size='small'
                                onClick={handleOpenFileDialog}
                                disabled={disabled}
                                aria-label='Загрузить фото'
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <PhotoCameraOutlinedIcon fontSize='small' />
                            </IconButton>

                            {value && (
                                <IconButton
                                    size='small'
                                    color='error'
                                    onClick={handleRemovePhoto}
                                    disabled={disabled}
                                    aria-label='Удалить фото'
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <DeleteOutlineRoundedIcon fontSize='small' />
                                </IconButton>
                            )}
                        </Stack>
                    )}

                    {error && (
                        <Typography
                            color='error'
                            fontSize={13}
                            sx={{ mt: 0.75 }}
                        >
                            {error}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <input
                ref={inputRef}
                type='file'
                accept='image/png,image/jpeg'
                hidden
                onChange={handleFileChange}
            />
        </Box>
    );
}
