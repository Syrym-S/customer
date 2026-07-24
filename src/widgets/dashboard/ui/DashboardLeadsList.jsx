import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Divider,
    Pagination,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { DashboardLeadItem } from "./DashboardLeadItem";

const DASHBOARD_LEADS_PER_PAGE = 5;

export function DashboardLeadsList({
    leads = [],
    isLoading = false,
    error = null,
    selectedLeadId,
    hoveredLeadId,
    onSelectLead,
    onHoverLead,
    onLeaveLead,
}) {
    const [page, setPage] = useState(1);

    const pageCount = Math.max(
        1,
        Math.ceil(leads.length / DASHBOARD_LEADS_PER_PAGE),
    );

    const paginatedLeads = useMemo(() => {
        const startIndex = (page - 1) * DASHBOARD_LEADS_PER_PAGE;
        const endIndex = startIndex + DASHBOARD_LEADS_PER_PAGE;

        return leads.slice(startIndex, endIndex);
    }, [leads, page]);

    function handlePageChange(_, value) {
        setPage(value);
    }

    useEffect(() => {
        setPage(1);
    }, [leads.length]);

    return (
        <Paper
            variant="outlined"
            sx={{
                height: {
                    xs: "auto",
                    lg: 500,
                },
                borderRadius: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
            }}
        >
            <Box sx={{ mb: 1.5 }}>
                <Typography variant="h6" fontWeight={600}>
                    Активные лиды
                </Typography>

                <Typography color="text.secondary" fontSize={14}>
                    Выберите лид, чтобы подсветить маршрут на карте
                </Typography>
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
                    overflowY: "auto",
                    pr: 0.5,
                }}
            >
                {isLoading && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        Загрузка лидов...
                    </Typography>
                )}

                {!isLoading && !leads.length && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        Активных лидов пока нет
                    </Typography>
                )}

                {!isLoading && Boolean(leads.length) && (
                    <Stack spacing={1.25}>
                        {paginatedLeads.map((lead) => (
                            <DashboardLeadItem
                                key={lead.id}
                                lead={lead}
                                isSelected={
                                    String(selectedLeadId) === String(lead.id)
                                }
                                isHovered={
                                    String(hoveredLeadId) === String(lead.id)
                                }
                                onSelectLead={onSelectLead}
                                onHoverLead={onHoverLead}
                                onLeaveLead={onLeaveLead}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {leads.length > DASHBOARD_LEADS_PER_PAGE && (
                <Pagination
                    color="primary"
                    shape="rounded"
                    size="small"
                    page={page}
                    count={pageCount}
                    onChange={handlePageChange}
                    sx={{
                        mt: 1.5,
                        mx: "auto",
                    }}
                />
            )}
        </Paper>
    );
}
