import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { normalizeLocationValue } from '../../customer-tenders/model/tender-edit-form.helpers';
import {
    getTenderCargoTypeLabel,
    getTenderTotalCargoWeight,
    getTimeLeft,
    tenderStatusLabels,
    tenderStatusStyles,
} from '../../customer-tenders/model/tender.helpers';
import { useTendersContext } from '../../customer-tenders/model/useTendersContext';

function getLocationLabel(tender, field) {
    return (
        normalizeLocationValue(tender?.lead?.[field]) ||
        normalizeLocationValue(tender?.[field]) ||
        'Не указано'
    );
}

function getMoneyLabel(tender) {
    const amount = tender?.summ || tender?.price || tender?.lead?.summ;
    const currency = tender?.currency || tender?.lead?.currency || '';

    if (amount === null || amount === undefined || amount === '') {
        return 'Цена не указана';
    }

    return `${Number(amount).toLocaleString('ru-RU')} ${currency}`.trim();
}

function getBetsCount(tender) {
    return Array.isArray(tender?.bets) ? tender.bets.length : 0;
}

function getPublicationTypeLabel(publicationType) {
    if (publicationType === 'public') {
        return 'Публичный';
    }

    if (publicationType === 'private') {
        return 'Приватный';
    }

    return 'Тип не указан';
}

function getShortTenderId(id) {
    if (!id) {
        return '—';
    }

    const value = String(id);

    if (value.length <= 12) {
        return value;
    }

    return `${value.slice(0, 4)}...${value.slice(-5)}`;
}

function TenderStatusChip({ status }) {
    const label = tenderStatusLabels[status] || status || 'Не указан';
    const styles = tenderStatusStyles[status] || tenderStatusStyles.new;

    return (
        <Chip
            label={label}
            variant="outlined"
            size="small"
            sx={{
                borderRadius: 999,
                fontWeight: 600,
                fontSize: '0.75rem',
                ...styles,
            }}
        />
    );
}

function TimeLeftBadge({ value }) {
    return (
        <Box
            sx={{
                px: 1,
                py: 0.4,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 999,
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    color: 'text.secondary',
                    lineHeight: 1.2,
                }}
            >
                Осталось
            </Typography>

            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.2,
                }}
            >
                {value || 'Не указано'}
            </Typography>
        </Box>
    );
}

function InfoText({ label, value }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: 13,
                    lineHeight: 1.35,
                    fontWeight: 500,
                    overflowWrap: 'anywhere',
                }}
            >
                {value || 'Не указано'}
            </Typography>
        </Box>
    );
}

export function DashboardTenderItem({ tender }) {
    const { openTenderDetails } = useTendersContext();

    const isCancelled = tender?.status === 'cancelled';
    const shouldShowTimeLeft =
        tender?.status !== 'closed' && tender?.status !== 'cancelled';

    const totalCargoWeight = getTenderTotalCargoWeight(tender);
    const cargoTypeLabel = getTenderCargoTypeLabel(tender);
    const betsCount = getBetsCount(tender);

    function handleOpenTender() {
        openTenderDetails(tender);
    }

    return (
        <Paper
            variant="outlined"
            onClick={handleOpenTender}
            role="button"
            tabIndex={0}
            sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                transition: '0.2s ease',
                borderColor: isCancelled ? 'grey.300' : 'divider',
                backgroundColor: isCancelled ? 'grey.100' : 'background.paper',
                opacity: isCancelled ? 0.82 : 1,
                '&:hover': {
                    borderColor: isCancelled ? 'grey.400' : 'primary.light',
                    boxShadow: isCancelled
                        ? '0 4px 12px rgba(0, 0, 0, 0.06)'
                        : '0 6px 18px rgba(33, 150, 243, 0.12)',
                },
            }}
        >
            <Stack spacing={1.25}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 1,
                        flexWrap: 'wrap',
                        minWidth: 0,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: 0,
                            flex: '1 1 220px',
                        }}
                    >
                        <Chip
                            label={`Тендер #${getShortTenderId(tender?.id)}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            title={
                                tender?.id
                                    ? `Тендер #${tender.id}`
                                    : 'Тендер #—'
                            }
                            sx={{
                                fontWeight: 600,
                                borderRadius: 999,
                                maxWidth: '100%',
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                            }}
                        />

                        <TenderStatusChip status={tender?.status} />

                        <Chip
                            label={getPublicationTypeLabel(
                                tender?.publication_type,
                            )}
                            size="small"
                            variant="outlined"
                            sx={{
                                borderRadius: 999,
                                fontWeight: 500,
                            }}
                        />
                    </Box>

                    {shouldShowTimeLeft && (
                        <Box
                            sx={{
                                flexShrink: 0,
                            }}
                        >
                            <TimeLeftBadge
                                value={getTimeLeft(
                                    tender?.endDateTime,
                                    tender?.status,
                                )}
                            />
                        </Box>
                    )}
                </Box>

                <Box>
                    <InfoText
                        label="Откуда"
                        value={getLocationLabel(tender, 'from_location')}
                    />
                </Box>

                <Divider />

                <Box>
                    <InfoText
                        label="Куда"
                        value={getLocationLabel(tender, 'to_location')}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: '1fr 1fr',
                        },
                        gap: 1,
                    }}
                >
                    <InfoText label="Тип груза" value={cargoTypeLabel} />

                    <InfoText
                        label="Вес"
                        value={
                            totalCargoWeight > 0
                                ? `${totalCargoWeight} кг`
                                : 'Не указано'
                        }
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'primary.main',
                        }}
                    >
                        {getMoneyLabel(tender)}
                    </Typography>

                    <Chip
                        label={`Ставки: ${betsCount}`}
                        size="small"
                        variant="outlined"
                        sx={{
                            borderRadius: 999,
                            fontWeight: 500,
                        }}
                    />
                </Box>
            </Stack>
        </Paper>
    );
}
