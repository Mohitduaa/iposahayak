export interface IPO {
  id: string;
  companyName: string;
  openDate: string;
  closeDate: string;
  listingDate?: string;
  issuePrice: string;
  lotSize: string;
  status: 'upcoming' | 'ongoing' | 'closed' | 'listed';
  registrar: string;
  gmp?: number;
  gmpChange?: number;
  /** How many times each category has been subscribed, from the live figures. */
  subscription: {
    retail: number;
    qib: number;
    hni: number;
  };
  /** What share of the issue is reserved for each category, in percent. */
  quota: {
    retail: number;
    qib: number;
    hni: number;
  };
  /** True once real subscription figures exist — before that there is nothing to show. */
  hasSubscriptionData: boolean;
  category: string;
  allotment: string;
  allotmentout?: string;
  gain?: string;
  subscribed?: string;
  timeLeft?: string;
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
  /** The registrars return these too; the type never listed them. */
  name?: string;
  applicationNo?: string;
  dpId?: string;
  allottedShares?: number;
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