import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CampaignService, Campaign, Prospect } from '../../../core/services/campaign.service';
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  campaign?: Campaign;
  prospects: Prospect[] = [];
  filteredProspects: Prospect[] = [];
  selectedProspect?: Prospect;

  searchTerm = '';
  sortBy = 'score';
  loading = true;

  private pollingSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    this.loadCampaign(id);

    // Poll toutes les 5 secondes si en cours
    this.pollingSubscription = interval(5000).subscribe(() => {
      if (this.campaign?.status === 'PROCESSING') {
        this.loadCampaign(id);
      }
    });
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  loadCampaign(id: number) {
    this.campaignService.getById(id).subscribe({
      next: (campaign) => {
        this.campaign = campaign;
        this.loading = false;

        if (campaign.status === 'COMPLETED') {
          this.loadProspects(id);
        }
      },
      error: (err) => {
        console.error('Error loading campaign:', err);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadProspects(campaignId: number) {
    this.campaignService.getProspects(campaignId).subscribe({
      next: (prospects) => {
        this.prospects = prospects;
        this.filteredProspects = prospects;
        this.sortProspects();
      },
      error: (err) => {
        console.error('Error loading prospects:', err);
      }
    });
  }

  onSearchChange() {
    if (!this.searchTerm) {
      this.filteredProspects = this.prospects;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredProspects = this.prospects.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.company.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    }
    this.sortProspects();
  }

  sortProspects() {
    switch (this.sortBy) {
      case 'score':
        this.filteredProspects.sort((a, b) => b.qualificationScore - a.qualificationScore);
        break;
      case 'name':
        this.filteredProspects.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'company':
        this.filteredProspects.sort((a, b) => a.company.localeCompare(b.company));
        break;
    }
  }

  viewEmail(prospect: Prospect) {
    this.selectedProspect = prospect;
  }

  closeModal() {
    this.selectedProspect = undefined;
  }

  copyEmail(prospect: Prospect) {
    const text = `Sujet: ${prospect.emailSubject}\n\n${prospect.emailBody}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Email copié dans le presse-papiers !');
    });
  }

  copyAllEmails() {
    const emails = this.prospects.map(p => p.email).join(', ');
    navigator.clipboard.writeText(emails).then(() => {
      alert(`${this.prospects.length} emails copiés !`);
    });
  }

  exportCSV() {
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${this.campaign?.name}-prospects.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateCSV(): string {
    const headers = ['Nom', 'Entreprise', 'Poste', 'Email', 'LinkedIn', 'Score', 'Sujet', 'Corps Email'];
    const rows = this.prospects.map(p => [
      p.name,
      p.company,
      p.jobTitle,
      p.email,
      p.linkedinUrl,
      p.qualificationScore.toString(),
      `"${p.emailSubject}"`,
      `"${p.emailBody.replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  generateMailtoLink(prospect: Prospect): string {
    const subject = encodeURIComponent(prospect.emailSubject);
    const body = encodeURIComponent(prospect.emailBody);
    return `mailto:${prospect.email}?subject=${subject}&body=${body}`;
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

  getProgressPercentage(): number {
    if (!this.campaign) return 0;
    if (this.campaign.status === 'COMPLETED') return 100;
    if (this.campaign.status === 'PROCESSING') return 50;
    return 0;
  }
}
