import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  constructor(private apiService: ApiService) {}

  getBalance(): Observable<any> {
    return this.apiService.get('credits/balance');
  }

  /**
   * Crée une session Stripe Checkout
   */
  createCheckoutSession(credits: number, price: number): Observable<any> {
    return this.apiService.post('credits/create-checkout-session', {
      credits,
      price
    });
  }

  /**
   * Confirme le paiement après retour de Stripe
   */
  confirmPayment(sessionId: string): Observable<any> {
    return this.apiService.get(`credits/confirm-payment?session_id=${sessionId}`);
  }
}
