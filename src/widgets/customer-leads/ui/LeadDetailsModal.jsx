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
import PropTypes from 'prop-types';

import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { useLeadsContext } from '../model/useLeadsContext';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { CustomerMapView } from '../../customer-map/ui/CustomerMapView';

export function LeadDetailsModal() {
   const map = useCustomerMap();
   const { openLead, setOpenLead } = useLeadsContext();

   function handleClose() {
      setOpenLead(null);
   }

   if (!openLead) {
      return null;
   }

   return (
      <Dialog
         open={Boolean(openLead)}
         onClose={handleClose}
         fullWidth
         maxWidth='md'
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 4,
               },
            },
         }}
      >
         <DialogTitle
            sx={{
               px: 3,
               pt: 3,
               pb: 1.5,
            }}
         >
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  flexWrap: 'wrap',
               }}
            >
               <Box>
                  <Typography
                     sx={{
                        fontSize: {
                           xs: '18px',
                           sm: '20px',
                        },
                        fontWeight: 600,
                        lineHeight: 1.3,
                     }}
                  >
                     Информация о лиде
                  </Typography>

                  <Typography
                     variant='body2'
                     color='text.secondary'
                     sx={{ mt: 0.5 }}
                  >
                     Подробные данные по заявке
                  </Typography>
               </Box>

               <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  <Chip
                     label={`Лид #${openLead.num || '—'}`}
                     color='primary'
                     variant='outlined'
                     size='small'
                     sx={{
                        borderRadius: 999,
                        fontWeight: 600,
                        backgroundColor: 'rgba(33, 150, 243, 0.04)',
                     }}
                  />

                  <Chip
                     label={openLead.status}
                     size='small'
                     sx={{
                        borderRadius: 999,
                        fontWeight: 500,
                        backgroundColor: 'grey.100',
                        color: 'text.secondary',
                     }}
                  />
               </Stack>
            </Box>
         </DialogTitle>

         <DialogContent sx={{ px: 3 }}>
            <Box
               sx={{
                  height: {
                     xs: 220,
                     sm: 280,
                  },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 3,
                  mt: 1,
               }}
            >
               <CustomerMapView
                  center={map.center}
                  zoom={map.zoom}
                  markers={map.markers}
                  routePoints={map.routePoints}
                  handleMarkerClick={map.handleMarkerClick}
               />
            </Box>

            <Stack spacing={2}>
               <DetailSection icon={<BusinessOutlinedIcon />} title='Заказчик'>
                  <InfoBadge
                     label='Название'
                     value={openLead.customer}
                     fullWidth
                  />
               </DetailSection>

               <DetailSection icon={<RouteOutlinedIcon />} title='Маршрут'>
                  <Box
                     sx={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 1.5,
                        flexWrap: {
                           xs: 'wrap',
                           sm: 'nowrap',
                        },
                     }}
                  >
                     <RoutePoint
                        label='Откуда'
                        value={openLead.from_location.trim()}
                        icon={<TripOriginIcon />}
                     />

                     <Box
                        sx={{
                           display: {
                              xs: 'none',
                              sm: 'flex',
                           },
                           alignItems: 'center',
                           justifyContent: 'center',
                           px: 0.5,
                        }}
                     >
                        <ArrowRightAltRoundedIcon
                           sx={{
                              color: 'text.secondary',
                              fontSize: 28,
                           }}
                        />
                     </Box>

                     <RoutePoint
                        label='Куда'
                        value={openLead.to_location.trim()}
                        icon={<LocationOnOutlinedIcon />}
                     />
                  </Box>
               </DetailSection>

               <DetailSection icon={<LocalShippingOutlinedIcon />} title='Груз'>
                  <Box
                     sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                           xs: '1fr 1fr',
                           sm: 'repeat(2, 1fr)',
                           md: 'repeat(4, 1fr)',
                        },
                        gap: 1,
                     }}
                  >
                     <InfoBadge label='Тип' value={openLead.cargo.type} />

                     <InfoBadge
                        label='Вес'
                        value={`${openLead.cargo.weight_kg} кг`}
                     />

                     <InfoBadge
                        label='Цена'
                        value={`${openLead.summ} ${openLead.currency}`}
                        accent
                     />

                     <InfoBadge label='НДС' value={openLead.vat} />
                  </Box>

                  <InfoBadge
                     label='Описание'
                     value={openLead.cargo.description}
                     fullWidth
                     sx={{ mt: 1 }}
                  />
               </DetailSection>

               <DetailSection
                  icon={<PersonOutlineOutlinedIcon />}
                  title='Водитель'
               >
                  <InfoBadge label='ФИО' value={openLead.driver} fullWidth />
               </DetailSection>
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={handleClose}>Закрыть</Button>
         </DialogActions>
      </Dialog>
   );
}

function DetailSection({ icon, title, children }) {
   return (
      <Box
         sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            backgroundColor: 'background.paper',
         }}
      >
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               gap: 1,
               mb: 1.5,
            }}
         >
            <Box
               sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& svg': {
                     fontSize: 20,
                  },
               }}
            >
               {icon}
            </Box>

            <Typography
               sx={{
                  fontSize: '15px',
                  fontWeight: 600,
               }}
            >
               {title}
            </Typography>
         </Box>

         {children}
      </Box>
   );
}

function RoutePoint({ label, value, icon }) {
   return (
      <Box
         sx={{
            flex: 1,
            minWidth: 220,
            minHeight: 86,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
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

         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
               sx={{
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  '& svg': {
                     fontSize: 18,
                  },
               }}
            >
               {icon}
            </Box>

            <Typography
               sx={{
                  fontSize: '14px',
                  lineHeight: 1.35,
                  fontWeight: 500,
               }}
            >
               {value || 'Не указано'}
            </Typography>
         </Box>
      </Box>
   );
}

function InfoBadge({
   label,
   value,
   accent = false,
   fullWidth = false,
   sx = {},
}) {
   return (
      <Box
         sx={{
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: accent ? 'primary.light' : 'divider',
            borderRadius: 2,
            backgroundColor: accent ? 'rgba(33, 150, 243, 0.06)' : 'grey.50',
            minWidth: 0,
            width: fullWidth ? '100%' : 'auto',
            ...sx,
         }}
      >
         <Typography
            sx={{
               fontSize: 11,
               lineHeight: 1.2,
               color: 'text.secondary',
               mb: 0.25,
            }}
         >
            {label}
         </Typography>

         <Typography
            sx={{
               fontSize: 14,
               lineHeight: 1.35,
               color: accent ? 'primary.main' : 'text.primary',
               fontWeight: accent ? 600 : 500,
            }}
         >
            {value || 'Не указано'}
         </Typography>
      </Box>
   );
}

DetailSection.propTypes = {
   icon: PropTypes.node.isRequired,
   title: PropTypes.string.isRequired,
   children: PropTypes.node.isRequired,
};

RoutePoint.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.string,
   icon: PropTypes.node.isRequired,
};

InfoBadge.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   accent: PropTypes.bool,
   fullWidth: PropTypes.bool,
   sx: PropTypes.object,
};
