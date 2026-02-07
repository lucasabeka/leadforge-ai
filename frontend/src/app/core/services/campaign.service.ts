import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Campaign {
  id: number;
  name: string;
  industry: string;
  companySize: string;
  location: string;
  jobTitle: string;
  painPoint: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  prospectsCount: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Prospect {
  id: number;
  name: string;
  company: string;
  jobTitle: string;
  email: string;
  linkedinUrl: string;
  location: string;
  emailSubject: string;
  emailBody: string;
  qualificationScore: number;
  createdAt: Date;
}

export interface CampaignRequest {
  name: string;
  industry: string;
  companySize: string;
  location: string;
  jobTitle: string;
  painPoint: string;
  numberOfProspects: number;  // NOUVEAU
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  create(data: CampaignRequest): Observable<Campaign> {
    return this.http.post<Campaign>(
      `${this.apiUrl}/campaigns`,
      data,
      { headers: this.getHeaders() }
    );
  }

  list(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(
      `${this.apiUrl}/campaigns`,
      { headers: this.getHeaders() }
    );
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(
      `${this.apiUrl}/campaigns/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getProspects(campaignId: number): Observable<Prospect[]> {
    return this.http.get<Prospect[]>(
      `${this.apiUrl}/campaigns/${campaignId}/prospects`,
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
