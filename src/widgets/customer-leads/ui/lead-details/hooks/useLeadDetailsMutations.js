import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { notifyError } from '../../../../../shared/model/notifications.store';

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

   // Route section only: `control`/`trigger` here validate exclusively the
   // fields RouteWaypointFields/LeadRouteEditor register via Controller
   // (from/to/waypoint dates + waypoint coordinates). Cargo/forwarder/etc.
   // are never registered on this instance, so they stay unvalidated and
   // can't block save — see handleSaveEdit.
   const {
      control: routeControl,
      trigger: triggerRoute,
      reset: resetRouteForm,
      setValue: setRouteFormValue,
      formState: { errors: routeErrors },
   } = useForm({
      mode: 'onChange',
      defaultValues: createLeadEditForm(null),
   });

   function resetMutations() {
      setIsEditing(false);
      setIsSavingEdit(false);
      setSaveEditError(null);
      const emptyForm = createLeadEditForm(null);
      setEditForm(emptyForm);
      resetRouteForm(emptyForm);
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

   // Passed to the route section in place of handleEditChange: mirrors every
   // write into both the plain editForm (payload building still reads from
   // there) and the route-only RHF instance (so Controller rules/trigger see
   // current values), keeping the two in lockstep.
   function handleRouteFieldChange(path, value) {
      setRouteFormValue(path, value, {
         shouldDirty: true,
         shouldTouch: true,
         shouldValidate: true,
      });
      setEditForm((prevForm) => setValueByPath(prevForm, path, value));
   }

   function handleStartEdit() {
      setIsEditing(true);
   }

   function handleCancelEdit() {
      const nextForm = createLeadEditForm(currentLead);
      setEditForm(nextForm);
      resetRouteForm(nextForm);
      setIsEditing(false);
   }

   async function reloadCurrentLead() {
      if (!currentLead?.id) {
         throw new Error('Не удалось определить заказ');
      }

      const response = await fetchCustomerLeadById(currentLead.id);
      const mappedLead = mapLeadDetailsResponseFromApi(response);

      if (!mappedLead) {
         throw new Error('Не удалось получить обновленные данные заказа');
      }

      const nextForm = createLeadEditForm(mappedLead);

      setOpenLead(mappedLead);
      setLeadDetails(mappedLead);
      setEditForm(nextForm);
      resetRouteForm(nextForm);

      return mappedLead;
   }

   async function handleSaveEdit() {
      if (!currentLead || isSavingEdit) {
         return;
      }

      const isRouteValid = await triggerRoute();

      if (!isRouteValid) {
         const message = 'Проверьте даты маршрута';

         setSaveEditError(message);
         notifyError(message);
         return;
      }

      if (!editForm.fromLocation?.trim() || !editForm.toLocation?.trim()) {
         const message = 'Укажите точки отправления и назначения маршрута';

         setSaveEditError(message);
         notifyError(message);
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

         await reloadLeads?.({ withLoader: false });

         setIsEditing(false);
      } catch (error) {
         const message =
            error.response?.data?.message ||
            error.message ||
            'Не удалось сохранить изменения';

         setSaveEditError(message);
         notifyError(message);
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
         const message =
            error.response?.data?.message ||
            error.message ||
            'Не удалось удалить груз';

         setDeleteCargoError(message);
         notifyError(message);
      } finally {
         setDeletingCargoIndex(null);
      }
   }

   useEffect(() => {
      if (!currentLead) {
         return;
      }

      const nextForm = createLeadEditForm(currentLead);

      setEditForm(nextForm);
      resetRouteForm(nextForm);
      setIsEditing(false);
      // resetRouteForm is stable (react-hook-form's `reset` identity never
      // changes across renders), so it's safe to omit from the deps array.
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
      routeControl,
      routeErrors,
      triggerRoute,
      handleRouteFieldChange,
   };
}
