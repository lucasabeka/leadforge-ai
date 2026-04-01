import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CampaignService, Campaign } from '../../core/services/campaign.service';
import { AppSidebarComponent } from '../../shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private campaignService: CampaignService,
  ) {}

  get credits(): number {
    return this.authService.getCurrentUser()?.credits ?? 0;
  }

  get totalProspects(): number {
    return this.campaigns.reduce((sum, c) => sum + (c.prospectsCount || 0), 0);
  }

  get completedCount(): number {
    return this.campaigns.filter(c => c.status === 'COMPLETED').length;
  }

  ngOnInit() {
    this.authService.refreshCurrentUser().subscribe({ error: () => {} });
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.campaignService.list().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'PROCESSING': 'En cours',
      'COMPLETED': 'Terminée',
      'FAILED': 'Échouée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'status-pending',
      'PROCESSING': 'status-processing',
      'COMPLETED': 'status-completed',
      'FAILED': 'status-failed'
    };
    return classes[status] || '';
  }

}
