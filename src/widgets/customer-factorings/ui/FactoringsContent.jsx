import { useState } from 'react';
import { useTranslation } from "react-i18next";

import {
    Alert,
    Box,
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
import { CardsListSkeleton } from '../../../shared/ui/skeletons/CardsListSkeleton';
import { FactoringDetailsModal } from './FactoringDetailsModal';
import { FactoringsTable } from './FactoringsTable';
import { PageContainer } from '../../../shared/ui/PageContainer';

const FACTORINGS_VIEW_MODES = {
    TABLE: 'table',
    CARDS: 'cards',
};

export function FactoringsContent() {
    const { t } = useTranslation();

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

        isInitiatingSigning,
        signingError,

        isCancelling,
        cancelError,

        openFactoringDetails,
        closeFactoringDetails,

        initiateFactoringSigning,
        cancelFactoring,
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
        <PageContainer>
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
                            {t("factorings.purchasesTitle")}
                        </Typography>

                        <Typography color="text.secondary" fontSize={14}>
                            {t("factorings.subtitle")}
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
                            aria-label={t("factorings.viewToggle")}
                            sx={{
                                direction: "ltr",
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
                                aria-label={t("common.view.showAsTable")}
                                title={t("common.view.table")}
                            >
                                <ViewListRoundedIcon fontSize="small" />
                            </ToggleButton>

                            <ToggleButton
                                value={FACTORINGS_VIEW_MODES.CARDS}
                                aria-label={t("common.view.showAsCards")}
                                title={t("common.view.cards")}
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
                    {/* Каждый вид показывает загрузку сам: таблица —
                        скелетон-оверлеем сетки, карточки — через
                        CardsListSkeleton. */}
                    {viewMode === FACTORINGS_VIEW_MODES.TABLE ? (
                        <FactoringsTable
                            factorings={factorings}
                            onOpenDetails={openFactoringDetails}
                            isLoading={isLoading}
                        />
                    ) : isLoading ? (
                        <CardsListSkeleton />
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
                </Box>
            </Stack>

            <FactoringDetailsModal
                open={isDetailsOpen}
                factoring={selectedFactoring}
                loading={isDetailsLoading}
                error={detailsError}
                initiatingSigning={isInitiatingSigning}
                signingError={signingError}
                isCancelling={isCancelling}
                cancelError={cancelError}
                onClose={closeFactoringDetails}
                onInitiateSigning={initiateFactoringSigning}
                onCancelFactoring={cancelFactoring}
            />
        </PageContainer>
    );
}
