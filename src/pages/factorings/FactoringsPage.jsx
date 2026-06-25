import { useCallback, useEffect, useState } from 'react';

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
    Typography,
} from '@mui/material';
import {
    acceptCustomerFactoring,
    createCustomerFactoring,
    fetchCustomerFactoringByIndex,
    fetchCustomerFactorings,
} from '../../widgets/customer-factorings/api/factorings.api';
import {
    formatDate,
    formatMoney,
    getFactoringStatusColor,
    getFactoringStatusLabel,
    getVerificationColor,
    getVerificationLabel,
} from '../../widgets/customer-factorings/model/factorings.helpers';
import { FactoringDetailsModal } from '../../widgets/customer-factorings/ui/FactoringDetailsModal';
import { CreateFactoringModal } from '../../widgets/customer-factorings/ui/CreateFactoringModal/CreateFactoringModal';

const PER_PAGE = 10;

export function FactoringsPage() {
    const [factorings, setFactorings] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    const [selectedFactoring, setSelectedFactoring] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState('');

    const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

    const loadFactorings = useCallback(async (nextPage = 1) => {
        try {
            setIsLoading(true);
            setLoadError('');

            const response = await fetchCustomerFactorings({
                page: nextPage,
                perPage: PER_PAGE,
            });

            setFactorings(Array.isArray(response?.data) ? response.data : []);
            setTotal(Number(response?.total || 0));
            setPage(Number(response?.page || nextPage));
        } catch (error) {
            setLoadError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось загрузить факторинг-покупки',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    async function handleOpenDetails(factoring) {
        try {
            setIsDetailsOpen(true);
            setSelectedFactoring(null);
            setDetailsError('');
            setAcceptError('');
            setIsDetailsLoading(true);

            const details = await fetchCustomerFactoringByIndex(
                factoring.index,
            );

            setSelectedFactoring(details);
        } catch (error) {
            setDetailsError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось загрузить детали факторинга',
            );
        } finally {
            setIsDetailsLoading(false);
        }
    }

    function handleCloseDetails() {
        setIsDetailsOpen(false);
        setSelectedFactoring(null);
        setDetailsError('');
        setAcceptError('');
    }

    function handleOpenCreateModal() {
        setIsCreateOpen(true);
        setCreateError('');
        setCreateSuccess('');
    }

    function handleCloseCreateModal() {
        if (isCreating) {
            return;
        }

        setIsCreateOpen(false);
        setCreateError('');
    }

    async function handleCreateFactoring(payload) {
        try {
            setIsCreating(true);
            setCreateError('');
            setCreateSuccess('');

            await createCustomerFactoring(payload);

            setIsCreateOpen(false);
            setCreateSuccess('Факторинг успешно создан');

            await loadFactorings(1);
        } catch (error) {
            setCreateError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось создать факторинг',
            );
        } finally {
            setIsCreating(false);
        }
    }

    async function handleAcceptFactoring() {
        if (!selectedFactoring?.index && selectedFactoring?.index !== 0) {
            return;
        }

        try {
            setIsAccepting(true);
            setAcceptError('');

            await acceptCustomerFactoring(selectedFactoring.index);

            const updatedFactoring = await fetchCustomerFactoringByIndex(
                selectedFactoring.index,
            );

            setSelectedFactoring(updatedFactoring);
            await loadFactorings(page);
        } catch (error) {
            setAcceptError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Не удалось подтвердить факторинг',
            );
        } finally {
            setIsAccepting(false);
        }
    }

    function handlePageChange(_, nextPage) {
        loadFactorings(nextPage);
    }

    useEffect(() => {
        loadFactorings(1);
    }, [loadFactorings]);

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

                    <Button variant='contained' onClick={handleOpenCreateModal}>
                        Создать факторинг
                    </Button>
                </Box>

                {loadError && <Alert severity='error'>{loadError}</Alert>}

                {createSuccess && (
                    <Alert severity='success'>{createSuccess}</Alert>
                )}

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
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>№</TableCell>
                                            <TableCell>Дата</TableCell>
                                            <TableCell>Фактор</TableCell>
                                            <TableCell>Экспедитор</TableCell>
                                            <TableCell>
                                                Дебиторская сумма
                                            </TableCell>
                                            <TableCell>
                                                Кредитная сумма
                                            </TableCell>
                                            <TableCell>Подтверждения</TableCell>
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
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Typography color='text.secondary'>
                                                            Факторинг-покупки не
                                                            найдены
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
                                                        handleOpenDetails(
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
                                                        <Stack spacing={0.5}>
                                                            <Typography
                                                                fontSize={14}
                                                            >
                                                                {factoring
                                                                    .factor
                                                                    ?.company_name ||
                                                                    '—'}
                                                            </Typography>

                                                            <Typography
                                                                fontSize={12}
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
                                                        <Stack spacing={0.5}>
                                                            <Typography
                                                                fontSize={14}
                                                            >
                                                                {factoring
                                                                    .forwarder
                                                                    ?.company_name ||
                                                                    '—'}
                                                            </Typography>

                                                            <Typography
                                                                fontSize={12}
                                                                color='text.secondary'
                                                            >
                                                                БИН:{' '}
                                                                {factoring
                                                                    .forwarder
                                                                    ?.bin ||
                                                                    '—'}
                                                            </Typography>

                                                            {factoring.forwarder
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
                                                                handleOpenDetails(
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

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
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
                onClose={handleCloseDetails}
                onAccept={handleAcceptFactoring}
            />

            <CreateFactoringModal
                open={isCreateOpen}
                loading={isCreating}
                error={createError}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateFactoring}
            />
        </Container>
    );
}
