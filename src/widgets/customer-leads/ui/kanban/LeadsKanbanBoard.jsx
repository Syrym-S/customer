import { Box } from '@mui/material';
import { useTranslation } from "react-i18next";

import { useLeadsContext } from '../../model/useLeadsContext';
import { LEAD_KANBAN_COLUMNS } from './lead-kanban.constants';
import {
   getUnknownStatusLeads,
   groupLeadsByStatus,
} from './lead-kanban.helpers';
import { LeadKanbanColumn } from './LeadKanbanColumn';

export function LeadsKanbanBoard({ leads }) {
   const { t } = useTranslation();

   const { setOpenLead } = useLeadsContext();

   const groupedLeads = groupLeadsByStatus(leads);
   const unknownStatusLeads = getUnknownStatusLeads(leads);

   return (
      <Box
         sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            px: 1,
            py: 1,
            minHeight: '72vh',
            backgroundColor: 'background.default',
         }}
      >
         {LEAD_KANBAN_COLUMNS.map((column) => (
            <LeadKanbanColumn
               key={column.status}
               title={t(column.titleKey)}
               leads={groupedLeads[column.status] || []}
               accentColor={column.accentColor}
               onOpenLead={setOpenLead}
            />
         ))}

         {unknownStatusLeads.length > 0 && (
            <LeadKanbanColumn
               title={t("enums.leadStatusFilter.other")}
               leads={unknownStatusLeads}
               accentColor="default"
               onOpenLead={setOpenLead}
            />
         )}
      </Box>
   );
}
