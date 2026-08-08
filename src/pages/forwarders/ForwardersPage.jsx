import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    InputAdornment,
    Pagination,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

import { ForwardersProvider } from '../../entities/forwarder/model/ForwardersProvider';
import { useForwardersContext } from '../../entities/forwarder/model/useForwardersContext';
import { FORWARDERS_VIEW_MODES } from '../../entities/forwarder/model/forwarder.constants';
import { ForwardersTable } from '../../widgets/forwarders-list/ui/ForwardersTable';
import { ForwarderDetailsModal } from '../../widgets/forwarder-details/ui/ForwarderDetailsModal';
import { ForwardersCardsList } from '../../widgets/forwarders-list/ui/ForwardersCardsList';
import { CreateForwarderInviteModal } from '../../features/invite-forwarder/ui/CreateForwarderInviteModal';

export function ForwardersPage() {
    return (
        <ForwardersProvider>
            <ForwardersPageContent />
        </ForwardersProvider>
    );
}

function ForwardersPageContent() {
    const {
        forwarders,

        page,
        setPage,
        pageCount,

        search,
        setSearch,
        isSearchMode,

        isLoading,
        error,

        selectedForwarder,
        isDetailsOpen,
        isDetailsLoading,
        detailsError,
        openForwarderDetails,
        closeForwarderDetails,

        viewMode,
        setViewMode,

        isCreateOpen,
        isCreating,
        createError,
        createdInvite,
        openCreateForwarder,
        closeCreateForwarder,
        createForwarder,
    } = useForwardersContext();

    function handleViewModeChange(_, nextViewMode) {
        if (!nextViewMode) {
            return;
        }

        setViewMode(nextViewMode);
    }

    function handleSearchChange(event) {
        setSearch(event.target.value);
    }

    function handlePageChange(_, nextPage) {
        setPage(nextPage);
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Stack spacing={3}>
                <Stack spacing={1.5}>
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
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" fontWeight={600}>
                                Экспедиторы
                            </Typography>

                            <Typography color="text.secondary" fontSize={14}>
                                Полный список экспедиторов с поиском по
                                компании, представителю, БИН или телефону
                            </Typography>
                        </Box>

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={handleViewModeChange}
                            size="small"
                            color="primary"
                            aria-label="Переключение отображения экспедиторов"
                            sx={{
                                flexShrink: 0,
                                alignSelf: {
                                    xs: 'flex-start',
                                    sm: 'center',
                                },
                                '& .MuiToggleButton-root': {
                                    px: 1.5,
                                    minWidth: 40,
                                },
                            }}
                        >
                            <ToggleButton
                                value={FORWARDERS_VIEW_MODES.TABLE}
                                aria-label="Показать таблицей"
                                title="Таблица"
                            >
                                <ViewListRoundedIcon fontSize="small" />
                            </ToggleButton>

                            <ToggleButton
                                value={FORWARDERS_VIEW_MODES.CARDS}
                                aria-label="Показать карточками"
                                title="Карточки"
                            >
                                <GridViewRoundedIcon fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={openCreateForwarder}
                        sx={{
                            alignSelf: 'flex-start',
                        }}
                    >
                        Пригласить экспедитора
                    </Button>
                </Stack>

                <TextField
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Поиск экспедитора"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRoundedIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {error && <Alert severity="error">{error}</Alert>}

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
                ) : viewMode === FORWARDERS_VIEW_MODES.TABLE ? (
                    <ForwardersTable
                        forwarders={forwarders}
                        onOpenDetails={openForwarderDetails}
                    />
                ) : (
                    <ForwardersCardsList
                        forwarders={forwarders}
                        onOpenDetails={openForwarderDetails}
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
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                )}
            </Stack>

            <ForwarderDetailsModal
                open={isDetailsOpen}
                forwarder={selectedForwarder}
                loading={isDetailsLoading}
                error={detailsError}
                onClose={closeForwarderDetails}
            />

            <CreateForwarderInviteModal
                open={isCreateOpen}
                loading={isCreating}
                error={createError}
                createdInvite={createdInvite}
                onClose={closeCreateForwarder}
                onSubmit={createForwarder}
            />
        </Container>
    );
}
