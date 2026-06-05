import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';

import { useLeadsContext } from '../model/useLeadsContext';
import { LeadCard } from './LeadCard';
import { LeadDetailsModal } from './LeadDetailsModal';
import { LeadsPagination } from './LeadsPagination';

export function LeadsListContent() {
   const { leads, page, setPage, perPage, count, isLoading, error } =
      useLeadsContext();

   const pagesCount = Math.max(1, Math.ceil(count / perPage));

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
         {isLoading && (
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 4,
               }}
            >
               <CircularProgress />
            </Box>
         )}

         {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
               {error}
            </Alert>
         )}

         {!isLoading && !error && leads.length === 0 && (
            <Typography
               color='text.secondary'
               sx={{
                  py: 4,
                  textAlign: 'center',
               }}
            >
               Лиды не найдены
            </Typography>
         )}

         {!isLoading && !error && leads.length > 0 && (
            <>
               <Stack spacing={2}>
                  {leads.map((lead) => (
                     <LeadCard key={lead.id} lead={lead} />
                  ))}
               </Stack>
               <LeadsPagination
                  page={page}
                  count={pagesCount}
                  onChange={handlePageChange}
               />
            </>
         )}

         <LeadDetailsModal />
      </Box>
   );
}
