import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Divider,
    FormControlLabel,
    Pagination,
    Paper,
    Stack,
    Switch,
    Typography,
} from '@mui/material';

import { useTendersContext } from '../../customer-tenders/model/useTendersContext';
import { DashboardTenderItem } from './DashboardTenderItem';

const DASHBOARD_TENDERS_PER_PAGE = 5;

function getTenderPublicationType(tender) {
    return String(tender?.publication_type || '').toLowerCase();
}

export function DashboardTendersSection() {
    const { tenders, isLoading, error } = useTendersContext();

    const [page, setPage] = useState(1);
    const [publicationType, setPublicationType] = useState('public');

    const filteredTenders = useMemo(() => {
        return tenders.filter((tender) => {
            return getTenderPublicationType(tender) === publicationType;
        });
    }, [tenders, publicationType]);

    const pageCount = Math.max(
        1,
        Math.ceil(filteredTenders.length / DASHBOARD_TENDERS_PER_PAGE),
    );

    const paginatedTenders = useMemo(() => {
        const startIndex = (page - 1) * DASHBOARD_TENDERS_PER_PAGE;
        const endIndex = startIndex + DASHBOARD_TENDERS_PER_PAGE;

        return filteredTenders.slice(startIndex, endIndex);
    }, [filteredTenders, page]);

    function handlePageChange(_, value) {
        setPage(value);
    }

    function handlePublicationTypeChange(event) {
        const nextPublicationType = event.target.checked ? 'private' : 'public';

        setPage(1);
        setPublicationType(nextPublicationType);
    }

    useEffect(() => {
        setPage(1);
    }, [publicationType, tenders.length]);

    return (
        <Paper
            variant="outlined"
            sx={{
                height: {
                    xs: 'auto',
                    lg: 500,
                },
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                    },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 1.5,
                    flexDirection: {
                        xs: 'column',
                        sm: 'row',
                    },
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={600}>
                        Тендеры
                    </Typography>

                    <Typography color="text.secondary" fontSize={14}>
                        Список тендеров
                    </Typography>
                </Box>

                <FormControlLabel
                    label={
                        publicationType === 'private'
                            ? 'Приватные'
                            : 'Публичные'
                    }
                    labelPlacement="start"
                    control={
                        <Switch
                            checked={publicationType === 'private'}
                            onChange={handlePublicationTypeChange}
                            color="primary"
                        />
                    }
                    sx={{
                        m: 0,
                        alignSelf: {
                            xs: 'flex-start',
                            sm: 'center',
                        },
                        '& .MuiFormControlLabel-label': {
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.primary',
                        },
                    }}
                />
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {error && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pr: 0.5,
                    minHeight: 0,
                }}
            >
                {isLoading && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        Загрузка тендеров...
                    </Typography>
                )}

                {!isLoading && !filteredTenders.length && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        {publicationType === 'private'
                            ? 'Приватные тендеры пока не найдены'
                            : 'Публичные тендеры пока не найдены'}
                    </Typography>
                )}

                {!isLoading && Boolean(filteredTenders.length) && (
                    <Stack spacing={1.25}>
                        {paginatedTenders.map((tender) => (
                            <DashboardTenderItem
                                key={tender.id}
                                tender={tender}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {filteredTenders.length > DASHBOARD_TENDERS_PER_PAGE && (
                <Pagination
                    color="primary"
                    shape="rounded"
                    size="small"
                    page={page}
                    count={pageCount}
                    onChange={handlePageChange}
                    sx={{
                        mt: 1.5,
                        mx: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                />
            )}
        </Paper>
    );
}
