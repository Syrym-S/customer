import {
   Alert,
   Box,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
} from '@mui/material';

import { useTendersContext } from '../model/useTendersContext';
import { useEffect, useState } from 'react';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { LeadDetailsMap } from '../../customer-leads/ui/lead-details/LeadDetailsMap';
import { TenderDetailsContent } from './tender-details/TenderDetailsContent';
import { TenderDetailsHeader } from './tender-details/TenderDetailsHeader';
import { TenderDetailsEditActions } from './tender-details/TenderDetailsEditActions';
import {
   buildLeadRoutePayload,
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from '../../customer-leads/lib/routePolyline.helpers';
import { generateRoute } from '../../customer-leads/api/lead-route.repository';

export function TenderDetailsModal() {
   const map = useCustomerMap();
   const {
      openTender,
      closeTenderDetails,
      isDetailsLoading,
      detailsError,
      acceptBet,
      cancelTender,
      deleteTender,
      removeParticipant,
      startTender,
   } = useTendersContext();

   const [isEditing, setIsEditing] = useState(false);

   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isRouteLoading, setIsRouteLoading] = useState(false);

   const [actionError, setActionError] = useState('');
   const [isActionLoading, setIsActionLoading] = useState(false);

   function handleClose() {
      closeTenderDetails();
      setIsEditing(false);
      setRoute(null);
      setRoutePoints([]);
      setActionError('');
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      setIsEditing(false);
   }

   async function handleStartTender() {
      if (!openTender?.id) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await startTender(openTender.id);
      } catch (error) {
         setActionError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось запустить тендер',
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleAcceptWinner(betIndex) {
      if (!openTender?.id) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await acceptBet(openTender.id, betIndex);
      } catch (error) {
         setActionError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось выбрать победителя',
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleCancelTender() {
      if (!openTender.id) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await cancelTender(openTender.id);
      } catch (error) {
         setActionError(
            error.response?.data?.message || 'Не удалось отменить тендер',
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleDeleteTender() {
      if (!openTender?.id) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await deleteTender(openTender.id);
      } catch (error) {
         setActionError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось удалить тендер',
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleDeleteParticipant(participantId) {
      if (!openTender?.id || !participantId) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await removeParticipant(openTender.id, participantId);
      } catch (error) {
         setActionError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось удалить участника',
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   // function handleSaveEdit() {
   //    setIsEditing(false);
   // }

   // function buildMockTenderRoutePoints(tender) {
   //    if (!tender?.from_point || !tender?.to_point) {
   //       return [];
   //    }

   //    return [tender.from_point, tender.to_point];
   // }

   useEffect(() => {
      let isMounted = true;

      async function loadTenderRoute() {
         const lead = openTender?.lead;

         if (!openTender?.id || !lead?.id) {
            setRoute(null);
            setRoutePoints([]);
            setIsRouteLoading(false);
            return;
         }

         try {
            setIsRouteLoading(true);

            const payload = buildLeadRoutePayload(lead);

            if (!payload) {
               setRoute(null);
               setRoutePoints([]);
               return;
            }

            const generatedRoute = await generateRoute(payload);
            const routes = getRoutesFromGeneratedRoute(generatedRoute);
            const mainRoute = routes[0];
            const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
            const decodedPoints = decodeRoutePolyline(encodedPolyline);

            if (!isMounted) {
               return;
            }

            setRoute(mainRoute || null);
            setRoutePoints(decodedPoints || []);
         } catch (error) {
            if (!isMounted) {
               return;
            }

            setRoute(null);
            setRoutePoints([]);
         } finally {
            if (isMounted) {
               setIsRouteLoading(false);
            }
         }
      }

      loadTenderRoute();

      return () => {
         isMounted = false;
      };
   }, [openTender]);

   if (!openTender) {
      return null;
   }

   const leadForMap = openTender.lead || openTender;

   return (
      <Dialog
         open={Boolean(openTender)}
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
         <TenderDetailsHeader tender={openTender} />

         <DialogContent sx={{ px: 3 }}>
            {detailsError && (
               <Alert severity='error' sx={{ mb: 2 }}>
                  {detailsError}
               </Alert>
            )}

            {actionError && (
               <Alert severity='error' sx={{ mb: 2 }}>
                  {actionError}
               </Alert>
            )}

            {isDetailsLoading ? (
               <Box
                  sx={{
                     py: 5,
                     display: 'flex',
                     justifyContent: 'center',
                  }}
               >
                  <CircularProgress size={32} />
               </Box>
            ) : (
               <>
                  <LeadDetailsMap
                     map={map}
                     lead={leadForMap}
                     route={route}
                     routePoints={routePoints}
                     geoPoints={[]}
                     geoCurrentPoint={null}
                     isRouteLoading={isRouteLoading}
                  />

                  <TenderDetailsEditActions
                     isEditing={isEditing}
                     onStartEdit={handleStartEdit}
                     onCancelEdit={handleCancelEdit}
                  />

                  <TenderDetailsContent
                     tender={openTender}
                     isActionLoading={isActionLoading}
                     onAcceptWinner={handleAcceptWinner}
                     onCancelTender={handleCancelTender}
                     onDeleteTender={handleDeleteTender}
                     onDeleteParticipant={handleDeleteParticipant}
                     onStartTender={handleStartTender}
                  />
               </>
            )}
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            {/* {isEditing && (
               <Button variant='contained' onClick={handleSaveEdit}>
                  Сохранить
               </Button>
            )} */}

            <Button onClick={handleClose}>Закрыть</Button>
         </DialogActions>
      </Dialog>
   );
}
