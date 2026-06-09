import { Navigate, useRoutes } from 'react-router-dom';

import { AppLayout } from '../widgets/app-layout';
import { CustomerPage } from '../pages/customer';
import { ProfilePage } from '../pages/profile/ui/ProfilePage';

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
         ],
      },
   ]);

   return routes;
};
