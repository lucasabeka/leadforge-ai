import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface User {
  email: string;
  name?: string;
  credits: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Charger l'utilisateur depuis localStorage au démarrage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        console.log('👤 Utilisateur chargé depuis le cache:', user.email);
      } catch (e) {
        console.error('❌ Erreur parsing user:', e);
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Récupère l'utilisateur depuis l'API
   */
  getCurrentUser(): Observable<User> {
    console.log('🌐 Appel API pour récupérer l\'utilisateur...');
    return this.apiService.get<User>('auth/me').pipe(
      tap(user => {
        console.log('✅ Utilisateur reçu:', user);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Récupère l'utilisateur depuis le cache (synchrone)
   */
  getCurrentUserFromCache(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Rafraîchit les données utilisateur depuis l'API
   */
  refreshCurrentUser(): Observable<User> {
    console.log('🔄 Rafraîchissement utilisateur...');
    return this.getCurrentUser();
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Vérifie si l'utilisateur est authentifié (alias pour authGuard)
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('👋 Déconnexion');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Login avec credentials object OU paramètres séparés
   */
  login(credentialsOrEmail: LoginCredentials | string, password?: string): Observable<any> {
    let email: string;
    let pwd: string;

    // Support pour les deux signatures
    if (typeof credentialsOrEmail === 'string') {
      email = credentialsOrEmail;
      pwd = password!;
    } else {
      email = credentialsOrEmail.email;
      pwd = credentialsOrEmail.password;
    }

    return this.apiService.post('auth/login', { email, password: pwd }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }
      })
    );
  }

  /**
   * Register avec credentials object OU paramètres séparés
   */
  register(credentialsOrName: RegisterCredentials | string, email?: string, password?: string): Observable<any> {
    let name: string;
    let userEmail: string;
    let pwd: string;

    // Support pour les deux signatures
    if (typeof credentialsOrName === 'string') {
      name = credentialsOrName;
      userEmail = email!;
      pwd = password!;
    } else {
      name = credentialsOrName.name;
      userEmail = credentialsOrName.email;
      pwd = credentialsOrName.password;
    }

    return this.apiService.post('auth/register', { name, email: userEmail, password: pwd }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }
      })
    );
  }
}
