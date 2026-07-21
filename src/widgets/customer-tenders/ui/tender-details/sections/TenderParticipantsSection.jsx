import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Box, Button, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { INITIAL_VISIBLE_COUNT } from '../components/tender-participants.helpers';
import { TenderDetailsSection } from './TenderDetailsSection';
import { TenderParticipantsAddForm } from '../components/TenderParticipantsAddForm';
import { TenderParticipantsList } from '../components/TenderParticipantsList';
import { useTenderParticipantForwarders } from '../components/useTenderParticipantForwarders';

export function TenderParticipantsSection({
    participants = [],
    maxParticipants,
    tenderStatus,
    isActionLoading = false,
    onDeleteParticipant,
    onAddParticipants,
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedForwarders, setSelectedForwarders] = useState([]);

    const isTenderClosed =
        tenderStatus === 'closed' || tenderStatus === 'cancelled';

    const participantsWithIndexes = useMemo(() => {
        return participants.map((participant, index) => ({
            participant,
            index,
        }));
    }, [participants]);

    const visibleParticipants = isExpanded
        ? participantsWithIndexes
        : participantsWithIndexes.slice(0, INITIAL_VISIBLE_COUNT);

    const hasHiddenItems = participants.length > INITIAL_VISIBLE_COUNT;
    const hiddenItemsCount = participants.length - INITIAL_VISIBLE_COUNT;

    const {
        forwarderOptions,
        isForwardersLoaded,
        isForwardersLoading,
        searchError,
        setSearchError,
        loadForwarders,
    } = useTenderParticipantForwarders({
        participants,
        selectedForwarders,
        inputValue,
    });

    const normalizedMaxParticipants = Number(maxParticipants) || 0;

    const canAddParticipants =
        !isTenderClosed &&
        (normalizedMaxParticipants === 0 ||
            participants.length < normalizedMaxParticipants);

    function handleStartAdding() {
        setIsAdding(true);
        loadForwarders();
    }

    function handleToggleExpanded() {
        setIsExpanded((prev) => !prev);
    }

    function handleCancelAdding() {
        setIsAdding(false);
        setInputValue('');
        setSelectedForwarders([]);
        setSearchError('');
    }

    async function handleSubmitParticipants() {
        if (
            selectedForwarders.length === 0 ||
            isActionLoading ||
            !onAddParticipants
        ) {
            return;
        }

        await onAddParticipants(selectedForwarders);
        handleCancelAdding();
    }

    useEffect(() => {
        if (!isAdding) {
            return;
        }

        loadForwarders();
    }, [isAdding, loadForwarders]);

    return (
        <TenderDetailsSection
            icon={<GroupsOutlinedIcon />}
            title="Участники"
            subtitle={`${participants.length} участник(ов)`}
            action={
                canAddParticipants && !isAdding ? (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddOutlinedIcon />}
                        onClick={handleStartAdding}
                        disabled={isActionLoading}
                        aria-label="Добавить участника"
                        title="Добавить участника"
                        sx={{
                            textTransform: 'none',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',

                            '@media (max-width: 450px)': {
                                width: 32,
                                minWidth: 32,
                                height: 32,
                                px: 0,

                                '& .MuiButton-startIcon': {
                                    m: 0,
                                },
                            },
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                '@media (max-width: 450px)': {
                                    display: 'none',
                                },
                            }}
                        >
                            Добавить участника
                        </Box>
                    </Button>
                ) : null
            }
        >
            <Stack spacing={1.5}>
                {isAdding && (
                    <TenderParticipantsAddForm
                        inputValue={inputValue}
                        selectedForwarders={selectedForwarders}
                        forwarderOptions={forwarderOptions}
                        isForwardersLoaded={isForwardersLoaded}
                        isForwardersLoading={isForwardersLoading}
                        searchError={searchError}
                        isActionLoading={isActionLoading}
                        onInputChange={setInputValue}
                        onSelectedForwardersChange={setSelectedForwarders}
                        onSubmit={handleSubmitParticipants}
                        onCancel={handleCancelAdding}
                    />
                )}

                <TenderParticipantsList
                    participants={participants}
                    visibleParticipants={visibleParticipants}
                    isExpanded={isExpanded}
                    hasHiddenItems={hasHiddenItems}
                    hiddenItemsCount={hiddenItemsCount}
                    tenderStatus={tenderStatus}
                    isActionLoading={isActionLoading}
                    onToggleExpanded={handleToggleExpanded}
                    onDeleteParticipant={onDeleteParticipant}
                />
            </Stack>
        </TenderDetailsSection>
    );
}
