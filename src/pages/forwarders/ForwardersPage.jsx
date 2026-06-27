import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Container,
    InputAdornment,
    Pagination,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
    fetchForwarderById,
    fetchForwardersApi,
    searchForwardersApi,
} from '../../features/create-lead/api/forwarders.api';
import {
    FORWARDERS_PER_PAGE,
    getForwarderId,
    normalizeForwardersListResponse,
} from '../../widgets/customer-forwarders/model/forwarders.helpers';
import { ForwardersTable } from '../../widgets/customer-forwarders/ui/ForwardersTable';
import { ForwarderDetailsModal } from '../../widgets/customer-forwarders/ui/ForwardersDetailsModal';

export function ForwardersPage() {
    const [forwarders, setForwarders] = useState([]);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedForwarder, setSelectedForwarder] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const isSearchMode = Boolean(debouncedSearch.trim());

    const pageCount = useMemo(
        () => Math.max(1, Math.ceil(total / FORWARDERS_PER_PAGE)),
        [total],
    );

    const loadForwarders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');

            if (isSearchMode) {
                const searchResults =
                    await searchForwardersApi(debouncedSearch);

                const nextForwarders = Array.isArray(searchResults)
                    ? searchResults
                    : [];

                setForwarders(nextForwarders);
                setTotal(nextForwarders.length);
                return;
            }

            const response = await fetchForwardersApi({
                page,
                perPage: FORWARDERS_PER_PAGE,
            });

            const mappedResponse = normalizeForwardersListResponse(response);

            setForwarders(mappedResponse.forwarders);
            setTotal(mappedResponse.total);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    requestError.response?.data?.error ||
                    requestError.message ||
                    'Не удалось загрузить экспедиторов',
            );
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, isSearchMode, page]);

    function handleSearchChange(event) {
        setSearch(event.target.value);
    }

    function handlePageChange(_, nextPage) {
        setPage(nextPage);
    }

    async function handleOpenDetails(forwarder) {
        const forwarderId = getForwarderId(forwarder);

        if (!forwarderId) {
            return;
        }

        try {
            setIsDetailsOpen(true);
            setSelectedForwarder(forwarder);
            setDetailsError('');
            setIsDetailsLoading(true);

            const details = await fetchForwarderById(forwarderId);

            setSelectedForwarder(details || forwarder);
        } catch (requestError) {
            setDetailsError(
                requestError.response?.data?.message ||
                    requestError.response?.data?.error ||
                    requestError.message ||
                    'Не удалось загрузить данные экспедитора',
            );
        } finally {
            setIsDetailsLoading(false);
        }
    }

    function handleCloseDetails() {
        if (isDetailsLoading) {
            return;
        }

        setIsDetailsOpen(false);
        setSelectedForwarder(null);
        setDetailsError('');
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 450);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [search]);

    useEffect(() => {
        loadForwarders();
    }, [loadForwarders]);

    return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant='h6' fontWeight={600}>
                        Экспедиторы
                    </Typography>

                    <Typography color='text.secondary' fontSize={14}>
                        Полный список экспедиторов с поиском по компании,
                        представителю, БИН или телефону
                    </Typography>
                </Box>

                <TextField
                    value={search}
                    onChange={handleSearchChange}
                    placeholder='Поиск экспедитора'
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                                <SearchRoundedIcon color='action' />
                            </InputAdornment>
                        ),
                    }}
                />

                {error && <Alert severity='error'>{error}</Alert>}

                {isLoading ? (
                    <Box
                        sx={{
                            minHeight: 280,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <ForwardersTable
                        forwarders={forwarders}
                        onOpenDetails={handleOpenDetails}
                    />
                )}

                {!isLoading && !isSearchMode && pageCount > 1 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
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
                )}
            </Stack>

            <ForwarderDetailsModal
                open={isDetailsOpen}
                forwarder={selectedForwarder}
                loading={isDetailsLoading}
                error={detailsError}
                onClose={handleCloseDetails}
            />
        </Container>
    );
}
