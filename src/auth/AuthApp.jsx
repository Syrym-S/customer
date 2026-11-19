import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { InviteProvider } from './context/InviteContext';
import AuthLocaleProvider from './i18n/AuthLocaleProvider';
import { loadSupportContacts } from '../shared/model/support-contacts.store';

export default function AuthApp() {
  useEffect(() => {
    loadSupportContacts();
  }, []);

  return (
    <AuthLocaleProvider role="customer">
      <InviteProvider>
        <Outlet />
      </InviteProvider>
    </AuthLocaleProvider>
  );
}
