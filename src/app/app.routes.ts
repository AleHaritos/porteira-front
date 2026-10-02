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
          import('./features/fazenda-home/fazenda-home').then((m) => m.FazendaHome),
      },
    ]
  }
];
