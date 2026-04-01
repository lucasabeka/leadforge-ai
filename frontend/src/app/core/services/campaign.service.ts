import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  numberOfProspects: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(data: CampaignRequest): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.apiUrl}/campaigns`, data);
  }

  list(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns`);
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/campaigns/${id}`);
  }

  getProspects(campaignId: number): Observable<Prospect[]> {
    return this.http.get<Prospect[]>(`${this.apiUrl}/campaigns/${campaignId}/prospects`);
  }
}
