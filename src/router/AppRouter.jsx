import { Navigate, useRoutes } from 'react-router-dom';

import { AppLayout } from '../widgets/app-layout/AppLayout';
import { CustomerPage } from '../pages/customer/CustomerPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { TenderPage } from '../pages/tender/TenderPage';

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
               element: <CustomerPage />,
            },
            {
               path: 'customer/profile',
               element: <ProfilePage />,
            },
            {
               path: 'customer/tenders',
               element: <TenderPage />,
            },
         ],
      },
   ]);

   return routes;
};
