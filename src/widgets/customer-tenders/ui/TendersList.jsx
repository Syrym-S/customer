import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';

import { TenderCard } from './TenderCard';
import { TenderDetailsModal } from './TenderDetailsModal';
import { useTendersContext } from '../model/useTendersContext';
import { TendersPagination } from './TendersPagination';

export function TendersList() {
   const { tenders, page, setPage, perPage, count, isLoading, error } =
      useTendersContext();

   const pagesCount = Math.max(1, Math.ceil(count / perPage));

   function handlePageChange(_, value) {
      setPage(value);
   }

   return (
      <Box
         sx={{
            maxWidth: 640,
            mx: 'auto',
            mt: 4,
         }}
      >
         {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
               {error}
            </Alert>
         )}

         {isLoading && (
            <Box
               sx={{
                  py: 4,
                  display: 'flex',
                  justifyContent: 'center',
               }}
            >
               <CircularProgress size={32} />
            </Box>
         )}

         {!isLoading && !error && tenders.length === 0 && (
            <Typography
               color='text.secondary'
               sx={{
                  py: 4,
                  textAlign: 'center',
               }}
            >
               Тендеры не найдены
            </Typography>
         )}

         {!isLoading && !error && tenders.length > 0 && (
            <>
               <Stack spacing={2}>
                  {tenders.map((tender) => (
                     <TenderCard key={tender.id} tender={tender} />
                  ))}
               </Stack>
               <TendersPagination
                  page={page}
                  count={pagesCount}
                  onChange={handlePageChange}
               />
            </>
         )}

         <TenderDetailsModal />
      </Box>
   );
}
