import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { CampaignService, CampaignRequest } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy {
  currentStep = 1;
  loading = false;
  error = '';
  userCredits = 0;
  draftLoaded = false;  // ← NOUVEAU : Flag pour afficher notification

  private destroy$ = new Subject<void>();
  private formChange$ = new Subject<void>();  // ← NOUVEAU : Pour debounce
  private readonly STORAGE_KEY = 'draft_campaign';

  campaign: CampaignRequest = {
    name: '',
    industry: '',
    companySize: '',
    location: '',
    jobTitle: '',
    painPoint: '',
    numberOfProspects: 50
  };

  industries = [
    'Marketing Digital',
    'E-commerce',
    'SaaS B2B',
    'Consulting',
    'Agence Web',
    'Agence Marketing',
    'Services Financiers',
    'Immobilier',
    'Formation',
    'Santé & Bien-être'
  ];

  companySizes = [
    '1-10 employés',
    '11-50 employés',
    '51-200 employés',
    '201-500 employés',
    '500+ employés'
  ];

  constructor(
    private campaignService: CampaignService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // S'abonner aux changements de crédits
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userCredits = user.credits;
          console.log('💰 Crédits disponibles:', this.userCredits);
        }
      });

    // Charger le brouillon sauvegardé
    this.loadDraft();

    // ← NOUVEAU : Sauvegarder automatiquement à chaque changement (avec debounce)
    this.formChange$
      .pipe(
        debounceTime(1000),  // Attendre 1 seconde après le dernier changement
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveDraft();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get creditCost(): number {
    return this.campaign.numberOfProspects || 50;
  }

  hasEnoughCredits(): boolean {
    return this.userCredits >= this.creditCost;
  }

  // ← NOUVEAU : Déclencher la sauvegarde à chaque changement
  onFormChange() {
    this.formChange$.next();
  }

  // Charger le brouillon depuis localStorage
  private loadDraft() {
    try {
      const draft = localStorage.getItem(this.STORAGE_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        this.campaign = parsedDraft.campaign;
        this.currentStep = parsedDraft.currentStep || 1;
        this.draftLoaded = true;  // ← Activer la notification
        console.log('📋 Brouillon chargé:', this.campaign);

        // Masquer la notification après 5 secondes
        setTimeout(() => {
          this.draftLoaded = false;
        }, 5000);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Sauvegarder le brouillon dans localStorage
  private saveDraft() {
    try {
      const draft = {
        campaign: this.campaign,
        currentStep: this.currentStep,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(draft));
      console.log('💾 Brouillon sauvegardé automatiquement');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
    }
  }

  // Supprimer le brouillon
  private clearDraft() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Brouillon supprimé');
  }

  // ← NOUVEAU : Effacer le brouillon et recommencer
  clearDraftAndRestart() {
    this.clearDraft();
    this.campaign = {
      name: '',
      industry: '',
      companySize: '',
      location: '',
      jobTitle: '',
      painPoint: '',
      numberOfProspects: 50
    };
    this.currentStep = 1;
    this.draftLoaded = false;
    this.error = '';
    console.log('🔄 Formulaire réinitialisé');
  }

  nextStep() {
    if (this.validateStep()) {
      this.currentStep++;
      this.error = '';
      this.saveDraft();
    }
  }

  previousStep() {
    this.currentStep--;
    this.error = '';
    this.saveDraft();
  }

  validateStep(): boolean {
    switch (this.currentStep) {
      case 1:
        if (!this.campaign.name || !this.campaign.industry) {
          this.error = 'Veuillez remplir tous les champs';
          return false;
        }
        break;
      case 2:
        if (!this.campaign.companySize || !this.campaign.location || !this.campaign.jobTitle) {
          this.error = 'Veuillez remplir tous les champs';
          return false;
        }
        break;
      case 3:
        if (!this.campaign.painPoint) {
          this.error = 'Veuillez remplir le pain point';
          return false;
        }
        if (!this.campaign.numberOfProspects || this.campaign.numberOfProspects < 10 || this.campaign.numberOfProspects > 200) {
          this.error = 'Le nombre de prospects doit être entre 10 et 200';
          return false;
        }
        if (!this.hasEnoughCredits()) {
          this.error = `Crédits insuffisants. Il vous manque ${this.creditCost - this.userCredits} crédits.`;
          return false;
        }
        break;
    }
    return true;
  }

  // Aller acheter des crédits en sauvegardant le formulaire
  goToBuyCredits() {
    this.saveDraft();  // Sauvegarder explicitement avant de partir
    console.log('🛒 Redirection vers achat de crédits (brouillon sauvegardé)');
    this.router.navigate(['/credits/purchase']);
  }

  onSubmit() {
    if (!this.validateStep()) {
      return;
    }

    if (!this.hasEnoughCredits()) {
      this.error = 'Crédits insuffisants pour créer cette campagne.';
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('📤 Données envoyées:', this.campaign);

    this.campaignService.create(this.campaign).subscribe({
      next: (campaign) => {
        console.log('✅ Campagne créée:', campaign);

        // Supprimer le brouillon après succès
        this.clearDraft();

        // Rafraîchir les crédits après création
        console.log('🔄 Rafraîchissement des crédits...');
        this.authService.refreshCurrentUser().subscribe({
          next: (user) => {
            console.log('💰 Crédits mis à jour:', user.credits);
            this.router.navigate(['/campaigns', campaign.id]);
          },
          error: (refreshError) => {
            console.warn('⚠️ Erreur rafraîchissement crédits (non bloquant):', refreshError);
            this.router.navigate(['/campaigns', campaign.id]);
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur complète:', err);
        this.loading = false;

        if (err.status === 401) {
          this.error = 'Session expirée. Veuillez vous reconnecter.';
        } else if (err.status === 402) {
          this.error = err.error || 'Crédits insuffisants.';
          this.authService.refreshCurrentUser().subscribe();
        } else if (err.error) {
          this.error = typeof err.error === 'string' ? err.error : 'Erreur lors de la création de la campagne';
        } else {
          this.error = 'Erreur de connexion au serveur';
        }
      }
    });
  }
}
