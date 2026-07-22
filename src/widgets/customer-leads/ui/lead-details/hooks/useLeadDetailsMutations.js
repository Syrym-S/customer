import { useEffect, useState } from 'react';

import {
   createLeadEditForm,
   mapLeadEditFormToApi,
} from '../../../model/lead-edit-form.helpers';
import {
   fetchCustomerLeadById,
   updateCustomerLead,
} from '../../../api/leads.repository';
import { deleteLeadCargoApi } from '../../../api/leads.api';
import { mapLeadDetailsResponseFromApi } from '../../../model/lead.adapter';

function setValueByPath(source, path, value) {
   const keys = String(path).split('.');

   if (keys.length === 1) {
      return {
         ...source,
         [path]: value,
      };
   }

   const nextState = Array.isArray(source) ? [...source] : { ...source };
   let cursor = nextState;

   keys.forEach((key, index) => {
      const isLastKey = index === keys.length - 1;
      const nextKey = keys[index + 1];
      const shouldBeArray = /^\d+$/.test(nextKey);

      if (isLastKey) {
         cursor[key] = value;
         return;
      }

      const currentValue = cursor[key];

      if (Array.isArray(currentValue)) {
         cursor[key] = [...currentValue];
      } else if (currentValue && typeof currentValue === 'object') {
         cursor[key] = { ...currentValue };
      } else {
         cursor[key] = shouldBeArray ? [] : {};
      }

      cursor = cursor[key];
   });

   return nextState;
}

export function useLeadDetailsMutations({
   currentLead,
   setOpenLead,
   setLeadDetails,
   reloadLeads,
}) {
   const [isEditing, setIsEditing] = useState(false);
   const [isSavingEdit, setIsSavingEdit] = useState(false);
   const [saveEditError, setSaveEditError] = useState(null);
   const [editForm, setEditForm] = useState(() => createLeadEditForm(null));

   const [deletingCargoIndex, setDeletingCargoIndex] = useState(null);
   const [deleteCargoError, setDeleteCargoError] = useState('');

   function resetMutations() {
      setIsEditing(false);
      setIsSavingEdit(false);
      setSaveEditError(null);
      setEditForm(createLeadEditForm(null));
      setDeletingCargoIndex(null);
      setDeleteCargoError('');
   }

   function handleEditChange(eventOrName, maybeValue) {
      if (typeof eventOrName === 'string') {
         setEditForm((prevForm) =>
            setValueByPath(prevForm, eventOrName, maybeValue),
         );

         return;
      }

      const { name, value } = eventOrName.target;

      setEditForm((prevForm) => setValueByPath(prevForm, name, value));
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      setEditForm(createLeadEditForm(currentLead));
      setIsEditing(false);
   }

   async function reloadCurrentLead() {
      if (!currentLead?.id) {
         throw new Error('Не удалось определить лид');
      }

      const response = await fetchCustomerLeadById(currentLead.id);
      const mappedLead = mapLeadDetailsResponseFromApi(response);

      if (!mappedLead) {
         throw new Error('Не удалось получить обновленные данные лида');
      }

      setOpenLead(mappedLead);
      setLeadDetails(mappedLead);
      setEditForm(createLeadEditForm(mappedLead));

      return mappedLead;
   }

   async function handleSaveEdit() {
      if (!currentLead || isSavingEdit) {
         return;
      }

      const payload = mapLeadEditFormToApi(editForm, currentLead);

      if (Object.keys(payload).length === 0) {
         setIsEditing(false);
         setSaveEditError(null);
         return;
      }

      try {
         setIsSavingEdit(true);
         setSaveEditError(null);

         await updateCustomerLead(currentLead.id, payload);
         await reloadCurrentLead();

         setIsEditing(false);
      } catch (error) {
         setSaveEditError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось сохранить изменения',
         );
      } finally {
         setIsSavingEdit(false);
      }
   }

   async function handleDeleteCargo(cargoIndex) {
      if (!currentLead?.id || deletingCargoIndex !== null) {
         return;
      }

      const isConfirmed = window.confirm(`Удалить груз #${cargoIndex + 1}?`);

      if (!isConfirmed) {
         return;
      }

      try {
         setDeletingCargoIndex(cargoIndex);
         setDeleteCargoError('');

         await deleteLeadCargoApi(currentLead.id, cargoIndex);
         await reloadCurrentLead();

         await reloadLeads?.({ withLoader: false });
      } catch (error) {
         setDeleteCargoError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось удалить груз',
         );
      } finally {
         setDeletingCargoIndex(null);
      }
   }

   useEffect(() => {
      if (!currentLead) {
         return;
      }

      setEditForm(createLeadEditForm(currentLead));
      setIsEditing(false);
   }, [currentLead]);

   return {
      isEditing,
      isSavingEdit,
      saveEditError,
      editForm,
      deletingCargoIndex,
      deleteCargoError,
      handleEditChange,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleDeleteCargo,
      resetMutations,
   };
}
