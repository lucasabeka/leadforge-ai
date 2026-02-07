export interface User {
  id: number;
  email: string;
  name: string;
  credits: number;
  plan: SubscriptionPlan;
  createdAt: Date;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}
