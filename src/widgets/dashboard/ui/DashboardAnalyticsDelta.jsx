import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

const DELTA_COLOR = {
   up: 'success.main',
   down: 'error.main',
   flat: 'text.disabled',
};

export function DashboardAnalyticsDelta({ delta }) {
   if (!delta || delta.percent === null) {
      return null;
   }

   const Icon =
      delta.direction === 'down' ? ArrowDownwardRoundedIcon : ArrowUpwardRoundedIcon;
   const roundedPercent = Math.round(Math.abs(delta.percent) * 10) / 10;

   return (
      <Box
         sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            color: DELTA_COLOR[delta.direction],
         }}
      >
         {delta.direction !== 'flat' && <Icon sx={{ fontSize: 14 }} />}

         <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>
            {roundedPercent}%
         </Typography>
      </Box>
   );
}

DashboardAnalyticsDelta.propTypes = {
   delta: PropTypes.shape({
      percent: PropTypes.number,
      direction: PropTypes.oneOf(['up', 'down', 'flat']),
   }),
};
