import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CREDIT_PACKAGES } from '../../../core/config/pricing.config';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  features = [
    {
      icon: '🎯',
      title: 'Ciblage ultra-précis',
      description: 'Dis-nous ta stack (React, Node, Flutter...) et le type de clients que tu cherches. On fait le reste.'
    },
    {
      icon: '🤖',
      title: 'Emails générés par IA',
      description: 'Chaque email est personnalisé pour ton prospect : entreprise, poste, contexte. Pas de template générique.'
    },
    {
      icon: '⚡',
      title: 'Prêt en 2 minutes',
      description: 'Lance une campagne de 15 prospects en moins de 2 minutes. Les emails arrivent pendant que tu travailles.'
    },
    {
      icon: '📊',
      title: 'Score de qualification',
      description: 'Chaque prospect est scoré sur 100. Tu sais directement sur qui concentrer ton énergie.'
    },
    {
      icon: '📤',
      title: 'Export & envoi direct',
      description: 'Copie les emails, exporte en CSV, ou ouvre directement dans ton client mail via mailto.'
    },
    {
      icon: '💳',
      title: 'Paiement à l\'usage',
      description: 'Tu paies seulement les crédits que tu utilises. Aucun abonnement forcé, aucun engagement.'
    }
  ];

  steps = [
    {
      title: 'Décris ton profil',
      description: 'Ta stack technique et le type de client que tu vises. Startup, PME ou agence — tu choisis.'
    },
    {
      title: 'On génère les prospects',
      description: 'Notre IA trouve des contacts pertinents et rédige un email personnalisé pour chacun.'
    },
    {
      title: 'Tu envoies et tu signes',
      description: 'Copie les emails, ajuste si besoin, et envoie. Plus qu\'à attendre les réponses.'
    }
  ];

  plans = CREDIT_PACKAGES;
}
