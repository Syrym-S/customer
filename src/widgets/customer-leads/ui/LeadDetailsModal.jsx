import { Dialog, DialogContent } from '@mui/material';

import { useLeadsContext } from '../model/useLeadsContext';
import { useCustomerMap } from '../../customer-map/model/useCustomerMap';
import { useEffect, useState } from 'react';
import {
   createLeadEditForm,
   normalizeNumber,
} from '../model/leadEditForm.helpers';
import { LeadDetailsHeader } from './lead-details/LeadDetailsHeader';
import { LeadDetailsMap } from './lead-details/LeadDetailsMap';
import { LeadDetailsEditActions } from './lead-details/LeadDetailsEditActions';
import { LeadDetailsContent } from './lead-details/LeadDetailsContent';
import { LeadDetailsActions } from './lead-details/LeadDetailsActions';

export function LeadDetailsModal() {
   const map = useCustomerMap();
   const { openLead, setOpenLead } = useLeadsContext();

   const [isEditing, setIsEditing] = useState(false);
   const [editForm, setEditForm] = useState(() => createLeadEditForm(null));

   function handleClose() {
      setOpenLead(null);
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
      setEditForm(createLeadEditForm(openLead));
      setIsEditing(false);
   }

   function handleSaveEdit() {
      const updatedLead = {
         ...openLead,
         customer: editForm.customer,
         from_location: editForm.from_location,
         to_location: editForm.to_location,
         summ: normalizeNumber(editForm.summ),
         currency: editForm.currency,
         vat: editForm.vat,
         driver: editForm.driver,
         cargo: {
            ...openLead.cargo,
            type: editForm.cargoType,
            weight_kg: normalizeNumber(editForm.weight_kg),
            description: editForm.cargoDescription,
         },
      };

      setOpenLead(updatedLead);
      setIsEditing(false);
   }

   useEffect(() => {
      if (!openLead) {
         return;
      }

      setEditForm(createLeadEditForm(openLead));
      setIsEditing(false);
   }, [openLead]);

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
         <LeadDetailsHeader lead={openLead} />

         <DialogContent sx={{ px: 3 }}>
            <LeadDetailsMap map={map} />

            <LeadDetailsEditActions
               isEditing={isEditing}
               onStartEdit={handleStartEdit}
               onCancelEdit={handleCancelEdit}
            />

            <LeadDetailsContent
               lead={openLead}
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
