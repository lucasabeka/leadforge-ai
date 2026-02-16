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
  errorMessage = '';

  packages = [
    { credits: 100, price: 19, popular: false },
    { credits: 500, price: 79, popular: true, savings: '17%' },
    { credits: 1000, price: 139, popular: false, savings: '30%' },
    { credits: 5000, price: 599, popular: false, savings: '40%' }
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

  purchasePackage(credits: number, price: number) {
    this.loading = true;
    this.errorMessage = '';

    console.log('🔄 Création session Stripe...', { credits, price });

    this.creditService.createCheckoutSession(credits, price).subscribe({
      next: (response) => {
        console.log('✅ Session créée:', response);

        // Rediriger vers Stripe Checkout
        if (response.url) {
          window.location.href = response.url;
        } else {
          this.errorMessage = 'URL de paiement manquante';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ Erreur création session:', err);
        this.errorMessage = 'Erreur lors de la création du paiement';
        this.loading = false;
      }
    });
  }
}
