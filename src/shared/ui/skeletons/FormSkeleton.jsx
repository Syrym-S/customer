import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Box, Skeleton, Stack } from '@mui/material';

// Заглушка загрузки для формы, которая ждёт свои текущие значения. По блоку
// на поле: строка подписи над полосой высотой input.
export function FormSkeleton({ fields = 5 }) {
   const { t } = useTranslation();

   return (
      <Stack
         spacing={2.5}
         role="status"
         aria-label={t('common.loading.default')}
      >
         {Array.from({ length: fields }, (_, index) => (
            <Box key={index}>
               <Skeleton variant="text" width={140} sx={{ mb: 0.5 }} />

               <Skeleton
                  variant="rounded"
                  height={40}
                  sx={(theme) => ({ borderRadius: `${theme.radius.md}px` })}
               />
            </Box>
         ))}
      </Stack>
   );
}

FormSkeleton.propTypes = {
   fields: PropTypes.number,
};
