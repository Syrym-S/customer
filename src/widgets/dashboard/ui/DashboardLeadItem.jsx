import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { normalizeLocationValue } from "../../customer-leads/model/lead-edit-form.helpers";
import {
    getLeadStatusLabel,
    getLeadStatusStyles,
} from "../../customer-leads/model/lead.helpers";

function formatLocation(location) {
    return normalizeLocationValue(location) || "Адрес не указан";
}

function hasValue(value) {
    return value !== null && value !== undefined && value !== "";
}

function formatLeadPrice(lead) {
    const price = hasValue(lead?.summ) ? lead.summ : lead?.cargo_price;

    if (!hasValue(price)) {
        return "Цена не указана";
    }

    return `${Number(price).toLocaleString("ru-RU")} ${lead?.currency || ""}`.trim();
}

function hasRouteCoordinates(lead) {
    return Boolean(
        lead?.from_location?.lat &&
        lead?.from_location?.lon &&
        lead?.to_location?.lat &&
        lead?.to_location?.lon,
    );
}

function LeadStatusChip({ status }) {
    return (
        <Chip
            label={getLeadStatusLabel(status)}
            variant="outlined"
            size="small"
            sx={{
                borderRadius: 999,
                fontWeight: 600,
                fontSize: "0.75rem",
                ...getLeadStatusStyles(status),
            }}
        />
    );
}

export function DashboardLeadItem({
    lead,
    isSelected,
    isHovered,
    onSelectLead,
    onHoverLead,
    onLeaveLead,
}) {
    const navigate = useNavigate();

    const leadId = lead?.id;
    const hasRoute = hasRouteCoordinates(lead);

    function handleClick() {
        onSelectLead?.(leadId);
    }

    function handleMouseEnter() {
        onHoverLead?.(leadId);
    }

    function handleMouseLeave() {
        onLeaveLead?.();
    }

    function handleDoubleClick() {
        if (!leadId) {
            return;
        }

        navigate(`/customer/leads/${leadId}`);
    }

    return (
        <Paper
            variant="outlined"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleDoubleClick}
            sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                transition: "0.2s ease",
                borderColor:
                    isSelected || isHovered ? "primary.main" : "divider",
                backgroundColor: isSelected
                    ? "primary.50"
                    : isHovered
                      ? "rgba(33, 150, 243, 0.04)"
                      : "background.paper",
                boxShadow:
                    isSelected || isHovered
                        ? "0 6px 18px rgba(33, 150, 243, 0.16)"
                        : "none",
                "&:hover": {
                    borderColor: "primary.light",
                    boxShadow: "0 6px 18px rgba(33, 150, 243, 0.12)",
                },
            }}
        >
            <Stack spacing={1.25}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.75,
                        minWidth: 0,
                    }}
                >
                    <Chip
                        label={`Лид #${lead?.num || lead?.id || "—"}`}
                        size="small"
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        sx={{
                            fontWeight: 600,
                            borderRadius: 999,
                        }}
                    />

                    {lead?.status && <LeadStatusChip status={lead.status} />}
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Откуда
                    </Typography>

                    <Typography
                        fontWeight={500}
                        sx={{
                            fontSize: 13,
                            lineHeight: 1.35,
                        }}
                    >
                        {formatLocation(lead?.from_location)}
                    </Typography>
                </Box>

                <Divider />

                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Куда
                    </Typography>

                    <Typography
                        fontWeight={500}
                        sx={{
                            fontSize: 13,
                            lineHeight: 1.35,
                        }}
                    >
                        {formatLocation(lead?.to_location)}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "primary.main",
                        }}
                    >
                        {formatLeadPrice(lead)}
                    </Typography>

                    {!hasRoute && (
                        <Chip
                            label="Нет координат"
                            size="small"
                            color="warning"
                            variant="outlined"
                        />
                    )}
                </Box>
            </Stack>
        </Paper>
    );
}
