import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
   Alert,
   Box,
   Chip,
   DialogContent,
   DialogTitle,
   Stack,
   Typography,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';

import { AppDialog } from '../../../shared/ui/AppDialog';
import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import { DetailsSkeleton } from '../../../shared/ui/skeletons/DetailsSkeleton';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { LeadDetailsMap } from '../../customer-leads/ui/lead-details/LeadDetailsMap';
import { useLeadDetailsRoute } from '../../customer-leads/ui/lead-details/hooks/useLeadDetailsRoute';
import { DetailSection } from '../../customer-leads/ui/lead-details/components/DetailSection';
import { InfoBadge } from '../../customer-leads/ui/lead-details/components/InfoBadge';
import { RoutePoint } from '../../customer-leads/ui/lead-details/components/RoutePoint';
import {
   getWaypointTypeChipColor,
   getWaypointTypeLabel,
} from '../../customer-leads/model/lead-route.helpers';
import { fetchCustomerProfile } from '../../../features/profile-edit/profile.api';

import { fetchAdvertisement } from '../api/advertisements.repository';
import { useAdvertisementsContext } from '../model/useAdvertisementsContext';
import { AdvertisementDetailsActions } from './AdvertisementDetailsActions';
import {
   formatAdvertisementAmount,
   formatAdvertisementDate,
   formatAdvertisementDateTime,
   getAdvertisementCargoDimensionsLabel,
   getAdvertisementGracePeriodLabel,
   getAdvertisementPriceLabel,
   getAdvertisementStatusLabel,
   getAdvertisementVatLabel,
   getAdvertisementVolumeLabel,
   getAdvertisementWeightLabel,
   getCurrentAdvertisementDateTime,
   isAdvertisementClosed,
} from '../model/advertisement.helpers';

const chipSx = {
   borderRadius: 999,
   fontWeight: 600,
};

const detailsGridSx = {
   display: 'grid',
   gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
   },
   gap: 1,
};

function getPointScheduleLabel(pointSchedules, pointIndex) {
   const schedule = pointSchedules.find(
      (item) => item.pointIndex === pointIndex,
   );

   if (!schedule) {
      return '';
   }

   const startLabel = formatAdvertisementDate(schedule.startAt);
   const endLabel = formatAdvertisementDate(schedule.endAt);

   if (startLabel && endLabel && startLabel !== endLabel) {
      return `${startLabel} – ${endLabel}`;
   }

   return startLabel || endLabel || '';
}

export function AdvertisementDetailsModal({ advertisement, open, onClose }) {
   const { t } = useTranslation();

   const [details, setDetails] = useState(advertisement);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');
   const [profileContacts, setProfileContacts] = useState(null);
   const [actionError, setActionError] = useState('');
   const [isActionLoading, setIsActionLoading] = useState(false);

   const { closeAdvertisement, deleteAdvertisement } =
      useAdvertisementsContext();

   const map = useCustomerMap();

   const advertisementId = advertisement?.id;
   const lead = details?.lead || {};

   const rawLeadRef = useRef(null);

   rawLeadRef.current = lead.raw || null;

   const routeGeometryKey = useMemo(() => {
      if (!lead.raw || !lead.id) {
         return '';
      }

      return JSON.stringify([
         lead.id,
         lead.raw.route ?? null,
         lead.raw.from_location ?? null,
         lead.raw.to_location ?? null,
         lead.raw.waypoints ?? [],
      ]);
   }, [lead.raw, lead.id]);

   const routeLead = useMemo(() => {
      const raw = rawLeadRef.current;

      if (!routeGeometryKey || !raw) {
         return null;
      }

      return { ...raw, id: lead.id, raw };
   }, [routeGeometryKey, lead.id]);

   const { route, routePoints, isRouteLoading } = useLeadDetailsRoute(routeLead);

   useEffect(() => {
      setDetails(advertisement);
      setError('');
      setActionError('');
   }, [advertisement]);

   useEffect(() => {
      if (!open || !advertisementId) {
         return undefined;
      }

      let isCancelled = false;

      async function loadDetails() {
         try {
            setIsLoading(true);
            setError('');

            const loaded = await fetchAdvertisement(advertisementId);

            if (!isCancelled && loaded) {
               setDetails(loaded);
            }
         } catch (requestError) {
            if (!isCancelled) {
               setError(
                  requestError.message ||
                     t('advertisements.details.loadFailed'),
               );
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadDetails();

      return () => {
         isCancelled = true;
      };
   }, [open, advertisementId, t]);

   useEffect(() => {
      if (!open) {
         return undefined;
      }

      let isCancelled = false;

      async function loadProfileContacts() {
         try {
            const profile = await fetchCustomerProfile();

            if (isCancelled) {
               return;
            }

            setProfileContacts({
               phone: profile?.personPhone || profile?.phone || '',
               email: profile?.personEmail || profile?.email || '',
            });
         } catch {
            if (!isCancelled) {
               setProfileContacts(null);
            }
         }
      }

      loadProfileContacts();

      return () => {
         isCancelled = true;
      };
   }, [open]);

   async function handleCloseAdvertisement() {
      if (!advertisementId) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         const closed = await closeAdvertisement(advertisementId);

         setDetails((previousDetails) => {
            const nextDetails = closed || previousDetails;

            if (!nextDetails) {
               return previousDetails;
            }

            return nextDetails.closedAt
               ? nextDetails
               : {
                    ...nextDetails,
                    closedAt: getCurrentAdvertisementDateTime(),
                 };
         });
      } catch (requestError) {
         setActionError(
            requestError.response?.data?.message ||
               requestError.message ||
               t('advertisements.manage.closeFailed'),
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleDeleteAdvertisement() {
      if (!advertisementId) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await deleteAdvertisement(advertisementId);

         onClose();
      } catch (requestError) {
         setActionError(
            requestError.response?.data?.message ||
               requestError.message ||
               t('advertisements.manage.deleteFailed'),
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   if (!advertisement) {
      return null;
   }

   const cargo = lead.cargoDetails;
   const pointSchedules = Array.isArray(lead.pointSchedules)
      ? lead.pointSchedules
      : [];
   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];

   const isClosed = isAdvertisementClosed(details);
   const isInitialLoading = isLoading && !lead.id;

   const hasRoutePoints = routePoints.length >= 2;
   const isMapLoading =
      Boolean(routeLead?.id) && !hasRoutePoints && (isLoading || isRouteLoading);

   const cargoName = cargo?.name || lead.cargo;
   const weightLabel = getAdvertisementWeightLabel(
      cargo?.weightKg ?? lead.weightKg,
   );
   const dimensionsLabel = getAdvertisementCargoDimensionsLabel(cargo);
   const volumeLabel = getAdvertisementVolumeLabel(cargo?.volume);
   const cargoPriceLabel = formatAdvertisementAmount(
      cargo?.cargoPrice,
      lead.currency,
   );

   const hasCargoSection = Boolean(
      cargoName ||
         weightLabel ||
         dimensionsLabel ||
         volumeLabel ||
         cargoPriceLabel ||
         cargo?.type ||
         cargo?.tnved ||
         cargo?.description,
   );

   const hasTransportSection = Boolean(
      lead.typeTransport ||
         lead.typeLoading ||
         lead.typePackaging ||
         lead.typeComposition,
   );

   const contactPhone = lead.contacts?.phone || profileContacts?.phone || '';
   const contactEmail = lead.contacts?.email || profileContacts?.email || '';
   const hasContactsSection = Boolean(contactPhone || contactEmail);

   return (
      <AppDialog
         open={open}
         onClose={onClose}
         fullWidth
         maxWidth="md"
         slotProps={{
            paper: {
               sx: {
                  borderRadius: 4,
                  position: 'relative',
                  m: { xs: 1, sm: 4 },
                  width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
                  maxHeight: {
                     xs: 'calc(100% - 16px)',
                     sm: 'calc(100% - 64px)',
                  },
               },
            },
         }}
      >
         <DialogCloseButton onClick={onClose} />

         <DialogTitle sx={{ pl: 3, pr: 7, pt: 3, pb: 1.5 }}>
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
                        fontSize: { xs: '18px', sm: '20px' },
                        fontWeight: 600,
                        lineHeight: 1.3,
                     }}
                  >
                     {t('advertisements.details.title')}
                  </Typography>

                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ mt: 0.5 }}
                  >
                     {t('advertisements.details.subtitle')}
                  </Typography>
               </Box>

               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {lead.num && (
                     <Chip
                        label={t('advertisements.details.leadNumber', {
                           num: lead.num,
                        })}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                           ...chipSx,
                           backgroundColor: 'rgba(33, 150, 243, 0.04)',
                        }}
                     />
                  )}

                  <Chip
                     label={getAdvertisementStatusLabel(details)}
                     color={isClosed ? 'default' : 'success'}
                     variant="outlined"
                     size="small"
                     sx={{
                        ...chipSx,
                        backgroundColor: isClosed
                           ? 'grey.100'
                           : 'rgba(46, 125, 50, 0.06)',
                     }}
                  />
               </Stack>
            </Box>
         </DialogTitle>

         <DialogContent sx={{ px: 3 }}>
            {error && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
               </Alert>
            )}

            {actionError && (
               <Alert severity="error" sx={{ mb: 2 }}>
                  {actionError}
               </Alert>
            )}

            {isInitialLoading ? (
               <DetailsSkeleton sections={4} />
            ) : (
               <Stack spacing={2}>
                  {routeLead && (
                     <LeadDetailsMap
                        map={map}
                        lead={routeLead}
                        route={route}
                        routePoints={routePoints}
                        isRouteLoading={isMapLoading}
                     />
                  )}

                  <DetailSection
                     icon={<CampaignOutlinedIcon />}
                     title={t('advertisements.titleSingular')}
                  >
                     <Box sx={detailsGridSx}>
                        <InfoBadge
                           label={t('advertisements.fields.createdAt')}
                           value={formatAdvertisementDateTime(
                              details?.createdAt,
                           )}
                        />

                        <InfoBadge
                           label={t('advertisements.fields.expiredAt')}
                           value={formatAdvertisementDateTime(
                              details?.expiredAt,
                           )}
                           accent={!isClosed}
                        />

                        {isClosed && (
                           <InfoBadge
                              label={t('advertisements.fields.closedAt')}
                              value={formatAdvertisementDateTime(
                                 details?.closedAt,
                              )}
                           />
                        )}
                     </Box>
                  </DetailSection>

                  <DetailSection
                     icon={<ReceiptLongOutlinedIcon />}
                     title={t('advertisements.details.leadSection')}
                  >
                     <Box sx={detailsGridSx}>
                        <InfoBadge
                           label={t('common.fields.price')}
                           value={getAdvertisementPriceLabel(lead)}
                           accent
                        />

                        <InfoBadge
                           label={t('advertisements.details.transportationPrice')}
                           value={formatAdvertisementAmount(
                              lead.transportationPrice,
                              lead.currency,
                           )}
                        />

                        <InfoBadge
                           label={t('common.fields.vat')}
                           value={getAdvertisementVatLabel(lead)}
                        />

                        <InfoBadge
                           label={t('common.fields.gracePeriod')}
                           value={getAdvertisementGracePeriodLabel(
                              lead.gracePeriodDays,
                           )}
                        />

                        <InfoBadge
                           label={t('common.fields.createdAt')}
                           value={formatAdvertisementDateTime(lead.createdAt)}
                        />
                     </Box>
                  </DetailSection>

                  <DetailSection
                     icon={<RouteOutlinedIcon />}
                     title={t('common.fields.route')}
                  >
                     <Stack spacing={1.25}>
                        <RoutePoint
                           label={t('common.fields.origin')}
                           value={lead.fromLocationFull || lead.fromLocation}
                           icon={<TripOriginIcon />}
                           date={getPointScheduleLabel(pointSchedules, 0)}
                        />

                        {waypoints.map((waypoint, index) => (
                           <RoutePoint
                              key={`${waypoint.label}-${index}`}
                              label={t('route.waypointHash', {
                                 index: index + 1,
                              })}
                              value={waypoint.label}
                              icon={<LocationOnOutlinedIcon />}
                              typeLabel={getWaypointTypeLabel(waypoint.type)}
                              typeColor={getWaypointTypeChipColor(
                                 waypoint.type,
                              )}
                              date={getPointScheduleLabel(
                                 pointSchedules,
                                 index + 1,
                              )}
                           />
                        ))}

                        <RoutePoint
                           label={t('common.fields.destination')}
                           value={lead.toLocationFull || lead.toLocation}
                           icon={<LocationOnOutlinedIcon />}
                           date={getPointScheduleLabel(
                              pointSchedules,
                              waypoints.length + 1,
                           )}
                        />
                     </Stack>
                  </DetailSection>

                  {hasCargoSection && (
                     <DetailSection
                        icon={<Inventory2OutlinedIcon />}
                        title={t('common.fields.cargo')}
                     >
                        <Stack spacing={1}>
                           <Box sx={detailsGridSx}>
                              <InfoBadge
                                 label={t('common.fields.cargoName')}
                                 value={cargoName}
                              />

                              <InfoBadge
                                 label={t('common.fields.cargoType')}
                                 value={cargo?.type}
                              />

                              <InfoBadge
                                 label={t('common.fields.weight')}
                                 value={weightLabel}
                              />

                              {dimensionsLabel && (
                                 <InfoBadge
                                    label={t('common.fields.dimensions')}
                                    value={dimensionsLabel}
                                 />
                              )}

                              {volumeLabel && (
                                 <InfoBadge
                                    label={t('common.fields.volume')}
                                    value={volumeLabel}
                                 />
                              )}

                              {cargoPriceLabel && (
                                 <InfoBadge
                                    label={t('common.fields.cargoPrice')}
                                    value={cargoPriceLabel}
                                 />
                              )}

                              {cargo?.tnved && (
                                 <InfoBadge
                                    label={t('common.fields.tnvedCode')}
                                    value={cargo.tnved}
                                 />
                              )}
                           </Box>

                           {cargo?.description && (
                              <InfoBadge
                                 label={t('common.fields.description')}
                                 value={cargo.description}
                                 fullWidth
                              />
                           )}
                        </Stack>
                     </DetailSection>
                  )}

                  {hasTransportSection && (
                     <DetailSection
                        icon={<LocalShippingOutlinedIcon />}
                        title={t('common.fields.transportParams')}
                     >
                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                 xs: '1fr',
                                 sm: 'repeat(2, 1fr)',
                                 md: 'repeat(4, 1fr)',
                              },
                              gap: 1,
                           }}
                        >
                           {lead.typeLoading && (
                              <InfoBadge
                                 label={t('common.fields.loadingType')}
                                 value={lead.typeLoading}
                              />
                           )}

                           {lead.typePackaging && (
                              <InfoBadge
                                 label={t('common.fields.packagingType')}
                                 value={lead.typePackaging}
                              />
                           )}

                           {lead.typeComposition && (
                              <InfoBadge
                                 label={t('common.fields.bodyType')}
                                 value={lead.typeComposition}
                              />
                           )}

                           {lead.typeTransport && (
                              <InfoBadge
                                 label={t('common.fields.transportType')}
                                 value={lead.typeTransport}
                              />
                           )}
                        </Box>
                     </DetailSection>
                  )}

                  {hasContactsSection && (
                     <DetailSection
                        icon={<PersonOutlineRoundedIcon />}
                        title={t('advertisements.details.myContacts')}
                     >
                        <Box sx={detailsGridSx}>
                           <InfoBadge
                              label={t('common.fields.phone')}
                              value={
                                 contactPhone || t('common.empty.notSpecifiedM')
                              }
                           />

                           <InfoBadge
                              label={t('common.fields.email')}
                              value={
                                 contactEmail || t('common.empty.notSpecifiedN')
                              }
                           />
                        </Box>
                     </DetailSection>
                  )}
               </Stack>
            )}
         </DialogContent>

         {!isInitialLoading && (
            <AdvertisementDetailsActions
               isClosed={isClosed}
               isActionLoading={isActionLoading}
               onCloseAdvertisement={handleCloseAdvertisement}
               onDeleteAdvertisement={handleDeleteAdvertisement}
            />
         )}
      </AppDialog>
   );
}

AdvertisementDetailsModal.propTypes = {
   advertisement: PropTypes.object,
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};
