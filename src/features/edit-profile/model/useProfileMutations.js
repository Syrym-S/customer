import { useState } from 'react';

import {
   deleteCustomerAvatar,
   fetchCustomerProfile,
   updateCustomerProfile,
   uploadCustomerAvatar,
} from '../api/profile.api';
import {
   mapProfileFormToChangedApi,
   validateProfileForm,
} from './profile-form.helpers';
import {
   getAvatarFromUploadResponse,
   notifyProfilePhotoUpdated,
} from '../../update-profile-photo/model/profile-photo.helpers';
import { notifySuccess } from '../../../shared/model/toast.store';

export function useProfileMutations({
   form,
   setForm,
   initialLoadedForm,
   setInitialLoadedForm,
   profilePhoto,
   setProfilePhoto,
}) {
   const [errors, setErrors] = useState({});
   const [isSaving, setIsSaving] = useState(false);
   const [submitError, setSubmitError] = useState('');

   const [profilePhotoFile, setProfilePhotoFile] = useState(null);
   const [profilePhotoError, setProfilePhotoError] = useState('');
   const [shouldDeleteProfilePhoto, setShouldDeleteProfilePhoto] =
      useState(false);

   function handleChange(event) {
      const { name, value } = event.target;

      setForm((prevForm) => ({
         ...prevForm,
         [name]: value,
      }));

      setErrors((prevErrors) => ({
         ...prevErrors,
         [name]: '',
      }));

      setSubmitError('');
   }

   function handlePhotoChange(nextPhoto, file) {
      setProfilePhoto(nextPhoto);
      setProfilePhotoFile(file);
      setShouldDeleteProfilePhoto(false);
      setProfilePhotoError('');
      setSubmitError('');
   }

   function handlePhotoRemove() {
      setProfilePhoto('');
      setProfilePhotoFile(null);
      setShouldDeleteProfilePhoto(true);
      setProfilePhotoError('');
      setSubmitError('');
   }

   async function handleSubmit(event) {
      event.preventDefault();

      const nextErrors = validateProfileForm(form);

      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
         return;
      }

      if (profilePhotoError) {
         return;
      }

      const payload = mapProfileFormToChangedApi(form, initialLoadedForm);

      const hasProfileChanges = Object.keys(payload).length > 0;
      const hasPhotoUpload = Boolean(profilePhotoFile);
      const hasPhotoDelete = shouldDeleteProfilePhoto;

      if (!hasProfileChanges && !hasPhotoUpload && !hasPhotoDelete) {
         setSubmitError('Нет изменений для сохранения');
         return;
      }

      try {
         setIsSaving(true);
         setSubmitError('');

         if (hasProfileChanges) {
            await updateCustomerProfile(payload);
         }

         let nextAvatar = profilePhoto;

         if (hasPhotoDelete) {
            await deleteCustomerAvatar();

            nextAvatar = '';

            notifyProfilePhotoUpdated('');
         }

         if (hasPhotoUpload) {
            const uploadResponse = await uploadCustomerAvatar(profilePhotoFile);
            const updatedProfile = await fetchCustomerProfile();

            nextAvatar =
               updatedProfile?.avatar ||
               getAvatarFromUploadResponse(uploadResponse, profilePhoto);

            notifyProfilePhotoUpdated(nextAvatar);
         }

         const nextInitialForm = {
            ...form,
            currentPassword: '',
            newPassword: '',
            newPasswordConfirm: '',
         };

         setInitialLoadedForm(nextInitialForm);
         setProfilePhoto(nextAvatar);
         setProfilePhotoFile(null);
         setShouldDeleteProfilePhoto(false);
         setForm(nextInitialForm);

         notifySuccess('Профиль успешно обновлен');
      } catch (error) {
         setSubmitError(
            error.response?.data?.message ||
               error.response?.data?.error ||
               error.message ||
               'Не удалось обновить профиль',
         );
      } finally {
         setIsSaving(false);
      }
   }

   return {
      errors,
      isSaving,
      submitError,

      profilePhotoFile,
      profilePhotoError,
      setProfilePhotoError,

      handleChange,
      handlePhotoChange,
      handlePhotoRemove,
      handleSubmit,
   };
}
