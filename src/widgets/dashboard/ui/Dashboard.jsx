import { useState } from "react";
import { Box } from "@mui/material";
import { useLeadsContext } from "../../customer-leads/model/useLeadsContext";
import { DashboardMap } from "./DashboardMap";
import { DashboardLeadsList } from "./DashboardLeadsList";
import { DashboardTendersSection } from "./DashboardTendersSection";

export function Dashboard() {
    const { leads, isLoading, error } = useLeadsContext();

    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [hoveredLeadId, setHoveredLeadId] = useState(null);

    const highlightedLeadId = hoveredLeadId || selectedLeadId;

    function handleSelectLead(leadId) {
        setSelectedLeadId(leadId);
    }

    function handleHoverLead(leadId) {
        setHoveredLeadId(leadId);
    }

    function handleLeaveLead() {
        setHoveredLeadId(null);
    }

    return (
        <Box
            sx={{
                width: {
                    xs: "100%",
                    md: "92%",
                    lg: "88%",
                },
                maxWidth: 1440,
                mx: "auto",
                py: 3,
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: "minmax(0, 1.5fr) minmax(380px, 1fr)",
                    },
                    gap: 2,
                    alignItems: "stretch",
                }}
            >
                <DashboardMap
                    leads={leads}
                    isLoading={isLoading}
                    selectedLeadId={selectedLeadId}
                    highlightedLeadId={highlightedLeadId}
                    onSelectLead={handleSelectLead}
                />

                <DashboardLeadsList
                    leads={leads}
                    isLoading={isLoading}
                    error={error}
                    selectedLeadId={selectedLeadId}
                    hoveredLeadId={hoveredLeadId}
                    onSelectLead={handleSelectLead}
                    onHoverLead={handleHoverLead}
                    onLeaveLead={handleLeaveLead}
                />
            </Box>
            <Box
                sx={{
                    mt: 2,
                    width: {
                        xs: "100%",
                        lg: "50%",
                    },
                }}
            >
                <DashboardTendersSection />
            </Box>
        </Box>
    );
}
