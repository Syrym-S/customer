import { useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { useFactoringsContext } from '../model/useFactoringsContext';
import {
    formatDate,
    formatMoney,
    getFactoringStatusColor,
    getFactoringStatusLabel,
    getVerificationColor,
    getVerificationLabel,
} from '../model/factorings.helpers';
import { FactoringCardsList } from './FactoringCardsList';
import { FactoringDetailsModal } from './FactoringDetailsModal';

const FACTORINGS_VIEW_MODES = {
    TABLE: 'table',
    CARDS: 'cards',
};

export function FactoringsContent() {
    const {
        factorings,

        page,
        setPage,
        pageCount,

        isLoading,
        loadError,

        selectedFactoring,
        isDetailsOpen,
        isDetailsLoading,
        detailsError,

        isAccepting,
        acceptError,

        openFactoringDetails,
        closeFactoringDetails,

        acceptFactoring,
    } = useFactoringsContext();

    const [viewMode, setViewMode] = useState(FACTORINGS_VIEW_MODES.CARDS);

    function handleViewModeChange(_, nextViewMode) {
        if (!nextViewMode) {
            return;
        }

        setViewMode(nextViewMode);
    }

    function handlePageChange(_, nextPage) {
        setPage(nextPage);
    }

    return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
            <Stack spacing={3}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2,
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                    }}
                >
                    <Box>
                        <Typography variant='h6' fontWeight={600}>
                            Факторинг-покупки
                        </Typography>

                        <Typography color='text.secondary' fontSize={14}>
                            Список заявок на факторинг
                        </Typography>
                    </Box>

                    <Stack
                        direction={{
                            xs: 'column',
                            sm: 'row',
                        }}
                        spacing={1}
                        sx={{
                            width: {
                                xs: '100%',
                                sm: 'auto',
                            },
                            alignItems: {
                                xs: 'stretch',
                                sm: 'center',
                            },
                        }}
                    >
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            size='small'
                            color='primary'
                            aria-label='Переключение отображения факторингов'
                            sx={{
                                alignSelf: {
                                    xs: 'stretch',
                                    sm: 'auto',
                                },
                                '& .MuiToggleButton-root': {
                                    px: 1.5,
                                    minWidth: 40,
                                },
                            }}
                        >
                            <ToggleButton
                                value={FACTORINGS_VIEW_MODES.TABLE}
                                aria-label='Показать таблицей'
                                title='Таблица'
                            >
                                <ViewListRoundedIcon fontSize='small' />
                            </ToggleButton>

                            <ToggleButton
                                value={FACTORINGS_VIEW_MODES.CARDS}
                                aria-label='Показать карточками'
                                title='Карточки'
                            >
                                <GridViewRoundedIcon fontSize='small' />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Box>

                {loadError && <Alert severity='error'>{loadError}</Alert>}

                <Paper
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}
                >
                    {isLoading ? (
                        <Box
                            sx={{
                                minHeight: 240,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {viewMode === FACTORINGS_VIEW_MODES.TABLE ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>№</TableCell>
                                                <TableCell>Дата</TableCell>
                                                <TableCell>Фактор</TableCell>
                                                <TableCell>
                                                    Экспедитор
                                                </TableCell>
                                                <TableCell>
                                                    Дебиторская сумма
                                                </TableCell>
                                                <TableCell>
                                                    Кредитная сумма
                                                </TableCell>
                                                <TableCell>
                                                    Подтверждения
                                                </TableCell>
                                                <TableCell align='right'>
                                                    Статус
                                                </TableCell>
                                                <TableCell align='right'>
                                                    Действия
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {factorings.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={9}>
                                                        <Box
                                                            sx={{
                                                                py: 4,
                                                                textAlign:
                                                                    'center',
                                                            }}
                                                        >
                                                            <Typography color='text.secondary'>
                                                                Факторинг-покупки
                                                                не найдены
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                factorings.map((factoring) => (
                                                    <TableRow
                                                        key={factoring.index}
                                                        hover
                                                        onClick={() =>
                                                            openFactoringDetails(
                                                                factoring,
                                                            )
                                                        }
                                                        sx={{
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <TableCell>
                                                            {factoring.index}
                                                        </TableCell>

                                                        <TableCell>
                                                            {formatDate(
                                                                factoring.created_at,
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack
                                                                spacing={0.5}
                                                            >
                                                                <Typography
                                                                    fontSize={
                                                                        14
                                                                    }
                                                                >
                                                                    {factoring
                                                                        .factor
                                                                        ?.company_name ||
                                                                        '—'}
                                                                </Typography>

                                                                <Typography
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                    color='text.secondary'
                                                                >
                                                                    БИН:{' '}
                                                                    {factoring
                                                                        .factor
                                                                        ?.bin ||
                                                                        '—'}
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack
                                                                spacing={0.5}
                                                            >
                                                                <Typography
                                                                    fontSize={
                                                                        14
                                                                    }
                                                                >
                                                                    {factoring
                                                                        .forwarder
                                                                        ?.company_name ||
                                                                        '—'}
                                                                </Typography>

                                                                <Typography
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                    color='text.secondary'
                                                                >
                                                                    БИН:{' '}
                                                                    {factoring
                                                                        .forwarder
                                                                        ?.bin ||
                                                                        '—'}
                                                                </Typography>

                                                                {factoring
                                                                    .forwarder
                                                                    ?.fio && (
                                                                    <Typography
                                                                        fontSize={
                                                                            12
                                                                        }
                                                                        color='text.secondary'
                                                                    >
                                                                        {
                                                                            factoring
                                                                                .forwarder
                                                                                .fio
                                                                        }
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell>
                                                            {formatMoney(
                                                                factoring.deb_summ,
                                                                factoring.deb_currency,
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            {formatMoney(
                                                                factoring.cred_summ,
                                                                factoring.currency,
                                                            )}
                                                        </TableCell>

                                                        <TableCell>
                                                            <Stack
                                                                spacing={0.75}
                                                                alignItems='flex-start'
                                                            >
                                                                <Chip
                                                                    size='small'
                                                                    label={`Вы: ${getVerificationLabel(
                                                                        factoring.verified_customer,
                                                                    )}`}
                                                                    color={getVerificationColor(
                                                                        factoring.verified_customer,
                                                                    )}
                                                                    sx={{
                                                                        borderRadius: 999,
                                                                    }}
                                                                />

                                                                <Chip
                                                                    size='small'
                                                                    label={`Экспедитор: ${getVerificationLabel(
                                                                        factoring.verified_forwarder,
                                                                    )}`}
                                                                    color={getVerificationColor(
                                                                        factoring.verified_forwarder,
                                                                    )}
                                                                    variant={
                                                                        factoring.verified_forwarder
                                                                            ? 'filled'
                                                                            : 'outlined'
                                                                    }
                                                                    sx={{
                                                                        borderRadius: 999,
                                                                    }}
                                                                />
                                                            </Stack>
                                                        </TableCell>

                                                        <TableCell align='right'>
                                                            <Chip
                                                                size='small'
                                                                label={getFactoringStatusLabel(
                                                                    factoring.status,
                                                                )}
                                                                color={getFactoringStatusColor(
                                                                    factoring.status,
                                                                )}
                                                                sx={{
                                                                    borderRadius: 999,
                                                                }}
                                                            />
                                                        </TableCell>

                                                        <TableCell align='right'>
                                                            <Button
                                                                size='small'
                                                                variant='outlined'
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.stopPropagation();
                                                                    openFactoringDetails(
                                                                        factoring,
                                                                    );
                                                                }}
                                                            >
                                                                Подробнее
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <FactoringCardsList
                                    factorings={factorings}
                                    onOpenDetails={openFactoringDetails}
                                />
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent:
                                        viewMode === FACTORINGS_VIEW_MODES.TABLE
                                            ? 'flex-end'
                                            : 'center',
                                    p: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Pagination
                                    page={page}
                                    count={pageCount}
                                    onChange={handlePageChange}
                                    color='primary'
                                    shape='rounded'
                                />
                            </Box>
                        </>
                    )}
                </Paper>
            </Stack>

            <FactoringDetailsModal
                open={isDetailsOpen}
                factoring={selectedFactoring}
                loading={isDetailsLoading}
                error={detailsError}
                accepting={isAccepting}
                acceptError={acceptError}
                onClose={closeFactoringDetails}
                onAccept={acceptFactoring}
            />
        </Container>
    );
}
