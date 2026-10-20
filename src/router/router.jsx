import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../widgets/app-layout/AppLayout";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { LeadsPage } from "../pages/leads/LeadsPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { TenderPage } from "../pages/tender/TenderPage";
import { FactoringsPage } from "../pages/factorings/FactoringsPage";
import { ForwardersPage } from "../pages/forwarders/ForwardersPage";
import { ManufacturersPage } from "../pages/manufacturers/ManufacturersPage";
import { TnvedPage } from "../pages/tnved/TnvedPage";
import { ComplaintsPage } from "../pages/complaints/ComplaintsPage";
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
          handle: {
            title: "Главная",
          },
        },
        {
          path: "customer",
          element: <LeadsPage />,
          handle: {
            breadcrumb: "Заказы",
            title: "Заказы",
          },
        },
        {
          path: "customer/leads/:leadId",
          element: <LeadsPage />,
          handle: {
            breadcrumb: "Заказы",
            title: "Заказы",
          },
        },
        {
          path: "customer/profile",
          element: <ProfilePage />,
          handle: {
            breadcrumb: "Профиль",
            title: "Профиль",
          },
        },
        {
          path: "customer/tenders",
          element: <TenderPage />,
          handle: {
            breadcrumb: "Аукционы",
            title: "Аукционы",
          },
        },
        {
          path: "customer/tenders/:tenderId",
          element: <TenderPage />,
          handle: {
            title: "Аукционы",
          },
        },
        {
          path: "customer/factorings",
          element: <FactoringsPage />,
          handle: {
            breadcrumb: "Факторинги",
            title: "Факторинги",
          },
        },
        {
          path: "customer/factorings/:factoringId",
          element: <FactoringsPage />,
          handle: {
            title: "Факторинги",
          },
        },
        {
          // Alias for outdated singular-form links sent by backend notifications
          // (e.g. .../customer/factoring/{id}). Canonical route is the plural
          // "factorings" above — keep using that everywhere internally.
          path: "customer/factoring/:factoringId",
          element: <FactoringsPage />,
          handle: {
            title: "Факторинги",
          },
        },
        {
          path: "customer/forwarders",
          element: <ForwardersPage />,
          handle: {
            breadcrumb: "Экспедиторы",
            title: "Экспедиторы",
          },
        },
        {
          path: "customer/manufacturers",
          element: <ManufacturersPage />,
          handle: {
            breadcrumb: "Производители",
            title: "Производители",
          },
        },
        {
          path: "customer/tnved",
          element: <TnvedPage />,
          handle: {
            breadcrumb: "ТН ВЭД",
            title: "ТН ВЭД",
          },
        },
        {
          path: "customer/complaints",
          element: <ComplaintsPage />,
          handle: {
            breadcrumb: "Жалобы",
            title: "Жалобы",
          },
        },
        {
          path: "customer/complaints/:complaintId",
          element: <ComplaintsPage />,
          handle: {
            title: "Жалобы",
          },
        },
      ],
    },
  ],
  {
    basename: isStaging ? "/staging" : "/",
  },
);
