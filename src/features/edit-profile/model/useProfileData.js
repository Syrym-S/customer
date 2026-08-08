import { useEffect, useState } from 'react';

import { fetchCustomerProfile } from '../api/profile.api';
import { initialProfileForm, mapProfileFromApi } from './profile-form.helpers';

export function useProfileData() {
   const [form, setForm] = useState(initialProfileForm);
   const [initialLoadedForm, setInitialLoadedForm] =
      useState(initialProfileForm);
   const [profilePhoto, setProfilePhoto] = useState('');

   const [isProfileLoading, setIsProfileLoading] = useState(false);
   const [profileLoadError, setProfileLoadError] = useState('');

   useEffect(() => {
      let isCancelled = false;

      async function loadProfile() {
         try {
            setIsProfileLoading(true);
            setProfileLoadError('');

            const profile = await fetchCustomerProfile();

            if (!isCancelled) {
               const mappedProfile = mapProfileFromApi(profile);

               setForm(mappedProfile);
               setInitialLoadedForm(mappedProfile);
               setProfilePhoto(profile?.avatar || '');
            }
         } catch (error) {
            if (!isCancelled) {
               setProfileLoadError(
                  error.response?.data?.message ||
                     error.message ||
                     'Не удалось загрузить профиль',
               );
            }
         } finally {
            if (!isCancelled) {
               setIsProfileLoading(false);
            }
         }
      }

      loadProfile();

      return () => {
         isCancelled = true;
      };
   }, []);

   return {
      form,
      setForm,
      initialLoadedForm,
      setInitialLoadedForm,
      profilePhoto,
      setProfilePhoto,
      isProfileLoading,
      profileLoadError,
   };
}
