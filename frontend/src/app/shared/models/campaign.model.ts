export interface Campaign {
  id: number;
  name: string;
  industry: string;
  companySize: string;
  location: string;
  jobTitle: string;
  painPoint: string;
  status: CampaignStatus;
  prospects?: Prospect[];
  createdAt: Date;
  completedAt?: Date;
}

export enum CampaignStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
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
