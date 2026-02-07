import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CampaignService, Campaign } from '../../core/services/campaign.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  campaigns: Campaign[] = [];
  loading = true;
  stats = {
    campaigns: 0,
    prospects: 0,
    credits: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private campaignService: CampaignService,
    private router: Router
  ) {}

  get user$() {
    return this.authService.currentUser$;
  }

  ngOnInit() {
    // Charger les données initiales
    this.loadAllData();

    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.stats.credits = user.credits;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les données du dashboard
   * Cette méthode est appelée à l'initialisation ET quand on revient sur la page
   */
  private loadAllData() {
    // Rafraîchir les données utilisateur depuis le serveur
    this.refreshUserData();

    // Charger les campagnes
    this.loadCampaigns();
  }

  /**
   * Rafraîchit les données utilisateur depuis le serveur
   */
  private refreshUserData() {
    // Si la méthode refreshCurrentUser existe dans AuthService
    if (typeof this.authService.refreshCurrentUser === 'function') {
      this.authService.refreshCurrentUser().subscribe({
        next: (user) => {
          if (user) {
            this.stats.credits = user.credits;
          }
        },
        error: (err) => {
          console.error('Error refreshing user data:', err);
        }
      });
    } else {
      // Sinon, forcer une récupération via getCurrentUser ou similaire
      // Cette partie dépend de votre implémentation d'AuthService
      console.warn('refreshCurrentUser method not available in AuthService');
    }
  }

  loadCampaigns() {
    this.campaignService.list().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns;
        this.stats.campaigns = campaigns.length;
        this.stats.prospects = campaigns.reduce((sum, c) => sum + (c.prospectsCount || 0), 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading campaigns:', err);
        this.loading = false;
      }
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
