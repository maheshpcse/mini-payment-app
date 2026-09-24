import type { RouteObject } from 'react-router';
import { LAB_NAV, PRIMARY_NAV } from '../config/navigation';
import { DesignSystemPage } from '../features/developer-lab/DesignSystemPage';
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { RouteErrorPage } from '../features/errors/RouteErrorPage';
import { HomePage } from '../features/home/HomePage';
import { PlannedFeaturePage } from '../features/planned/PlannedFeaturePage';
import { AppShell } from '../layouts/app-shell/AppShell';

const plannedRoutes: RouteObject[] = [...PRIMARY_NAV, ...LAB_NAV]
  .filter((item) => item.task)
  .map((item) => ({ path: item.path.slice(1), element: <PlannedFeaturePage item={item} /> }));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'lab/design-system', element: <DesignSystemPage /> },
      ...plannedRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
