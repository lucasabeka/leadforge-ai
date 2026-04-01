import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 🏠 Landing page par défaut
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing/landing.component').then(m => m.LandingComponent)
  },

  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/callback/callback.component').then(m => m.AuthCallbackComponent)
  },

  // App (protégée)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'campaigns/new',
    loadComponent: () =>
      import('./features/campaign/create/create.component').then(m => m.CreateCampaignComponent),
    canActivate: [authGuard]
  },
  {
    path: 'campaigns/:id',
    loadComponent: () =>
      import('./features/campaign/detail/detail.component').then(m => m.CampaignDetailComponent),
    canActivate: [authGuard]
  },

  // Crédits
  {
    path: 'credits/purchase',
    loadComponent: () =>
      import('./features/credits/purchase/purchase.component').then(m => m.PurchaseComponent),
    canActivate: [authGuard]
  },
  {
    path: 'purchase/success',
    loadComponent: () =>
      import('./features/credits/purchase/success/success.component').then(m => m.PurchaseSuccessComponent),
    canActivate: [authGuard]
  },

  // Redirect
  { path: '**', redirectTo: '' }
];
