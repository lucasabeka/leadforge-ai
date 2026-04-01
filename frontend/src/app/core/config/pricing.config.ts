export interface CreditPackage {
  credits: number;
  price: number;
  popular: boolean;
  savings?: string;
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  popular: boolean;
  description: string;
  features: string[];
  creditsPerMonth: number;
}

/**
 * Packs de crédits à l'achat (paiement unique)
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  { credits: 100, price: 19, popular: false },
  { credits: 500, price: 79, popular: true, savings: '17%' },
  { credits: 1000, price: 139, popular: false, savings: '30%' },
  { credits: 5000, price: 599, popular: false, savings: '40%' }
];

/**
 * Plans d'abonnement mensuels (affichés sur la landing page)
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Starter',
    price: 9,
    popular: false,
    description: 'Pour tester et décrocher tes premiers clients',
    creditsPerMonth: 50,
    features: ['50 crédits / mois', 'Emails IA inclus', 'Export CSV', 'Support email']
  },
  {
    name: 'Pro',
    price: 19,
    popular: true,
    description: 'Pour les freelances qui veulent scaler',
    creditsPerMonth: 150,
    features: ['150 crédits / mois', 'Emails IA premium', 'Export CSV', 'Score de qualification', 'Support prioritaire']
  },
  {
    name: 'Scale',
    price: 39,
    popular: false,
    description: 'Pour les freelances très actifs',
    creditsPerMonth: 400,
    features: ['400 crédits / mois', 'Tout le plan Pro', 'Campagnes illimitées', 'Accès API', 'Support dédié']
  }
];
