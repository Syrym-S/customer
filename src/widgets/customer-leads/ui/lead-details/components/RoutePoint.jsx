import { Box, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const passedChipStyle = {
   borderColor: 'success.main',
   color: 'success.main',
   backgroundColor: 'rgba(46, 125, 50, 0.06)',
};

const notPassedChipStyle = {
   borderColor: 'grey.400',
   color: 'text.secondary',
   backgroundColor: 'grey.100',
};

const typeChipStyle = {
   borderColor: 'primary.main',
   color: 'primary.main',
   backgroundColor: 'rgba(33, 150, 243, 0.04)',
};

const routePointChipSx = {
   borderRadius: 999,
   fontWeight: 600,
   fontSize: '0.7rem',
   height: 22,
};

export function RoutePoint({ label, value, icon, isPassed, typeLabel }) {
   return (
      <Box
         sx={{
            flex: {
               xs: '1 1 auto',
               md: 1,
            },
            width: {
               xs: '100%',
               md: 'auto',
            },
            minWidth: {
               xs: 0,
               md: 220,
            },
            minHeight: {
               xs: 'auto',
               md: 86,
            },
            p: {
               xs: 1.25,
               sm: 1.5,
            },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
            boxSizing: 'border-box',
            overflow: 'hidden',
         }}
      >
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               gap: 1,
               mb: 0.5,
            }}
         >
            <Typography
               variant='caption'
               sx={{
                  display: 'block',
                  color: 'text.secondary',
               }}
            >
               {label}
            </Typography>

            <Chip
               label={isPassed ? 'Пройдена' : 'Не пройдена'}
               variant='outlined'
               size='small'
               sx={{
                  ...routePointChipSx,
                  ...(isPassed ? passedChipStyle : notPassedChipStyle),
               }}
            />
         </Box>

         <Box
            sx={{
               display: 'flex',
               alignItems: 'flex-start',
               gap: {
                  xs: 0,
                  sm: 1,
               },
               minWidth: 0,
            }}
         >
            <Box
               sx={{
                  color: 'primary.main',
                  display: {
                     xs: 'none',
                     sm: 'flex',
                  },
                  alignItems: 'center',
                  flexShrink: 0,
                  mt: 0.15,
                  '& svg': {
                     fontSize: 18,
                  },
               }}
            >
               {icon}
            </Box>

            <Typography
               title={value || 'Не указано'}
               sx={{
                  minWidth: 0,
                  fontSize: {
                     xs: 13,
                     sm: 14,
                  },
                  lineHeight: 1.35,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  display: '-webkit-box',
                  WebkitLineClamp: {
                     xs: 3,
                     sm: 2,
                     md: 3,
                  },
                  WebkitBoxOrient: 'vertical',
               }}
            >
               {value || 'Не указано'}
            </Typography>
         </Box>

         {typeLabel && (
            <Chip
               label={typeLabel}
               variant='outlined'
               size='small'
               sx={{
                  ...routePointChipSx,
                  ...typeChipStyle,
                  mt: 1,
               }}
            />
         )}
      </Box>
   );
}

RoutePoint.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.string,
   icon: PropTypes.node.isRequired,
   isPassed: PropTypes.bool,
   typeLabel: PropTypes.string,
};
