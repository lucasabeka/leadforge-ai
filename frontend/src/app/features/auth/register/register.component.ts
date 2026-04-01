import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  perks = [
    { icon: '🎁', title: '25 crédits offerts', desc: 'Génère tes premières campagnes gratuitement' },
    { icon: '⚡', title: 'Emails en 2 minutes', desc: 'Notre IA personnalise chaque email' },
    { icon: '🔒', title: 'Sans carte bancaire', desc: 'Tu paies seulement si tu veux plus de crédits' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Merci de remplir tous les champs.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit faire au moins 8 caractères.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error || 'Une erreur est survenue. Réessaie.';
      }
    });
  }

  loginWithGoogle() {
    window.location.href = `${environment.apiUrl}/auth/google/login`;
  }
}
