import { Alert, Dialog, DialogContent, Typography } from '@mui/material';

import { useLeadsContext } from '../model/useLeadsContext';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { useEffect, useState } from 'react';
import {
   createLeadEditForm,
   normalizeNumber,
} from '../model/leadEditForm.helpers';
import { LeadDetailsMap } from './lead-details/LeadDetailsMap';
import { LeadDetailsEditActions } from './lead-details/LeadDetailsEditActions';
import { LeadDetailsContent } from './lead-details/LeadDetailsContent';
import { LeadDetailsActions } from './lead-details/LeadDetailsActions';
import {
   buildLeadRoutePayload,
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
} from '../lib/routePolyline.helpers';
import { generateRoute } from '../api/lead-route.repository';
import { fetchCustomerLeadById } from '../api/leads.repository';
import { mapLeadDetailsResponseFromApi } from '../model/lead.adapter';
import { LeadDetailsHeader } from './lead-details/LeadDetailsHeader';

export function LeadDetailsModal() {
   const map = useCustomerMap();
   const { openLead, setOpenLead } = useLeadsContext();

   const [leadDetails, setLeadDetails] = useState(null);
   const [isLeadDetailsLoading, setIsLeadDetailsLoading] = useState(false);
   const [leadDetailsError, setLeadDetailsError] = useState(null);

   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isRouteLoading, setIsRouteLoading] = useState(false);

   const [isEditing, setIsEditing] = useState(false);
   const [editForm, setEditForm] = useState(() => createLeadEditForm(null));

   const currentLead = leadDetails ?? openLead;

   function handleClose() {
      setOpenLead(null);
      setLeadDetails(null);
      setLeadDetailsError(null);
      setRoute(null);
      setRoutePoints([]);
      setIsEditing(false);
   }

   function handleEditChange(event) {
      const { name, value } = event.target;

      setEditForm((prevForm) => ({
         ...prevForm,
         [name]: value,
      }));
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      setEditForm(createLeadEditForm(currentLead));
      setIsEditing(false);
   }

   function handleSaveEdit() {
      if (!currentLead) {
         return;
      }

      const updatedLead = {
         ...currentLead,
         customer: editForm.customer,
         from_location: editForm.from_location,
         to_location: editForm.to_location,
         summ: normalizeNumber(editForm.summ),
         currency: editForm.currency,
         vat: editForm.vat,
         driver: editForm.driver,
         cargo: {
            ...currentLead.cargo,
            type: editForm.cargoType,
            weight_kg: normalizeNumber(editForm.weight_kg),
            description: editForm.cargoDescription,
         },
      };

      setOpenLead(updatedLead);
      setLeadDetails(updatedLead);
      setIsEditing(false);
   }

   useEffect(() => {
      if (!openLead?.id) {
         setLeadDetails(null);
         return;
      }

      let isCancelled = false;

      async function loadLeadDetails() {
         try {
            setIsLeadDetailsLoading(true);
            setLeadDetailsError(null);

            const response = await fetchCustomerLeadById(openLead.id);
            const mappedLead = mapLeadDetailsResponseFromApi(response);

            if (!isCancelled) {
               setLeadDetails(mappedLead);
            }
         } catch (error) {
            if (!isCancelled) {
               setLeadDetailsError(error.message || 'Не удалось загрузить лид');
            }
         } finally {
            if (!isCancelled) {
               setIsLeadDetailsLoading(false);
            }
         }
      }

      loadLeadDetails();

      return () => {
         isCancelled = true;
      };
   }, [openLead?.id]);

   useEffect(() => {
      if (!currentLead) {
         return;
      }

      setEditForm(createLeadEditForm(currentLead));
      setIsEditing(false);
   }, [currentLead]);

   useEffect(() => {
      if (!currentLead?.id) {
         setRoute(null);
         setRoutePoints([]);
         return;
      }

      let isCancelled = false;

      async function loadLeadRoute() {
         try {
            setIsRouteLoading(true);
            setRoute(null);
            setRoutePoints([]);

            const payload = buildLeadRoutePayload(currentLead);

            if (!payload) {
               return;
            }

            const generatedRoute = await generateRoute(payload);

            if (isCancelled || !generatedRoute) {
               return;
            }

            const encodedPolyline = getEncodedPolylineFromRoute(generatedRoute);
            const decodedPoints = decodeRoutePolyline(encodedPolyline);

            setRoute(generatedRoute);
            setRoutePoints(decodedPoints);
         } finally {
            if (!isCancelled) {
               setIsRouteLoading(false);
            }
         }
      }

      loadLeadRoute();

      return () => {
         isCancelled = true;
      };
   }, [currentLead?.id]);

   if (!openLead || !currentLead) {
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
         <LeadDetailsHeader lead={currentLead} />

         <DialogContent sx={{ px: 3 }}>
            {isLeadDetailsLoading && (
               <Typography color='text.secondary' sx={{ mb: 2 }}>
                  Загружаем детали лида...
               </Typography>
            )}

            {leadDetailsError && (
               <Alert severity='error' sx={{ mb: 2 }}>
                  {leadDetailsError}
               </Alert>
            )}

            <LeadDetailsMap
               map={map}
               lead={currentLead}
               route={route}
               routePoints={routePoints}
               isRouteLoading={isRouteLoading}
            />

            <LeadDetailsEditActions
               isEditing={isEditing}
               onStartEdit={handleStartEdit}
               onCancelEdit={handleCancelEdit}
            />

            <LeadDetailsContent
               lead={currentLead}
               isEditing={isEditing}
               editForm={editForm}
               onEditChange={handleEditChange}
            />
         </DialogContent>

         <LeadDetailsActions
            isEditing={isEditing}
            onSave={handleSaveEdit}
            onClose={handleClose}
         />
      </Dialog>
   );
}
