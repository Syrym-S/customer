import {
   Alert,
   Box,
   CircularProgress,
   Dialog,
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
import {
   createTenderEditForm,
   mapTenderEditFormToApi,
} from '../model/tenderEditFrom.helpers';
import { TenderDetailsActions } from './tender-details/TenderDetailsActions';

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
      updateTender,
      addParticipantsToTender,
   } = useTendersContext();

   const [isEditing, setIsEditing] = useState(false);
   const [isSavingEdit, setIsSavingEdit] = useState(false);
   const [saveEditError, setSaveEditError] = useState(null);
   const [editForm, setEditForm] = useState(() => createTenderEditForm(null));

   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isRouteLoading, setIsRouteLoading] = useState(false);

   const [actionError, setActionError] = useState('');
   const [isActionLoading, setIsActionLoading] = useState(false);

   function handleClose() {
      closeTenderDetails();
      setIsEditing(false);
      setSaveEditError(null);
      setEditForm(createTenderEditForm(null));
      setRoute(null);
      setRoutePoints([]);
      setActionError('');
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      setEditForm(createTenderEditForm(openTender));
      setIsEditing(false);
      setSaveEditError(null);
   }

   function handleEditChange(eventOrName, maybeValue) {
      if (typeof eventOrName === 'string') {
         setEditForm((prevForm) => ({
            ...prevForm,
            [eventOrName]: maybeValue,
         }));

         return;
      }

      const { name, value } = eventOrName.target;

      setEditForm((prevForm) => ({
         ...prevForm,
         [name]: value,
      }));
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

         return true;
      } catch (error) {
         setActionError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось выбрать победителя',
         );

         return false;
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleCancelTender() {
      if (!openTender?.id) {
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

   async function handleDeleteParticipant(participantIndex) {
      if (
         !openTender?.id ||
         participantIndex === null ||
         participantIndex === undefined
      ) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await removeParticipant(openTender.id, participantIndex);
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

   async function handleAddParticipants(forwarders) {
      if (
         !openTender?.id ||
         !Array.isArray(forwarders) ||
         forwarders.length === 0
      ) {
         return;
      }

      try {
         setIsActionLoading(true);
         setActionError('');

         await addParticipantsToTender(
            openTender.id,
            forwarders.map((forwarder) => forwarder.id),
         );
      } catch (error) {
         setActionError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось добавить участников',
         );
      } finally {
         setIsActionLoading(false);
      }
   }

   async function handleSaveEdit() {
      if (!openTender?.id || isSavingEdit) {
         return;
      }

      const payload = mapTenderEditFormToApi(editForm, openTender);

      if (Object.keys(payload).length === 0) {
         setIsEditing(false);
         setSaveEditError(null);
         return;
      }

      try {
         setIsSavingEdit(true);
         setSaveEditError(null);

         await updateTender(openTender.id, payload);

         setIsEditing(false);
      } catch (error) {
         setSaveEditError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось сохранить изменения тендера',
         );
      } finally {
         setIsSavingEdit(false);
      }
   }

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
         } catch {
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

   useEffect(() => {
      if (!openTender) {
         return;
      }

      setEditForm(createTenderEditForm(openTender));
      setIsEditing(false);
      setSaveEditError(null);
   }, [openTender]);

   if (!openTender) {
      return null;
   }

   const leadForMap = openTender.lead;

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
            {saveEditError && (
               <Alert severity='error' sx={{ mb: 2 }}>
                  {saveEditError}
               </Alert>
            )}

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
                  {leadForMap && (
                     <LeadDetailsMap
                        map={map}
                        lead={leadForMap}
                        route={route}
                        routePoints={routePoints}
                        geoPoints={[]}
                        geoCurrentPoint={null}
                        isRouteLoading={isRouteLoading}
                     />
                  )}

                  <TenderDetailsEditActions
                     isEditing={isEditing}
                     onStartEdit={handleStartEdit}
                     onCancelEdit={handleCancelEdit}
                  />

                  <TenderDetailsContent
                     tender={openTender}
                     isActionLoading={isActionLoading}
                     isEditing={isEditing}
                     editForm={editForm}
                     onEditChange={handleEditChange}
                     onAcceptWinner={handleAcceptWinner}
                     onDeleteParticipant={handleDeleteParticipant}
                     onAddParticipants={handleAddParticipants}
                  />
               </>
            )}
         </DialogContent>

         <TenderDetailsActions
            tender={openTender}
            isEditing={isEditing}
            isSaving={isSavingEdit}
            isActionLoading={isActionLoading}
            onSave={handleSaveEdit}
            onClose={handleClose}
            onStartTender={handleStartTender}
            onCancelTender={handleCancelTender}
            onDeleteTender={handleDeleteTender}
         />
      </Dialog>
   );
}
