import type { RouteObject } from 'react-router';
import { ALL_NAV } from '../config/navigation';
import { EditProfilePage } from '../features/account/EditProfilePage';
import { ProfilePage } from '../features/account/ProfilePage';
import { AuthLayout } from '../features/auth/AuthLayout';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { SignupPage } from '../features/auth/SignupPage';
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { RouteErrorPage } from '../features/errors/RouteErrorPage';
import { HomePage } from '../features/home/HomePage';
import { PlannedFeaturePage } from '../features/planned/PlannedFeaturePage';
import { GeneralSettingsPage } from '../features/settings/GeneralSettingsPage';
import { NotificationSettingsPage } from '../features/settings/NotificationSettingsPage';
import { PaymentSettingsPage } from '../features/settings/PaymentSettingsPage';
import { SecuritySettingsPage } from '../features/settings/SecuritySettingsPage';
import { SettingsLayout } from '../features/settings/SettingsLayout';
import { WalletsPage } from '../features/wallets/WalletsPage';
import { AppShell } from '../layouts/app-shell/AppShell';

const plannedRoutes: RouteObject[] = ALL_NAV.filter((item) => item.task).map((item) => ({
  path: item.path.slice(1),
  element: <PlannedFeaturePage item={item} />,
}));

export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/edit', element: <EditProfilePage /> },
      { path: 'wallets', element: <WalletsPage /> },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <GeneralSettingsPage /> },
          { path: 'notifications', element: <NotificationSettingsPage /> },
          { path: 'payments', element: <PaymentSettingsPage /> },
          { path: 'security', element: <SecuritySettingsPage /> },
        ],
      },
      ...plannedRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
