import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { alpha, Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';

function RoutePointLabel({ icon, label, title, fontWeight }) {
   return (
      <Stack
         direction="row"
         spacing={0.75}
         sx={{
            minWidth: 0,
            maxWidth: '100%',
            alignItems: 'center',
         }}
      >
         {icon}

         <Tooltip title={title || ''}>
            <Typography
               sx={{
                  fontSize: 14,
                  fontWeight,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
               }}
            >
               {label}
            </Typography>
         </Tooltip>
      </Stack>
   );
}

export function CardRouteLine({
   fromLabel,
   fromTitle,
   toLabel,
   toTitle,
   waypointsCount = 0,
   fontWeight = 500,
   sx,
}) {
   const { t } = useTranslation();
   const theme = useTheme();

   const isRtl = theme.direction === 'rtl';

   const arrowSx = {
      color: 'text.secondary',
      fontSize: 20,
      flexShrink: 0,
      display: { xs: 'none', sm: 'block' },
      transform: isRtl ? 'scaleX(-1)' : 'none',
   };

   return (
      <Stack
         direction={{ xs: 'column', sm: 'row' }}
         spacing={0.75}
         sx={{
            minWidth: 0,
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexWrap: 'nowrap',
            overflow: 'hidden',
            ...sx,
         }}
      >
         <RoutePointLabel
            icon={
               <TripOriginIcon
                  sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }}
               />
            }
            label={fromLabel}
            title={fromTitle}
            fontWeight={fontWeight}
         />

         <ArrowRightAltRoundedIcon sx={arrowSx} />

         {waypointsCount > 0 && (
            <>
               <Box
                  sx={(currentTheme) => ({
                     flexShrink: 0,
                     display: 'flex',
                     alignItems: 'center',
                     px: 0.75,
                     py: 0.25,
                     borderRadius: `${currentTheme.radius.sm}px`,
                     backgroundColor: alpha(
                        currentTheme.palette.primary.main,
                        0.08,
                     ),
                  })}
               >
                  <Typography
                     variant="caption"
                     color="text.secondary"
                     sx={{
                        fontSize: 11,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                     }}
                  >
                     +{t('common.waypointCount', { count: waypointsCount })}
                  </Typography>
               </Box>

               <ArrowRightAltRoundedIcon sx={arrowSx} />
            </>
         )}

         <RoutePointLabel
            icon={
               <LocationOnOutlinedIcon
                  sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }}
               />
            }
            label={toLabel}
            title={toTitle}
            fontWeight={fontWeight}
         />
      </Stack>
   );
}

RoutePointLabel.propTypes = {
   icon: PropTypes.node.isRequired,
   label: PropTypes.node,
   title: PropTypes.string,
   fontWeight: PropTypes.number,
};

CardRouteLine.propTypes = {
   fromLabel: PropTypes.node,
   fromTitle: PropTypes.string,
   toLabel: PropTypes.node,
   toTitle: PropTypes.string,
   waypointsCount: PropTypes.number,
   fontWeight: PropTypes.number,
   sx: PropTypes.object,
};
