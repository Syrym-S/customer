import { useState } from 'react';

import { Box, Stack } from '@mui/material';

import { LeadCard } from './LeadCard';
import { LeadsPagination } from './LeadsPagination';
import { LeadDetailsModal } from './LeadDetailsModal';
import { mockLeads } from '../model/leads.mock';

const ITEMS_PER_PAGE = 4;

export function LeadsListContent() {
   const [page, setPage] = useState(1);

   const pagesCount = Math.ceil(mockLeads.length / ITEMS_PER_PAGE);

   const startIndex = (page - 1) * ITEMS_PER_PAGE;
   const endIndex = startIndex + ITEMS_PER_PAGE;

   const currentLeads = mockLeads.slice(startIndex, endIndex);

   const handlePageChange = (_, value) => {
      setPage(value);
   };

   return (
      <Box
         sx={{
            maxWidth: 640,
            mx: 'auto',
            mt: 4,
         }}
      >
         <Stack spacing={2}>
            {currentLeads.map((lead) => (
               <LeadCard key={lead.id} lead={lead} />
            ))}
         </Stack>

         <LeadsPagination
            page={page}
            count={pagesCount}
            onChange={handlePageChange}
         />

         <LeadDetailsModal />
      </Box>
   );
}
