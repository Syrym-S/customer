import PropTypes from 'prop-types';
import { useState } from 'react';
import {
   Box,
   Button,
   IconButton,
   MenuItem,
   MenuList,
   Popover,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import { CUSTOM_STATS_PERIOD, STATS_PERIODS } from '../model/stats.config';
import { isCustomStatsPeriod } from '../model/stats.helpers';

const PERIOD_OPTIONS = [
   ...STATS_PERIODS,
   { value: CUSTOM_STATS_PERIOD, label: 'Выбрать период' },
];

export function DashboardStatsPeriodSelector({
   value,
   fallbackRange,
   label,
   tooltip,
   ariaLabel,
   onChange,
}) {
   const [anchorEl, setAnchorEl] = useState(null);
   const [pendingValue, setPendingValue] = useState('');
   const [pendingFrom, setPendingFrom] = useState('');
   const [pendingTo, setPendingTo] = useState('');

   const isPopoverOpen = Boolean(anchorEl);
   const isCustom = pendingValue === CUSTOM_STATS_PERIOD;
   const isRangeValid = Boolean(
      pendingFrom && pendingTo && pendingFrom <= pendingTo,
   );
   const canSave = !isCustom || isRangeValid;
   const tooltipTitle = isCustomStatsPeriod(value)
      ? tooltip || label
      : [label, tooltip].filter(Boolean).join(': ');

   function handleOpen(event) {
      const range = isCustomStatsPeriod(value) ? value : fallbackRange;

      setPendingValue(isCustomStatsPeriod(value) ? CUSTOM_STATS_PERIOD : value);
      setPendingFrom(range?.from ?? '');
      setPendingTo(range?.to ?? '');
      setAnchorEl(event.currentTarget);
   }

   function handleClose() {
      setAnchorEl(null);
   }

   function handleFromChange(event) {
      setPendingFrom(event.target.value);
   }

   function handleToChange(event) {
      setPendingTo(event.target.value);
   }

   function handleSave() {
      if (!canSave) {
         return;
      }

      onChange(isCustom ? { from: pendingFrom, to: pendingTo } : pendingValue);
      handleClose();
   }

   return (
      <>
         <Tooltip
            arrow
            disableTouchListener
            title={isPopoverOpen ? '' : tooltipTitle}
         >
            <IconButton
               size="small"
               color={isPopoverOpen ? 'primary' : 'default'}
               aria-label={`${ariaLabel}: ${label}`}
               aria-haspopup="dialog"
               aria-expanded={isPopoverOpen}
               onClick={handleOpen}
               sx={(theme) => ({
                  p: 0.25,
                  mr: -0.25,
                  flexShrink: 0,
                  '&.Mui-focusVisible': {
                     outline: `2px solid ${theme.palette.primary.main}`,
                     outlineOffset: 2,
                  },
               })}
            >
               <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
         </Tooltip>

         <Popover
            open={isPopoverOpen}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
               paper: {
                  sx: (theme) => ({
                     mt: 0.5,
                     width: 300,
                     maxWidth: 'calc(100vw - 32px)',
                     boxShadow: theme.customShadows.hover,
                  }),
               },
            }}
         >
            <Typography
               variant="subtitle2"
               sx={{ px: 2, pt: 1.5, pb: 0.5 }}
            >
               Выбор периода
            </Typography>

            <MenuList
               autoFocusItem
               variant="selectedMenu"
               aria-label={ariaLabel}
               sx={{ py: 0.5 }}
            >
               {PERIOD_OPTIONS.map((option) => (
                  <MenuItem
                     key={option.value}
                     selected={option.value === pendingValue}
                     onClick={() => setPendingValue(option.value)}
                  >
                     {option.label}
                  </MenuItem>
               ))}
            </MenuList>

            {isCustom && (
               <Box sx={{ display: 'flex', gap: 1, px: 1.5, pt: 1 }}>
                  <TextField
                     label="От"
                     type="date"
                     size="small"
                     value={pendingFrom}
                     onChange={handleFromChange}
                     fullWidth
                     slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { max: pendingTo || undefined },
                     }}
                  />

                  <TextField
                     label="До"
                     type="date"
                     size="small"
                     value={pendingTo}
                     onChange={handleToChange}
                     fullWidth
                     slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { min: pendingFrom || undefined },
                     }}
                  />
               </Box>
            )}

            <Box sx={{ p: 1.5 }}>
               <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSave}
                  disabled={!canSave}
               >
                  Сохранить
               </Button>
            </Box>
         </Popover>
      </>
   );
}

const statsRangeShape = PropTypes.shape({
   from: PropTypes.string,
   to: PropTypes.string,
});

DashboardStatsPeriodSelector.propTypes = {
   value: PropTypes.oneOfType([PropTypes.string, statsRangeShape]).isRequired,
   fallbackRange: statsRangeShape,
   label: PropTypes.string.isRequired,
   tooltip: PropTypes.string,
   ariaLabel: PropTypes.string.isRequired,
   onChange: PropTypes.func.isRequired,
};
