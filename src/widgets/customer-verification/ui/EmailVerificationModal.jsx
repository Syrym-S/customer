import { useEffect, useState } from 'react';

import {
   Alert,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Stack,
   Typography,
} from '@mui/material';

import { resendEmailVerification } from '../api/email-verification.api';

import {
   getEmailVerificationCooldownLeft,
   getResendVerificationMessage,
   startEmailVerificationCooldown,
} from '../model/email-verification.helpers';

export function EmailVerificationModal({ open, onClose }) {
   const [isSending, setIsSending] = useState(false);
   const [sendError, setSendError] = useState('');
   const [sendSuccess, setSendSuccess] = useState('');
   const [cooldownLeft, setCooldownLeft] = useState(0);

   async function handleResendVerification() {
      if (cooldownLeft > 0 || isSending) {
         return;
      }

      try {
         setIsSending(true);
         setSendError('');
         setSendSuccess('');

         const response = await resendEmailVerification();

         setSendSuccess(getResendVerificationMessage(response));
         setCooldownLeft(startEmailVerificationCooldown());
      } catch (error) {
         setSendError(
            error.response?.data?.message ||
               error.response?.data?.error ||
               error.message ||
               'Не удалось отправить письмо подтверждения',
         );
      } finally {
         setIsSending(false);
      }
   }

   useEffect(() => {
      if (!open) {
         return undefined;
      }

      setCooldownLeft(getEmailVerificationCooldownLeft());

      const intervalId = window.setInterval(() => {
         setCooldownLeft(getEmailVerificationCooldownLeft());
      }, 1000);

      return () => {
         window.clearInterval(intervalId);
      };
   }, [open]);

   useEffect(() => {
      if (!open) {
         setSendError('');
         setSendSuccess('');
      }
   }, [open]);

   return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
         <DialogTitle>Подтверждение email</DialogTitle>

         <DialogContent>
            <Stack spacing={2}>
               <DialogContentText>
                  Ваш email ещё не подтверждён. Чтобы завершить настройку
                  аккаунта, отправьте письмо подтверждения и перейдите по ссылке
                  из письма.
               </DialogContentText>

               <Typography color='text.secondary' fontSize={14}>
                  Если письмо не пришло или срок действия ссылки истёк, можно
                  отправить письмо повторно. Повторная отправка доступна один
                  раз в минуту.
               </Typography>

               {sendError && <Alert severity='error'>{sendError}</Alert>}

               {sendSuccess && <Alert severity='success'>{sendSuccess}</Alert>}
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} disabled={isSending}>
               Закрыть
            </Button>

            <Button
               variant='contained'
               onClick={handleResendVerification}
               disabled={isSending || cooldownLeft > 0}
            >
               {isSending
                  ? 'Отправка...'
                  : cooldownLeft > 0
                    ? `Повторно через ${cooldownLeft} сек`
                    : 'Отправить письмо'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}
