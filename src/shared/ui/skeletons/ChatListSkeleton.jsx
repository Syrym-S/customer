import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Box, Skeleton, Stack } from '@mui/material';

// Заглушка загрузки для списка чатов. Повторяет строку списка: аватар 36px с
// двумя строками текста рядом и та же разделительная линия, поэтому список не
// прыгает, когда приходят реальные чаты.
export function ChatListSkeleton({ count = 6 }) {
   const { t } = useTranslation();

   return (
      <Box role="status" aria-label={t('common.loading.list')}>
         {Array.from({ length: count }, (_, index) => (
            <Box
               key={index}
               sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  px: 2,
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
               }}
            >
               <Skeleton variant="circular" width={36} height={36} />

               <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                  <Skeleton variant="text" width="45%" />

                  <Skeleton variant="text" width="75%" />
               </Stack>
            </Box>
         ))}
      </Box>
   );
}

ChatListSkeleton.propTypes = {
   count: PropTypes.number,
};
