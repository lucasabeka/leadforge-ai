import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getBalance(): Observable<{ credits: number }> {
    return this.http.get<{ credits: number }>(
      `${this.apiUrl}/credits/balance`,
      { headers: this.getHeaders() }
    );
  }

  purchaseCredits(amount: number): Observable<{ credits: number; purchased: number }> {
    return this.http.post<{ credits: number; purchased: number }>(
      `${this.apiUrl}/credits/purchase`,
      { amount },
      { headers: this.getHeaders() }
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
