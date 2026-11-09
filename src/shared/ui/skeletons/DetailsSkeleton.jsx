import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Box, Skeleton, Stack } from '@mui/material';

// Заглушка загрузки для тела модалки деталей. Каждый блок — одна секция:
// иконка с заголовком, затем содержимое.
export function DetailsSkeleton({ sections = 3 }) {
   const { t } = useTranslation();

   return (
      <Stack spacing={2} role="status" aria-label={t('common.loading.default')}>
         {Array.from({ length: sections }, (_, index) => (
            <Box key={index}>
               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: 1,
                     mb: 1,
                  }}
               >
                  <Skeleton variant="circular" width={20} height={20} />

                  <Skeleton variant="text" width={180} sx={{ fontSize: 16 }} />
               </Box>

               <Skeleton
                  variant="rounded"
                  height={72}
                  sx={(theme) => ({ borderRadius: `${theme.radius.md}px` })}
               />
            </Box>
         ))}
      </Stack>
   );
}

DetailsSkeleton.propTypes = {
   sections: PropTypes.number,
};
