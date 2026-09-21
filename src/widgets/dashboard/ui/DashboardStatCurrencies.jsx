import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Chip, Popover, Tooltip, Typography } from '@mui/material';

import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

const VISIBLE_CURRENCIES = 2;
const LINE_HEIGHT = 20;

function formatCurrencyLine({ sum, currency }) {
   return `${formatAmount(sum)} ${currency}`;
}

export function DashboardStatCurrencies({ currencies }) {
   const [anchorEl, setAnchorEl] = useState(null);

   if (!currencies.length) {
      return (
         <Typography
            color="text.disabled"
            sx={{ fontSize: 14, lineHeight: `${LINE_HEIGHT}px` }}
         >
            Нет данных
         </Typography>
      );
   }

   const visible = currencies.slice(0, VISIBLE_CURRENCIES);
   const rest = currencies.slice(VISIBLE_CURRENCIES);
   const isPopoverOpen = Boolean(anchorEl);

   function handleOpen(event) {
      setAnchorEl(event.currentTarget);
   }

   function handleClose() {
      setAnchorEl(null);
   }

   return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
         {visible.map((item, index) => (
            <Box
               key={item.currency}
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  height: LINE_HEIGHT,
                  minWidth: 0,
               }}
            >
               <Typography
                  variant="dataEmphasis"
                  noWrap
                  sx={{ lineHeight: `${LINE_HEIGHT}px`, minWidth: 0 }}
               >
                  {formatCurrencyLine(item)}
               </Typography>

               {index === visible.length - 1 && rest.length > 0 && (
                  <Tooltip
                     arrow
                     disableTouchListener
                     disableFocusListener
                     title={
                        isPopoverOpen ? (
                           ''
                        ) : (
                           <Box
                              sx={{ display: 'flex', flexDirection: 'column' }}
                           >
                              {rest.map((restItem) => (
                                 <span key={restItem.currency}>
                                    {formatCurrencyLine(restItem)}
                                 </span>
                              ))}
                           </Box>
                        )
                     }
                  >
                     <Chip
                        size="small"
                        role="button"
                        clickable
                        label={`+${rest.length}`}
                        aria-label="Показать все валюты"
                        aria-haspopup="dialog"
                        aria-expanded={isPopoverOpen}
                        onClick={handleOpen}
                        sx={(theme) => ({
                           height: LINE_HEIGHT,
                           fontSize: 12,
                           fontWeight: 600,
                           flexShrink: 0,
                           '&.Mui-focusVisible': {
                              outline: `2px solid ${theme.palette.primary.main}`,
                              outlineOffset: 2,
                           },
                        })}
                     />
                  </Tooltip>
               )}
            </Box>
         ))}

         <Popover
            open={isPopoverOpen}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
               paper: {
                  sx: (theme) => ({
                     mt: 0.5,
                     minWidth: 180,
                     maxWidth: 'calc(100vw - 32px)',
                     boxShadow: theme.customShadows.hover,
                  }),
               },
            }}
         >
            <Box
               role="list"
               sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  p: 1.5,
               }}
            >
               {currencies.map((item) => (
                  <Typography
                     key={item.currency}
                     role="listitem"
                     variant="dataEmphasis"
                     sx={{ lineHeight: `${LINE_HEIGHT}px` }}
                  >
                     {formatCurrencyLine(item)}
                  </Typography>
               ))}
            </Box>
         </Popover>
      </Box>
   );
}

DashboardStatCurrencies.propTypes = {
   currencies: PropTypes.arrayOf(
      PropTypes.shape({
         currency: PropTypes.string.isRequired,
         sum: PropTypes.number.isRequired,
      }),
   ).isRequired,
};
