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

const dateChipStyle = {
   borderColor: 'grey.300',
   color: 'text.secondary',
   backgroundColor: 'transparent',
};

// rgba values matched to leadStatusStyles in lead.helpers.js so this chip's
// colors stay consistent with the lead status chips used elsewhere.
const typeChipStyles = {
   warning: {
      borderColor: 'warning.main',
      color: 'warning.main',
      backgroundColor: 'rgba(237, 108, 2, 0.06)',
   },
   secondary: {
      borderColor: 'secondary.main',
      color: 'secondary.main',
      backgroundColor: 'rgba(156, 39, 176, 0.06)',
   },
   info: {
      borderColor: 'info.main',
      color: 'info.main',
      backgroundColor: 'rgba(2, 136, 209, 0.06)',
   },
   primary: {
      borderColor: 'primary.main',
      color: 'primary.main',
      backgroundColor: 'rgba(33, 150, 243, 0.04)',
   },
};

const routePointChipSx = {
   borderRadius: 999,
   fontWeight: 600,
   fontSize: '0.7rem',
   height: 22,
};

export function RoutePoint({
   label,
   value,
   icon,
   isPassed,
   typeLabel,
   typeColor,
   date,
}) {
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
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  minWidth: 0,
               }}
            >
               <Typography
                  variant='caption'
                  sx={{
                     display: 'block',
                     color: 'text.secondary',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {label}
               </Typography>

               {typeLabel && (
                  <Chip
                     label={typeLabel}
                     variant='outlined'
                     size='small'
                     sx={{
                        ...routePointChipSx,
                        ...(typeChipStyles[typeColor] || typeChipStyles.primary),
                     }}
                  />
               )}
            </Box>

            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  flexShrink: 0,
               }}
            >
               <Chip
                  label={date || '—'}
                  variant='outlined'
                  size='small'
                  sx={{
                     ...routePointChipSx,
                     ...dateChipStyle,
                  }}
               />

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
      </Box>
   );
}

RoutePoint.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.string,
   icon: PropTypes.node.isRequired,
   isPassed: PropTypes.bool,
   typeLabel: PropTypes.string,
   typeColor: PropTypes.oneOf(['warning', 'secondary', 'info', 'primary']),
   date: PropTypes.string,
};
