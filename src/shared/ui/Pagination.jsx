
import { Box, Pagination as MuiPagination, useMediaQuery } from '@mui/material';

export function Pagination({ page, count, onChange }) {
   const isSmallMobile = useMediaQuery('(max-width: 375px)');

   return (
      <Box
         sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
         }}
      >
         <MuiPagination
            page={page}
            count={count}
            onChange={onChange}
            color='primary'
            shape='rounded'
            size={isSmallMobile ? 'small' : 'medium'}
            siblingCount={isSmallMobile ? 0 : 1}
            boundaryCount={1}
         />
      </Box>
   );
}
