import PropTypes from 'prop-types';

import { Box, Pagination, useMediaQuery } from '@mui/material';

export function LeadsPagination({ page, count, onChange }) {
   const isSmallMobile = useMediaQuery('(max-width:375px)');
   return (
      <Box
         sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
         }}
      >
         <Pagination
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

LeadsPagination.propTypes = {
   page: PropTypes.number.isRequired,
   count: PropTypes.number.isRequired,
   onChange: PropTypes.func.isRequired,
};
