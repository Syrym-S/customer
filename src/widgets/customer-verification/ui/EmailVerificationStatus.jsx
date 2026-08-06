import { useEffect, useState } from 'react';

import {
   Alert,
   Button,
   CircularProgress,
   Stack,
   Typography,
} from '@mui/material';

import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import { fetchEmailVerificationStatus } from '../api/email-verification.api';

import {
   getIsEmailVerified,
   openEmailVerificationModal,
   subscribeToEmailVerificationStatusChanged,
} from '../model/email-verification.helpers';

export function EmailVerificationStatus() {
   const [isVerified, setIsVerified] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [loadError, setLoadError] = useState('');

   async function loadStatus() {
      try {
         setIsLoading(true);
         setLoadError('');

         const response = await fetchEmailVerificationStatus();

         setIsVerified(getIsEmailVerified(response));
      } catch (error) {
         setLoadError(
            error.response?.data?.message ||
               error.response?.data?.error ||
               error.message ||
               'Не удалось проверить статус email',
         );
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      loadStatus();

      return subscribeToEmailVerificationStatusChanged((event) => {
         setIsVerified(Boolean(event.detail?.isVerified));
      });
   }, []);

   const wrapperSx = {
      px: 1.5,
      py: 1,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1.5,
   };

   if (isLoading) {
      return (
         <Stack direction='row' alignItems='center' spacing={1} sx={wrapperSx}>
            <CircularProgress size={16} />
            <Typography
               color='text.secondary'
               sx={{ fontSize: 14, lineHeight: 1.4 }}
            >
               Проверка статуса email…
            </Typography>
         </Stack>
      );
   }

   if (loadError) {
      return (
         <Alert severity='error' sx={{ py: 0.5 }}>
            {loadError}
         </Alert>
      );
   }

   if (isVerified === true) {
      return (
         <Stack direction='row' alignItems='center' spacing={0.75} sx={wrapperSx}>
            <CheckCircleOutlineRoundedIcon
               color='success'
               sx={{ fontSize: 18 }}
            />
            <Typography
               color='text.secondary'
               sx={{ fontSize: 14, lineHeight: 1.4 }}
            >
               Email подтверждён
            </Typography>
         </Stack>
      );
   }

   if (isVerified === false) {
      return (
         <Stack
            direction='row'
            sx={{
               ...wrapperSx,
               alignItems: 'center',
               justifyContent: 'space-between',
               flexWrap: 'wrap',
               width: '100%',
               borderColor: 'warning.main',
               backgroundColor: 'warning.50',
            }}
         >
            <Stack direction='row' alignItems='center' spacing={0.75}>
               <ErrorOutlineRoundedIcon color='warning' sx={{ fontSize: 18 }} />
               <Typography
                  color='text.secondary'
                  sx={{ fontSize: 14, lineHeight: 1.4 }}
               >
                  Email не подтверждён
               </Typography>
            </Stack>
            <Button
               size='small'
               variant='text'
               onClick={openEmailVerificationModal}
               sx={{
                  minWidth: 'auto',
                  height: 24,
                  minHeight: 24,
                  px: 1,
                  py: 0,
                  fontSize: 13,
               }}
            >
               Подтвердить
            </Button>
         </Stack>
      );
   }

   return null;
}