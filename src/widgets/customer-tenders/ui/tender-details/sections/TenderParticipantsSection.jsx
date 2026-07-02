import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PropTypes from 'prop-types';
import { participantPropType } from '../../../model/tenders.prop-types';

import { TenderDetailsSection } from './TenderDetailsSection';
import { searchForwardersApi } from '../../../../../features/create-lead/api/forwarders.api';

const INITIAL_VISIBLE_COUNT = 3;

const participantTypeLabels = {
    forwarder: 'Экспедитор',
};

function formatDateTime(value) {
    if (!value) return 'Не указано';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getParticipantForwarderId(participant) {
    return (
        participant?.participant_id ||
        participant?.forwarder_id ||
        participant?.forwarderId ||
        participant?.id ||
        ''
    );
}

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
    const [forwarders, setForwarders] = useState([]);
    const [selectedForwarders, setSelectedForwarders] = useState([]);
    const [isForwardersLoading, setIsForwardersLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const isTenderClosed =
        tenderStatus === 'closed' || tenderStatus === 'cancelled';

    const hasHiddenItems = participants.length > INITIAL_VISIBLE_COUNT;

    const participantsWithIndexes = participants.map((participant, index) => ({
        participant,
        index,
    }));

    const visibleParticipants = isExpanded
        ? participantsWithIndexes
        : participantsWithIndexes.slice(0, INITIAL_VISIBLE_COUNT);

    const hiddenItemsCount = participants.length - INITIAL_VISIBLE_COUNT;

    const existingParticipantIds = useMemo(() => {
        return new Set(
            participants
                .map((participant) => getParticipantForwarderId(participant))
                .filter(Boolean),
        );
    }, [participants]);

    const forwarderOptions = useMemo(() => {
        const selectedIds = new Set(
            selectedForwarders.map((forwarder) => forwarder.id),
        );

        return forwarders.filter((forwarder) => {
            if (!forwarder?.id) {
                return false;
            }

            if (existingParticipantIds.has(forwarder.id)) {
                return false;
            }

            if (selectedIds.has(forwarder.id)) {
                return false;
            }

            return true;
        });
    }, [forwarders, selectedForwarders, existingParticipantIds]);

    const normalizedMaxParticipants = Number(maxParticipants) || 0;

    const canAddParticipants =
        !isTenderClosed &&
        (normalizedMaxParticipants === 0 ||
            participants.length < normalizedMaxParticipants);

    function handleToggleExpanded() {
        setIsExpanded((prev) => !prev);
    }

    function handleCancelAdding() {
        setIsAdding(false);
        setInputValue('');
        setForwarders([]);
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
        const query = inputValue.trim();

        if (!isAdding || query.length < 2) {
            setForwarders([]);
            setSearchError('');
            return;
        }

        let isCancelled = false;

        async function loadForwarders() {
            try {
                setIsForwardersLoading(true);
                setSearchError('');

                const response = await searchForwardersApi(query);

                if (isCancelled) {
                    return;
                }

                const results = Array.isArray(response?.results)
                    ? response.results
                    : Array.isArray(response)
                      ? response
                      : [];

                setForwarders(results);
            } catch (error) {
                if (!isCancelled) {
                    setForwarders([]);
                    setSearchError(
                        error.response?.data?.message ||
                            error.message ||
                            'Не удалось найти экспедиторов',
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsForwardersLoading(false);
                }
            }
        }

        loadForwarders();

        return () => {
            isCancelled = true;
        };
    }, [isAdding, inputValue]);

    return (
        <TenderDetailsSection
            icon={<GroupsOutlinedIcon />}
            title='Участники'
            subtitle={`${participants.length} участник(ов)`}
            action={
                canAddParticipants && !isAdding ? (
                    <Button
                        size='small'
                        variant='outlined'
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => setIsAdding(true)}
                        disabled={isActionLoading}
                        aria-label='Добавить участника'
                        title='Добавить участника'
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
                            component='span'
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
                    <Stack spacing={1}>
                        {searchError && (
                            <Alert severity='error'>{searchError}</Alert>
                        )}

                        <Autocomplete
                            multiple
                            value={selectedForwarders}
                            inputValue={inputValue}
                            options={forwarderOptions}
                            loading={isForwardersLoading}
                            filterOptions={(items) => items}
                            getOptionLabel={(option) =>
                                option?.fullName ||
                                option?.companyName ||
                                option?.id ||
                                ''
                            }
                            isOptionEqualToValue={(option, value) =>
                                option?.id === value?.id
                            }
                            filterSelectedOptions
                            noOptionsText={
                                inputValue.trim().length < 2
                                    ? 'Введите минимум 2 символа'
                                    : 'Экспедитор не найден'
                            }
                            loadingText='Поиск экспедиторов...'
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'reset') {
                                    return;
                                }

                                setInputValue(newInputValue);
                            }}
                            onChange={(_, nextValue) => {
                                setSelectedForwarders(nextValue);
                                setInputValue('');
                            }}
                            renderValue={(tagValue, getItemProps) =>
                                tagValue.map((option, index) => {
                                    const { key, ...itemProps } = getItemProps({
                                        index,
                                    });

                                    return (
                                        <Chip
                                            key={key}
                                            label={
                                                option.fullName ||
                                                option.companyName ||
                                                option.id
                                            }
                                            {...itemProps}
                                            size='small'
                                        />
                                    );
                                })
                            }
                            renderOption={(optionProps, option) => {
                                const { key, ...listItemProps } = optionProps;

                                return (
                                    <Box
                                        key={key}
                                        component='li'
                                        {...listItemProps}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            py: 1.2,
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography fontWeight={700}>
                                                {option.fullName ||
                                                    'ФИО не указано'}
                                            </Typography>

                                            <Typography
                                                color='text.secondary'
                                                sx={{ fontSize: 12 }}
                                            >
                                                {option.phone ||
                                                    option.iin ||
                                                    'Контакты не указаны'}
                                            </Typography>
                                        </Box>

                                        {option.companyName && (
                                            <Chip
                                                size='small'
                                                label={option.companyName}
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        )}
                                    </Box>
                                );
                            }}
                            renderInput={(params) => {
                                const inputProps = params.InputProps ?? {};

                                return (
                                    <TextField
                                        {...params}
                                        label='Экспедиторы'
                                        placeholder='Введите ФИО, ИИН, компанию, БИН или телефон'
                                        size='small'
                                        fullWidth
                                        InputProps={{
                                            ...inputProps,
                                            endAdornment: (
                                                <>
                                                    {isForwardersLoading && (
                                                        <CircularProgress
                                                            color='inherit'
                                                            size={18}
                                                        />
                                                    )}

                                                    {inputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                );
                            }}
                        />

                        <Stack
                            direction='row'
                            spacing={1}
                            justifyContent='flex-end'
                        >
                            <Button
                                variant='contained'
                                onClick={handleSubmitParticipants}
                                disabled={
                                    isActionLoading ||
                                    selectedForwarders.length === 0
                                }
                            >
                                Добавить
                            </Button>

                            <Button
                                onClick={handleCancelAdding}
                                disabled={isActionLoading}
                            >
                                Отмена
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {participants.length === 0 ? (
                    <Typography color='text.secondary' sx={{ py: 2 }}>
                        Участники пока не добавлены
                    </Typography>
                ) : (
                    <Stack
                        spacing={1.25}
                        sx={{
                            maxHeight:
                                isExpanded && participants.length > 6
                                    ? 420
                                    : 'none',
                            overflowY:
                                isExpanded && participants.length > 6
                                    ? 'auto'
                                    : 'visible',
                            pr: isExpanded && participants.length > 6 ? 0.5 : 0,
                        }}
                    >
                        {visibleParticipants.map(({ participant }) => {
                            const participantId =
                                getParticipantForwarderId(participant);

                            const canDeleteParticipant =
                                tenderStatus !== 'closed' &&
                                tenderStatus !== 'cancelled';

                            return (
                                <Box
                                    key={participantId}
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
                                                {participant.name ||
                                                    participant.fullName ||
                                                    participant.companyName ||
                                                    participantId ||
                                                    'Участник'}
                                            </Typography>

                                            <Typography
                                                color='text.secondary'
                                                sx={{
                                                    fontSize: 12,
                                                    mt: 0.5,
                                                }}
                                            >
                                                Добавлен:{' '}
                                                {formatDateTime(
                                                    participant.date,
                                                )}
                                            </Typography>

                                            <Chip
                                                label={
                                                    participantTypeLabels[
                                                        participant.type
                                                    ] ||
                                                    participant.type ||
                                                    'Не указано'
                                                }
                                                size='small'
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
                                            <Button
                                                size='small'
                                                color='error'
                                                variant='text'
                                                disabled={
                                                    isActionLoading ||
                                                    !participantId
                                                }
                                                onClick={() =>
                                                    onDeleteParticipant?.(
                                                        participantId,
                                                    )
                                                }
                                                sx={{
                                                    minWidth: 'auto',
                                                    px: 1,
                                                    textTransform: 'none',
                                                    flexShrink: 0,

                                                    '@media (min-width: 450px)':
                                                        {
                                                            ml: 'auto',
                                                            alignSelf:
                                                                'flex-start',
                                                        },

                                                    '@media (max-width: 449px)':
                                                        {
                                                            mt: 0.5,
                                                            alignSelf:
                                                                'flex-start',
                                                            px: 0,
                                                        },
                                                }}
                                            >
                                                Удалить
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>
                            );
                        })}

                        {hasHiddenItems && (
                            <Button
                                size='small'
                                onClick={handleToggleExpanded}
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
                )}
            </Stack>
        </TenderDetailsSection>
    );
}

TenderParticipantsSection.propTypes = {
    participants: PropTypes.arrayOf(participantPropType).isRequired,
    maxParticipants: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenderStatus: PropTypes.string,
    isActionLoading: PropTypes.bool,
    onDeleteParticipant: PropTypes.func,
    onAddParticipants: PropTypes.func,
};
