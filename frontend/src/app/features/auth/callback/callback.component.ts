import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Récupérer le token de l'URL
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      console.error('❌ Pas de token dans l\'URL');
      this.router.navigate(['/login'], { queryParams: { error: 'no_token' } });
      return;
    }

    console.log('✅ Token reçu de Google OAuth');

    // Sauvegarder le token
    localStorage.setItem('token', token);

    // Récupérer les infos utilisateur depuis l'API
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('✅ Utilisateur connecté via Google:', user.email);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Erreur récupération utilisateur:', err);
        localStorage.removeItem('token');
        this.router.navigate(['/login'], { queryParams: { error: 'oauth_failed' } });
      }
    });
  }
}
