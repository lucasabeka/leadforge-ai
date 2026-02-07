import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreditService } from '../../../core/services/credit.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  currentCredits = 0;
  loading = false;
  successMessage = '';
  errorMessage = '';

  packages = [
    { credits: 100, price: 10, popular: false },
    { credits: 500, price: 40, popular: true, savings: '20%' },
    { credits: 1000, price: 70, popular: false, savings: '30%' },
    { credits: 5000, price: 300, popular: false, savings: '40%' }
  ];

  constructor(
    private creditService: CreditService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance() {
    this.creditService.getBalance().subscribe({
      next: (response) => {
        this.currentCredits = response.credits;
      },
      error: (err) => {
        console.error('Error loading balance:', err);
      }
    });
  }

  purchasePackage(amount: number, price: number) {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Pour l'instant, on ajoute directement les crédits
    // Plus tard, vous intégrerez le paiement Stripe ici
    this.creditService.purchaseCredits(amount).subscribe({
      next: (response) => {
        this.currentCredits = response.credits;
        this.successMessage = `${response.purchased} crédits ajoutés avec succès !`;
        this.loading = false;

        // Mettre à jour le user dans AuthService
        const user = this.authService.getCurrentUser();
        if (user) {
          user.credits = response.credits;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Rediriger vers dashboard après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error purchasing credits:', err);
        this.errorMessage = 'Erreur lors de l\'achat de crédits';
        this.loading = false;
      }
    });
  }
}
