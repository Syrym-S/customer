import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';

import { useTendersContext } from '../model/useTendersContext';
import { useEffect, useState } from 'react';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { LeadDetailsMap } from '../../customer-leads/ui/lead-details/LeadDetailsMap';
import { TenderDetailsContent } from './tender-details/TenderDetailsContent';
import { TenderDetailsHeader } from './tender-details/TenderDetailsHeader';
import { TenderDetailsEditActions } from './tender-details/TenderDetailsEditActions';

export function TenderDetailsModal() {
   const map = useCustomerMap();
   const { openTender, setOpenTender } = useTendersContext();

   const [isEditing, setIsEditing] = useState(false);

   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isRouteLoading, setIsRouteLoading] = useState(false);

   function handleClose() {
      setOpenTender(null);
      setIsEditing(false);
      setRoute(null);
      setRoutePoints([]);
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      setIsEditing(false);
   }

   function handleSaveEdit() {
      setIsEditing(false);
   }

   function buildMockTenderRoutePoints(tender) {
      if (!tender?.from_point || !tender?.to_point) {
         return [];
      }

      return [tender.from_point, tender.to_point];
   }

   useEffect(() => {
      if (!openTender?.id) {
         setRoute(null);
         setRoutePoints([]);
         return;
      }

      setIsRouteLoading(true);

      const mockRoutePoints = buildMockTenderRoutePoints(openTender);

      setRoute({
         description: `Тендер #${openTender.id}`,
      });

      setRoutePoints(mockRoutePoints);
      setIsRouteLoading(false);
   }, [openTender]);

   if (!openTender) {
      return null;
   }

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
            <LeadDetailsMap
               map={map}
               lead={openTender}
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

            <TenderDetailsContent tender={openTender} />
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            {isEditing && (
               <Button variant='contained' onClick={handleSaveEdit}>
                  Сохранить
               </Button>
            )}

            <Button onClick={handleClose}>Закрыть</Button>
         </DialogActions>
      </Dialog>
   );
}
