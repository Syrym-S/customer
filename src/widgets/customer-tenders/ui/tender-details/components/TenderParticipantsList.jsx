import { Button, Stack, Typography } from '@mui/material';

import { getParticipantForwarderId } from './tender-participants.helpers';
import { TenderParticipantItem } from './TenderParticipantItem';

export function TenderParticipantsList({
    participants,
    visibleParticipants,
    isExpanded,
    hasHiddenItems,
    hiddenItemsCount,
    tenderStatus,
    isActionLoading,
    onToggleExpanded,
    onDeleteParticipant,
}) {
    if (participants.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ py: 2 }}>
                Участники пока не добавлены
            </Typography>
        );
    }

    return (
        <Stack
            spacing={1.25}
            sx={{
                maxHeight: isExpanded && participants.length > 6 ? 420 : 'none',
                overflowY:
                    isExpanded && participants.length > 6 ? 'auto' : 'visible',
                pr: isExpanded && participants.length > 6 ? 0.5 : 0,
            }}
        >
            {visibleParticipants.map(({ participant, index }) => (
                <TenderParticipantItem
                    key={getParticipantForwarderId(participant) || index}
                    participant={participant}
                    tenderStatus={tenderStatus}
                    isActionLoading={isActionLoading}
                    onDeleteParticipant={onDeleteParticipant}
                />
            ))}

            {hasHiddenItems && (
                <Button
                    size="small"
                    onClick={onToggleExpanded}
                    sx={{
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                    }}
                >
                    {isExpanded
                        ? 'Скрыть'
                        : `Показать всех (+${hiddenItemsCount})`}
                </Button>
            )}
        </Stack>
    );
}
