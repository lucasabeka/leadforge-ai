import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { refreshUserGuard } from './core/guards/refresh-user.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, refreshUserGuard]  // ✅ Rafraîchit les crédits
  },
  {
    path: 'campaigns/new',
    loadComponent: () => import('./features/campaign/create/create.component').then(m => m.CreateComponent),
    canActivate: [authGuard, refreshUserGuard]  // ✅ AJOUTÉ - Pour afficher le solde avant création
  },
  {
    path: 'campaigns/:id',
    loadComponent: () => import('./features/campaign/detail/detail.component').then(m => m.DetailComponent),
    canActivate: [authGuard]  // Pas de refresh (simple consultation)
  },
  {
    path: 'credits/purchase',
    loadComponent: () => import('./features/credits/purchase/purchase.component').then(m => m.PurchaseComponent),
    canActivate: [authGuard, refreshUserGuard]  // ✅ Rafraîchit les crédits
  },
    {
      path: 'purchase/success',
      loadComponent: () => import('./features/credits/purchase/success/success.component')
        .then(m => m.PurchaseSuccessComponent),
      canActivate: [authGuard]
    },
    {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/callback/callback.component')
      .then(m => m.AuthCallbackComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
