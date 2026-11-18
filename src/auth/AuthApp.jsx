import { Outlet } from 'react-router-dom';
import { InviteProvider } from './context/InviteContext';
import AuthLocaleProvider from './i18n/AuthLocaleProvider';

export default function AuthApp() {
  return (
    <AuthLocaleProvider role="customer">
      <InviteProvider>
        <Outlet />
      </InviteProvider>
    </AuthLocaleProvider>
  );
}
