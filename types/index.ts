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
  /** Set by the closed-IPO endpoint, which orders the Allotment tab by them. */
  listedToday?: boolean;
  allotmentToday?: boolean;
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
  /**
   * unknown: the registrar returned a record but did not say whether shares
   * were allotted. error: the lookup itself failed, see `message`.
   */
  status: 'allotted' | 'not_allotted' | 'no_record' | 'unknown' | 'error';
  /** Shares applied for */
  shares?: number;
  amount?: number;
  refundAmount?: number;
  /** The registrars return these too; the type never listed them. */
  name?: string;
  applicationNo?: string;
  dpId?: string;
  allottedShares?: number;
  message?: string;
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