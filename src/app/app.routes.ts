import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'fazenda/:id',
        loadComponent: () =>
          import('./features/fazenda/fazenda-home/fazenda-home').then((m) => m.FazendaHome),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'negocios' },
          {
            path: 'negocios',
            loadComponent: () =>
              import('./features/negocios/negocios').then((m) => m.Negocios),
          },
          {
            path: 'financeiro',
            loadComponent: () =>
              import('./features/financeiro/financeiro').then((m) => m.Financeiro),
          },
           {
            path: 'safra',
            loadComponent: () =>
              import('./features/safra/safra').then((m) => m.Safra),
          },
             {
            path: 'safra/:safraId',
            loadComponent: () =>
              import('./features/safra/safra-detalhes/safra-detalhes').then((m) => m.SafraDetalhes),
          },
        ],
      },
    ]
  }
];
