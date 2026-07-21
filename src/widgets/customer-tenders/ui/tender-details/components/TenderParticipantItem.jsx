import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';

import {
    formatDateTime,
    getParticipantForwarderId,
    participantTypeLabels,
} from './tender-participants.helpers';

export function TenderParticipantItem({
    participant,
    tenderStatus,
    isActionLoading,
    onDeleteParticipant,
}) {
    const participantId = getParticipantForwarderId(participant);

    const canDeleteParticipant =
        tenderStatus !== 'closed' && tenderStatus !== 'cancelled';

    return (
        <Box
            sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50',
            }}
        >
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                alignItems={{
                    xs: 'stretch',
                    sm: 'flex-start',
                }}
                spacing={1}
                sx={{
                    width: '100%',
                    minWidth: 0,

                    '@media (min-width: 450px)': {
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                    },

                    '@media (max-width: 449px)': {
                        flexDirection: 'column',
                        alignItems: 'stretch',
                    },
                }}
            >
                <Box
                    sx={{
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <Typography
                        fontWeight={600}
                        sx={{
                            fontSize: 14,
                            wordBreak: 'break-word',
                        }}
                    >
                        {participant.company_name || 'Компания не указана'}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 12,
                            mt: 0.5,
                        }}
                    >
                        {participant.company_bin
                            ? `БИН: ${participant.company_bin}`
                            : 'БИН не указан'}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 12,
                            mt: 0.25,
                        }}
                    >
                        Добавлен: {formatDateTime(participant.date)}
                    </Typography>

                    <Chip
                        label={
                            participantTypeLabels[participant.type] ||
                            participant.type ||
                            'Не указано'
                        }
                        size="small"
                        sx={{
                            mt: 1,
                            borderRadius: 999,
                            fontWeight: 500,
                            backgroundColor: 'grey.100',
                            color: 'text.secondary',
                        }}
                    />
                </Box>

                {canDeleteParticipant && (
                    <IconButton
                        size="small"
                        color="error"
                        disabled={isActionLoading || !participantId}
                        onClick={() => onDeleteParticipant?.(participantId)}
                        aria-label="Удалить участника"
                        title="Удалить участника"
                        sx={{
                            flexShrink: 0,

                            '@media (min-width: 450px)': {
                                ml: 'auto',
                                alignSelf: 'flex-start',
                            },

                            '@media (max-width: 449px)': {
                                mt: 0.5,
                                alignSelf: 'flex-start',
                            },
                        }}
                    >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                )}
            </Stack>
        </Box>
    );
}
