import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../widgets/app-layout/AppLayout";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { LeadsPage } from "../pages/leads/LeadsPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { TenderPage } from "../pages/tender/TenderPage";
import { FactoringsPage } from "../pages/factorings/FactoringsPage";
import { ForwardersPage } from "../pages/forwarders/ForwardersPage";
import { ErrorPage } from "../pages/error/ErrorPage";
import { isStaging } from "../shared/api/api-client";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      handle: {
        breadcrumb: "Главная",
      },
      children: [
        {
          index: true,
          element: <Navigate to="/customer" replace />,
        },
        {
          path: "customer/dashboard",
          element: <DashboardPage />,
        },
        {
          path: "customer",
          element: <LeadsPage />,
          handle: {
            breadcrumb: "Лиды",
          },
        },
        {
          path: "customer/leads/:leadId",
          element: <LeadsPage />,
          handle: {
            breadcrumb: "Лиды",
          },
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
            breadcrumb: "Аукционы",
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
          path: "customer/factorings/:factoringId",
          element: <FactoringsPage />,
        },
        {
          // Alias for outdated singular-form links sent by backend notifications
          // (e.g. .../customer/factoring/{id}). Canonical route is the plural
          // "factorings" above — keep using that everywhere internally.
          path: "customer/factoring/:factoringId",
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
