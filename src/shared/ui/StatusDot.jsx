import PropTypes from 'prop-types';
import { Box } from '@mui/material';

// Minimal status indicator: a small colored dot + plain label, no chip
// container/border/background. The dot is the sole color-carrier — `color`
// is whatever theme color path (e.g. 'success.main') or CSS color the
// caller's own status-color mapping already resolves to; this component
// never decides colors itself. The label inherits the surrounding text
// color/weight by default (per-domain call sites don't tint it), matching
// how a status reads inline in a dense table row or a card.
export function StatusDot({ label, color, size = 7, sx, labelSx }) {
   return (
      <Box
         sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.875,
            minWidth: 0,
            ...sx,
         }}
      >
         <Box
            sx={{
               width: size,
               height: size,
               borderRadius: '50%',
               backgroundColor: color,
               flexShrink: 0,
            }}
         />

         <Box
            component="span"
            sx={{
               fontSize: 13,
               fontWeight: 500,
               color: 'inherit',
               lineHeight: 1.3,
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               whiteSpace: 'nowrap',
               ...labelSx,
            }}
         >
            {label}
         </Box>
      </Box>
   );
}

StatusDot.propTypes = {
   label: PropTypes.node.isRequired,
   color: PropTypes.string.isRequired,
   size: PropTypes.number,
   sx: PropTypes.object,
   labelSx: PropTypes.object,
};
