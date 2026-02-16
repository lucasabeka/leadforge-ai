import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CreditService } from '../../../core/services/credit.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-purchase-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class PurchaseSuccessComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';
  purchasedCredits = 0;
  currentCredits = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private creditService: CreditService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!sessionId) {
      this.errorMessage = 'Session invalide';
      this.loading = false;
      return;
    }

    console.log('🔄 Confirmation paiement...', sessionId);

    this.creditService.confirmPayment(sessionId).subscribe({
      next: (response) => {
        console.log('✅ Paiement confirmé:', response);
        this.success = true;
        this.purchasedCredits = response.purchased;
        this.currentCredits = response.credits;

        // Rafraîchir les données utilisateur
        this.authService.refreshCurrentUser().subscribe();

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur confirmation:', err);
        this.errorMessage = 'Impossible de confirmer le paiement';
        this.loading = false;
      }
    });
  }
}
