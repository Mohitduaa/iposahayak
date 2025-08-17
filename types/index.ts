export interface IPO {
  id: string;
  companyName: string;
  openDate: string;
  closeDate: string;
  listingDate?: string;
  issuePrice: string;
  lotSize: number;
  status: 'upcoming' | 'ongoing' | 'closed' | 'listed';
  registrar: 'kfintech' | 'linkintime' | 'other';
  gmp?: number;
  gmpChange?: number;
  subscription: {
    retail: number;
    qib: number;
    hni: number;
  };
  category: string;
  totalIssueSize: string;
  faceValue: number;
  priceRange: string;
  logo?: string;
}

export interface AllotmentStatus {
  pan: string;
  status: 'allotted' | 'not_allotted' | 'no_record';
  shares?: number;
  amount?: number;
  refundAmount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  subscriptionEnd?: string;
  panNumbers: string[];
  alerts: AlertPreference[];
}

export interface AlertPreference {
  id: string;
  type: 'new_ipo' | 'allotment' | 'gmp_threshold' | 'listing';
  enabled: boolean;
  threshold?: number;
  ipos?: string[];
}

export interface GMPData {
  ipoId: string;
  date: string;
  gmp: number;
  change: number;
  kostak: number;
  subject: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  popular?: boolean;
}