import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export const refreshUserGuard = () => {
  const authService = inject(AuthService);

  console.log('🔄 Guard: Rafraîchissement des données utilisateur...');

  return authService.refreshCurrentUser().pipe(
    tap(user => {
      console.log('✅ Guard: Données utilisateur rafraîchies', { credits: user.credits });
    }),
    map(() => true),
    catchError((error) => {
      console.error('❌ Guard: Erreur lors du rafraîchissement', error);
      return of(true);
    })
  );
};
