import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export function RoutePoint({ label, value, icon }) {
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
         <Typography
            variant='caption'
            sx={{
               display: 'block',
               color: 'text.secondary',
               mb: 0.5,
            }}
         >
            {label}
         </Typography>

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
};
