import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CampaignService, CampaignRequest } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppSidebarComponent } from '../../../shared/components/app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-create-campaign',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppSidebarComponent],
  templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class CreateCampaignComponent implements OnInit {
  @ViewChild('cityInput') cityInputRef?: ElementRef;

  // Form state
  campaignName = '';
  selectedStack = '';
  selectedClientType = '';
  location = '';
  customLocation = '';
  numberOfProspects = 10;

  // UI state
  loading = false;
  errorMessage = '';
  insufficientCredits = false;
  credits = 0;

  // Options — UX ciblée freelance dev
  techStacks = [
    { label: '⚛️ React', value: 'React' },
    { label: '🟢 Node.js', value: 'Node.js' },
    { label: '💙 Flutter', value: 'Flutter' },
    { label: '🟩 Vue.js', value: 'Vue.js' },
    { label: '🅰️ Angular', value: 'Angular' },
    { label: '🐍 Python', value: 'Python' },
    { label: '☕ Java', value: 'Java' },
    { label: '📱 React Native', value: 'React Native' },
    { label: '🔷 TypeScript', value: 'TypeScript' },
    { label: '🛠️ Autre', value: 'Développement web' }
  ];

  clientTypes = [
    { label: '🚀 Startup', value: 'startup' },
    { label: '🏢 PME', value: 'PME' },
    { label: '🎨 Agence', value: 'agence digitale' },
    { label: '🏗️ Grand groupe', value: 'enterprise' }
  ];

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.credits = this.authService.getCurrentUser()?.credits ?? 0;
  }

  selectStack(value: string) {
    this.selectedStack = value;
    // Auto-compléter le nom de campagne si vide
    if (!this.campaignName && this.selectedClientType) {
      this.campaignName = `${value} pour ${this.selectedClientType}`;
    }
  }

  focusCity() {
    this.location = '';
    setTimeout(() => this.cityInputRef?.nativeElement?.focus(), 100);
  }

  get isFormValid(): boolean {
    return !!(this.campaignName.trim() && this.selectedStack && this.selectedClientType && this.location);
  }

  onSubmit() {
    if (!this.isFormValid) {
      this.errorMessage = 'Merci de remplir tous les champs.';
      return;
    }

    if (this.credits < this.numberOfProspects) {
      this.insufficientCredits = true;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.insufficientCredits = false;

    // Traduire les choix simplifiés vers les champs backend
    const request: CampaignRequest = {
      name: this.campaignName,
      industry: this.selectedClientType === 'startup'
        ? 'Tech / Startup'
        : this.selectedClientType === 'agence digitale'
        ? 'Agence digitale'
        : this.selectedClientType === 'enterprise'
        ? 'Grand groupe'
        : 'PME / Scale-up',
      companySize: this.selectedClientType === 'enterprise'
        ? '500-5000 employees'
        : this.selectedClientType === 'startup'
        ? '1-50 employees'
        : '10-200 employees',
      location: this.location,
      jobTitle: 'CTO / Lead Technique / Responsable technique',
      painPoint: `Besoin de compétences ${this.selectedStack} pour accélérer le développement produit`,
      numberOfProspects: this.numberOfProspects
    };

    this.campaignService.create(request).subscribe({
      next: (campaign) => {
        this.router.navigate(['/campaigns', campaign.id]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 402) {
          this.insufficientCredits = true;
        } else {
          this.errorMessage = 'Une erreur est survenue. Réessaie.';
        }
      }
    });
  }

}
