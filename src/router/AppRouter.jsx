import { Navigate, useRoutes } from 'react-router-dom';

import { AppLayout } from '../widgets/app-layout/AppLayout';
import { LeadsPage } from '../pages/leads/LeadsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { TenderPage } from '../pages/tender/TenderPage';
import { FactoringsPage } from '../pages/factorings/FactoringsPage';
import { ForwardersPage } from '../pages/forwarders/ForwardersPage';

export const AppRouter = () => {
   const routes = useRoutes([
      {
         path: '/',
         element: <AppLayout />,
         children: [
            {
               index: true,
               element: <Navigate to='/customer' replace />,
            },
            {
               path: 'customer',
               element: <LeadsPage />,
            },
            {
               path: 'customer/profile',
               element: <ProfilePage />,
            },
            {
               path: 'customer/tenders',
               element: <TenderPage />,
            },
            {
               path: 'customer/factorings',
               element: <FactoringsPage />,
            },
            {
               path: 'customer/forwarders',
               element: <ForwardersPage />,
            },
         ],
      },
   ]);

   return routes;
};
