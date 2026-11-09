import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Box, Skeleton, Stack } from '@mui/material';

// Заглушка загрузки для вида «карточки» на экранах со списками. Повторяет
// раскладку реального списка, поэтому переход со скелетона на данные ничего
// не сдвигает. У экранов обёртки разные (720 или 760, с паддингом и без),
// поэтому maxWidth и padding задаются на месте вызова.
export function CardsListSkeleton({
   count = 3,
   height = 196,
   maxWidth = 760,
   padding = { xs: 2, sm: 3 },
}) {
   const { t } = useTranslation();

   return (
      <Box
         role="status"
         aria-label={t('common.loading.list')}
         sx={{ p: padding }}
      >
         <Stack
            spacing={2}
            sx={{
               maxWidth,
               mx: 'auto',
            }}
         >
            {Array.from({ length: count }, (_, index) => (
               <Skeleton
                  key={index}
                  variant="rounded"
                  height={height}
                  sx={(theme) => ({ borderRadius: `${theme.radius.lg}px` })}
               />
            ))}
         </Stack>
      </Box>
   );
}

CardsListSkeleton.propTypes = {
   count: PropTypes.number,
   height: PropTypes.number,
   maxWidth: PropTypes.number,
   padding: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};
