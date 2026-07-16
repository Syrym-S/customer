import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../widgets/app-layout/AppLayout";
import { LeadsPage } from "../pages/leads/LeadsPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { TenderPage } from "../pages/tender/TenderPage";
import { FactoringsPage } from "../pages/factorings/FactoringsPage";
import { ForwardersPage } from "../pages/forwarders/ForwardersPage";
import { isStaging } from "../shared/api/api-client";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      handle: {
        breadcrumb: "Главная",
      },
      children: [
        {
          index: true,
          element: <Navigate to="/customer" replace />,
        },
        {
          path: "customer",
          element: <LeadsPage />,
        },
        {
          path: "customer/leads/:leadId",
          element: <LeadsPage />,
        },
        {
          path: "customer/profile",
          element: <ProfilePage />,
          handle: {
            breadcrumb: "Профиль",
          },
        },
        {
          path: "customer/tenders",
          element: <TenderPage />,
          handle: {
            breadcrumb: "Тендеры",
          },
        },
        {
          path: "customer/tenders/:tenderId",
          element: <TenderPage />,
        },
        {
          path: "customer/factorings",
          element: <FactoringsPage />,
          handle: {
            breadcrumb: "Факторинги",
          },
        },
        {
          path: "customer/factorings/:factoringIndex",
          element: <FactoringsPage />,
        },
        {
          path: "customer/forwarders",
          element: <ForwardersPage />,
          handle: {
            breadcrumb: "Экпедиторы",
          },
        },
      ],
    },
  ],
  {
    basename: isStaging ? "/staging" : "/",
  },
);
