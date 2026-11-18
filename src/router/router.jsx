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
import { AdvertisementsPage } from "../pages/advertisements/AdvertisementsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { ErrorPage } from "../pages/error/ErrorPage";
import AuthApp from "../auth/AuthApp";
import Login from "../auth/pages/Login";
import Register from "../auth/pages/Register";
import ForgotPassword from "../auth/pages/password/ForgotPassword";
import ResetPassword from "../auth/pages/password/ResetPassword";
import { LoginRedirect } from "../auth/shared/LoginRedirect";
import { appBasename } from "../shared/api/api-client";
import {
  isAdvertisementsEnabled,
  isFactoringEnabled,
  isManufacturersEnabled,
  isTenderEnabled,
} from "../shared/config/feature-flags";

// Раздел, скрытый флагом, остаётся в роутере, но отдаёт редирект на дашборд:
// прямая ссылка и переход из уведомления не должны открывать выключенный
// раздел. Редирект с replace, чтобы «назад» не возвращало в ту же ловушку.
const HIDDEN_SECTION_ELEMENT = <Navigate to="/customer/dashboard" replace />;

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      handle: {
        breadcrumb: "nav.dashboard",
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
            title: "nav.dashboard",
          },
        },
        {
          path: "customer",
          element: <LeadsPage />,
          handle: {
            breadcrumb: "nav.leads",
            title: "nav.leads",
          },
        },
        {
          path: "customer/leads/:leadId",
          element: <LeadsPage />,
          handle: {
            breadcrumb: "nav.leads",
            title: "nav.leads",
          },
        },
        {
          path: "customer/profile",
          element: <ProfilePage />,
          handle: {
            breadcrumb: "nav.profile",
            title: "nav.profile",
          },
        },
        {
          path: "customer/tenders",
          element: isTenderEnabled ? <TenderPage /> : HIDDEN_SECTION_ELEMENT,
          handle: {
            breadcrumb: "nav.tenders",
            title: "nav.tenders",
          },
        },
        {
          path: "customer/tenders/:tenderId",
          element: isTenderEnabled ? <TenderPage /> : HIDDEN_SECTION_ELEMENT,
          handle: {
            title: "nav.tenders",
          },
        },
        {
          path: "customer/factorings",
          element: isFactoringEnabled ? <FactoringsPage /> : HIDDEN_SECTION_ELEMENT,
          handle: {
            breadcrumb: "nav.factorings",
            title: "nav.factorings",
          },
        },
        {
          path: "customer/factorings/:factoringId",
          element: isFactoringEnabled ? <FactoringsPage /> : HIDDEN_SECTION_ELEMENT,
          handle: {
            title: "nav.factorings",
          },
        },
        {
          // Alias for outdated singular-form links sent by backend notifications
          // (e.g. .../customer/factoring/{id}). Canonical route is the plural
          // "factorings" above — keep using that everywhere internally.
          path: "customer/factoring/:factoringId",
          element: isFactoringEnabled ? <FactoringsPage /> : HIDDEN_SECTION_ELEMENT,
          handle: {
            title: "nav.factorings",
          },
        },
        {
          path: "customer/forwarders",
          element: <ForwardersPage />,
          handle: {
            breadcrumb: "nav.forwarders",
            title: "nav.forwarders",
          },
        },
        {
          path: "customer/manufacturers",
          element: isManufacturersEnabled ? <ManufacturersPage /> : HIDDEN_SECTION_ELEMENT,
          handle: {
            breadcrumb: "nav.manufacturers",
            title: "nav.manufacturers",
          },
        },
        {
          path: "customer/tnved",
          element: <TnvedPage />,
          handle: {
            breadcrumb: "nav.tnved",
            title: "nav.tnved",
          },
        },
        {
          path: "customer/settings",
          element: <SettingsPage />,
          handle: {
            breadcrumb: "nav.settings",
            title: "nav.settings",
          },
        },
        {
          path: "customer/advertisements",
          element: isAdvertisementsEnabled ? (
            <AdvertisementsPage />
          ) : (
            HIDDEN_SECTION_ELEMENT
          ),
          handle: {
            breadcrumb: "nav.advertisements",
            title: "nav.advertisements",
          },
        },
        {
          path: "customer/complaints",
          element: <ComplaintsPage />,
          handle: {
            breadcrumb: "nav.complaints",
            title: "nav.complaints",
          },
        },
        {
          path: "customer/complaints/:complaintId",
          element: <ComplaintsPage />,
          handle: {
            title: "nav.complaints",
          },
        },
      ],
    },
    {
      path: "auth",
      element: <AuthApp />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <LoginRedirect />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "reset-password",
          element: <ResetPassword />,
        },
      ],
    },
  ],
  {
    basename: appBasename,
  },
);
