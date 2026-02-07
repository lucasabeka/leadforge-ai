import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit faire au moins 6 caractères';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.loading = false;
        this.error = err.error || 'Erreur lors de l\'inscription';
      }
    });
  }
}
