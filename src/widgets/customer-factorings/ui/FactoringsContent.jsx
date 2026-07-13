import { useState } from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Container,
    Pagination,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import { useFactoringsContext } from '../model/useFactoringsContext';
import { FactoringCardsList } from './FactoringCardsList';
import { FactoringDetailsModal } from './FactoringDetailsModal';
import { FactoringsTable } from './FactoringsTable';

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

    const [viewMode, setViewMode] = useState(FACTORINGS_VIEW_MODES.TABLE);

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
        <Container maxWidth="lg" sx={{ py: 3 }}>
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
                        <Typography variant="h6" fontWeight={600}>
                            Факторинг-покупки
                        </Typography>

                        <Typography color="text.secondary" fontSize={14}>
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
                            size="small"
                            color="primary"
                            aria-label="Переключение отображения факторингов"
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
                                aria-label="Показать таблицей"
                                title="Таблица"
                            >
                                <ViewListRoundedIcon fontSize="small" />
                            </ToggleButton>

                            <ToggleButton
                                value={FACTORINGS_VIEW_MODES.CARDS}
                                aria-label="Показать карточками"
                                title="Карточки"
                            >
                                <GridViewRoundedIcon fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Box>

                {loadError && <Alert severity="error">{loadError}</Alert>}

                <Box
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
                                <FactoringsTable
                                    factorings={factorings}
                                    onOpenDetails={openFactoringDetails}
                                />
                            ) : (
                                <FactoringCardsList
                                    factorings={factorings}
                                    onOpenDetails={openFactoringDetails}
                                />
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    p: 2,
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
                        </>
                    )}
                </Box>
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
