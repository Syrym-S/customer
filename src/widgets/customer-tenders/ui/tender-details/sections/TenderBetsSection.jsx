import { useState } from 'react';
import {
   Box,
   Button,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
   Typography,
} from '@mui/material';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PropTypes from 'prop-types';

import { TenderDetailsSection } from './TenderDetailsSection';
import { betPropType } from '../../../model/tenders.prop-types';

const INITIAL_VISIBLE_COUNT = 3;

function formatMoney(amount, currency = 'KZT') {
   if (amount === null || amount === undefined || amount === '') {
      return 'Не указано';
   }

   return `${Number(amount).toLocaleString('ru-RU')} ${currency}`;
}

export function TenderBetsSection({
   bets,
   tenderStatus,
   isActionLoading = false,
   onAcceptWinner,
}) {
   const [isExpanded, setIsExpanded] = useState(false);
   const [confirmBet, setConfirmBet] = useState(null);

   const betsWithIndex = bets.map((bet, index) => ({
      bet,
      index,
   }));

   const hasHiddenItems = bets.length > INITIAL_VISIBLE_COUNT;

   const visibleBets = isExpanded
      ? betsWithIndex
      : betsWithIndex.slice(0, INITIAL_VISIBLE_COUNT);

   const hiddenItemsCount = bets.length - INITIAL_VISIBLE_COUNT;

   function handleToggleExpanded() {
      setIsExpanded((prev) => !prev);
   }

   function handleOpenConfirm(bet, betIndex) {
      setConfirmBet({
         bet,
         betIndex,
      });
   }

   function handleCloseConfirm() {
      setConfirmBet(null);
   }

   async function handleConfirmWinner() {
      if (!confirmBet || isActionLoading) {
         return;
      }

      const isSuccess = await onAcceptWinner?.(
         confirmBet.betIndex,
         confirmBet.bet,
      );

      if (isSuccess !== false) {
         setConfirmBet(null);
      }
   }

   return (
      <>
         <TenderDetailsSection
            icon={<PaidOutlinedIcon />}
            title='Ставки'
            subtitle={`${bets.length}`}
         >
            {bets.length === 0 ? (
               <Typography color='text.secondary' sx={{ py: 2 }}>
                  Ставки пока не добавлены
               </Typography>
            ) : (
               <Stack
                  spacing={1.25}
                  sx={{
                     maxHeight: isExpanded && bets.length > 6 ? 420 : 'none',
                     overflowY:
                        isExpanded && bets.length > 6 ? 'auto' : 'visible',
                     pr: isExpanded && bets.length > 6 ? 0.5 : 0,
                  }}
               >
                  {visibleBets.map(({ bet, index }) => {
                     const isCancelledBet = bet.status === 'closed';
                     const canAcceptBet =
                        bet.status === 'new' &&
                        tenderStatus !== 'closed' &&
                        tenderStatus !== 'cancelled';

                     return (
                        <Box
                           key={`${bet.participant_id}-${index}`}
                           sx={{
                              p: 1.5,
                              border: '1px solid',
                              borderColor: isCancelledBet
                                 ? 'grey.300'
                                 : 'divider',
                              borderRadius: 2,
                              backgroundColor: isCancelledBet
                                 ? 'grey.100'
                                 : 'grey.50',
                              opacity: isCancelledBet ? 0.78 : 1,
                           }}
                        >
                           <Stack
                              direction='row'
                              justifyContent='space-between'
                              alignItems='flex-start'
                              spacing={1}
                              useFlexGap
                              sx={{ flexWrap: 'wrap' }}
                           >
                              <Box sx={{ minWidth: 0 }}>
                                 <Typography
                                    fontWeight={700}
                                    sx={{
                                       fontSize: 15,
                                       textDecoration: isCancelledBet
                                          ? 'line-through'
                                          : 'none',
                                       color: isCancelledBet
                                          ? 'text.secondary'
                                          : 'text.primary',
                                    }}
                                 >
                                    {formatMoney(bet.amount, bet.currency)}
                                 </Typography>

                                 <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 12, mt: 0.5 }}
                                 >
                                    {bet.participant_name ||
                                       bet.participant_id ||
                                       'Участник не указан'}
                                 </Typography>
                              </Box>

                              <Stack
                                 direction='row'
                                 spacing={1}
                                 alignItems='center'
                                 justifyContent='flex-end'
                                 sx={{
                                    ml: 'auto',
                                    flexWrap: 'wrap',
                                 }}
                              >
                                 {isCancelledBet && (
                                    <Chip
                                       label='Отменена'
                                       variant='outlined'
                                       size='small'
                                       sx={{
                                          height: 24,
                                          borderRadius: 999,
                                          fontWeight: 600,
                                          borderColor: 'grey.400',
                                          color: 'text.secondary',
                                          backgroundColor: 'grey.50',
                                       }}
                                    />
                                 )}
                                 {canAcceptBet && (
                                    <Button
                                       variant='contained'
                                       size='small'
                                       disabled={isActionLoading}
                                       onClick={() =>
                                          handleOpenConfirm(bet, index)
                                       }
                                       sx={{
                                          height: 24,
                                          px: 1,
                                          py: 0,
                                          borderRadius: 999,
                                          fontSize: 12,
                                          fontWeight: 600,
                                          lineHeight: 1,
                                          textTransform: 'none',
                                          whiteSpace: 'nowrap',
                                       }}
                                    >
                                       Выбрать победителя
                                    </Button>
                                 )}
                              </Stack>
                           </Stack>

                           {bet.comment && (
                              <Typography
                                 sx={{
                                    mt: 1,
                                    fontSize: 13,
                                    lineHeight: 1.35,
                                    color: 'text.secondary',
                                 }}
                              >
                                 {bet.comment}
                              </Typography>
                           )}
                        </Box>
                     );
                  })}

                  {hasHiddenItems && (
                     <Button
                        size='small'
                        onClick={handleToggleExpanded}
                        sx={{
                           alignSelf: 'flex-start',
                           textTransform: 'none',
                        }}
                     >
                        {isExpanded
                           ? 'Скрыть'
                           : `Показать все ставки (+${hiddenItemsCount})`}
                     </Button>
                  )}
               </Stack>
            )}
         </TenderDetailsSection>

         <Dialog
            open={Boolean(confirmBet)}
            onClose={handleCloseConfirm}
            fullWidth
            maxWidth='sm'
         >
            <DialogTitle>Выбрать победителя</DialogTitle>

            <DialogContent>
               <Typography sx={{ mb: 2 }}>
                  Вы уверены, что хотите выбрать эту ставку победителем?
                  <br />
                  Это действие нельзя отменить.
               </Typography>

               <Box
                  sx={{
                     p: 2,
                     border: '1px solid',
                     borderColor: 'divider',
                     borderRadius: 2,
                     backgroundColor: 'grey.50',
                  }}
               >
                  <Typography color='text.secondary' sx={{ fontSize: 12 }}>
                     Компания
                  </Typography>

                  <Typography fontWeight={600} sx={{ mb: 1 }}>
                     {confirmBet?.bet.participant_name ||
                        confirmBet?.bet.participant_id ||
                        'Участник не указан'}
                  </Typography>

                  <Typography color='text.secondary' sx={{ fontSize: 12 }}>
                     Сумма ставки
                  </Typography>

                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                     {formatMoney(
                        confirmBet?.bet.amount,
                        confirmBet?.bet.currency,
                     )}
                  </Typography>

                  {confirmBet?.bet.comment && (
                     <>
                        <Typography
                           color='text.secondary'
                           sx={{ fontSize: 12 }}
                        >
                           Комментарий
                        </Typography>

                        <Typography sx={{ fontSize: 14 }}>
                           {confirmBet.bet.comment}
                        </Typography>
                     </>
                  )}
               </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseConfirm}>Отмена</Button>

               <Button
                  variant='contained'
                  color='success'
                  onClick={handleConfirmWinner}
                  disabled={isActionLoading}
               >
                  {isActionLoading ? 'Выбор...' : 'Подтвердить выбор'}
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
}

TenderBetsSection.propTypes = {
   bets: PropTypes.arrayOf(betPropType).isRequired,
   onAcceptWinner: PropTypes.func,
   tenderStatus: PropTypes.string,
   isActionLoading: PropTypes.bool,
};
