import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';  // ← Utiliser ApiService

export interface User {
  id: number;
  email: string;
  name: string;
  credits: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {  // ← Injecter ApiService au lieu de HttpClient
    this.loadUserFromStorage();
  }

  /**
   * Charge l'utilisateur depuis le localStorage
   */
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        console.log('👤 Utilisateur chargé depuis le cache:', user.email);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * MÉTHODE PRINCIPALE : Rafraîchit les données utilisateur depuis le serveur
   */
  refreshCurrentUser(): Observable<User> {
    console.log('🌐 Appel API pour rafraîchir l\'utilisateur...');

    return this.apiService.get<User>('auth/me').pipe(  // ✅ Utilise apiService.get()
      tap(user => {
        console.log('✅ Données utilisateur reçues:', {
          email: user.email,
          credits: user.credits
        });

        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('❌ Erreur lors du rafraîchissement:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Met à jour manuellement l'utilisateur
   */
  updateCurrentUser(user: User): void {
    console.log('📝 Mise à jour manuelle de l\'utilisateur');
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Met à jour uniquement les crédits
   */
  updateCredits(credits: number): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, credits };
      console.log('💰 Mise à jour des crédits:', credits);
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  /**
   * Connexion
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.post('auth/login', credentials).pipe(  // ✅ Utilise apiService.post()
      tap((response: any) => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        console.log('✅ Connexion réussie');
      }),
      catchError(error => {
        console.error('❌ Erreur de connexion:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Inscription
   */
  register(userData: { email: string; password: string; name: string }): Observable<any> {
    return this.apiService.post('auth/register', userData).pipe(  // ✅ Utilise apiService.post()
      tap((response: any) => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        console.log('✅ Inscription réussie');
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('👋 Déconnexion');
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  /**
   * Obtient l'utilisateur actuel (valeur instantanée)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.hasValidToken();
  }

  /**
   * Vérifie si le token est présent
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Obtient le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
