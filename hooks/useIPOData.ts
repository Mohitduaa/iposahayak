import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPO } from '@/types';
import { apiUrl, fetchJson } from '@/services/api';

// ---------------------------------------------------------------------------
// One store, shared by every caller.
//
// useIPOData() is called from the global provider, the dashboard and the search
// screen. Each call used to keep its own state, run its own fetch on mount and
// start its own 30-minute interval, so opening the app fired the same requests
// three times over and held three copies of the list in memory. The state now
// lives in this module and the hook only subscribes to it.
// ---------------------------------------------------------------------------

const CACHE_KEY = 'ipo_data_cache_v2';
const CACHE_EXPIRY_MINUTES = 30;

type Store = {
  ipos: IPO[];
  rawIPOs: any[];
  mainboardIPOs: IPO[];
  smeIPOs: IPO[];
  loading: boolean;
};

let store: Store = { ipos: [], rawIPOs: [], mainboardIPOs: [], smeIPOs: [], loading: false };

const listeners = new Set<(s: Store) => void>();
let inFlight: Promise<void> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let hydrated = false;

function setStore(patch: Partial<Store>) {
  store = { ...store, ...patch };
  listeners.forEach((listener) => listener(store));
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

// The API sends short month names ("Sept", "Oct"), and the old map held mostly
// full names plus "Sep". Every other month fell through to a hardcoded '08', so
// "1-3 Sept" was read as 1-3 August — which put every open IPO in the past and
// left the Live tab empty.
const monthMap: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', sept: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

const monthNumber = (name: string) => monthMap[String(name || '').toLowerCase()] || null;

const parseDateRange = (range: string, referenceDate?: string, apiYear?: number | null) => {
  const unknown = { open: 'Will be announced soon', close: 'Will be announced soon' };

  // The scraped range carries no year. The API works out which one it belongs
  // to and sends it as `year`; the listing/allotment date is the fallback.
  let year = apiYear || new Date().getFullYear();
  if (!apiYear && referenceDate) {
    const yearMatch = referenceDate.match(/(\d{4})/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);
  }

  if (!range || /tba/i.test(range)) return unknown;

  const match = range.match(/(\d{1,2})-(\d{1,2})\s+([A-Za-z]+)/);
  if (!match) return unknown;

  const [, start, end, month] = match;
  const closeMonth = monthNumber(month);
  if (!closeMonth) return unknown;

  let openMonth = closeMonth;
  let openYear = year;

  // "28-1 Sept" runs from 28 August to 1 September
  if (parseInt(start, 10) > parseInt(end, 10)) {
    const previous = parseInt(closeMonth, 10) - 1;
    openMonth = (previous === 0 ? 12 : previous).toString().padStart(2, '0');
    if (previous === 0) openYear = year - 1;
  }

  return {
    open: `${openYear}-${openMonth}-${start.padStart(2, '0')}`,
    close: `${year}-${closeMonth}-${end.padStart(2, '0')}`,
  };
};

/** The API's own verdict, which knows the year and is the same one the site uses. */
const statusFromAPI = (apiStatus?: string): IPO['status'] | null => {
  switch (String(apiStatus || '').toLowerCase()) {
    case 'live':
    case 'open':
      return 'ongoing';
    case 'upcoming':
      return 'upcoming';
    case 'closed':
      return 'closed';
    default:
      return null;
  }
};

const getStatus = (openDate: string, closeDate: string, itemStatus?: string): IPO['status'] => {
  const fromAPI = statusFromAPI(itemStatus);
  if (fromAPI) return fromAPI;

  if (openDate === 'Will be announced soon' || closeDate === 'Will be announced soon') {
    return 'upcoming';
  }

  const now = new Date();
  const open = new Date(openDate);
  const closeAtFivePM = new Date(closeDate);
  closeAtFivePM.setHours(17, 0, 0, 0);

  if (now > closeAtFivePM) return 'closed';
  if (now >= open) return 'ongoing';
  return 'upcoming';
};

const parseQuota = (quota?: string) => (quota ? parseFloat(quota.replace('%', '')) || 0 : 0);

const toTimes = (value?: string) => {
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * How many times each category is subscribed, read from the live category
 * table. The reservation percentages are a different number entirely — showing
 * "35%" as "35x subscribed" was telling people an issue was 35 times covered
 * when nothing had been bid yet.
 */
const readSubscription = (categories: any[]) => {
  const rows = Array.isArray(categories) ? categories : [];
  const find = (test: (name: string) => boolean) => {
    const row = rows.find((c) => test(String(c?.category || '')));
    return row ? toTimes(row.subscription) : 0;
  };

  return {
    retail: find((name) => /retail/i.test(name)),
    qib: find((name) => /institutional/i.test(name) && !/non/i.test(name)),
    hni: find((name) => /non[- ]?institutional|nii|hni/i.test(name)),
    any: rows.length > 0,
  };
};

export const mapAPIData = (data: any[]): IPO[] =>
  (data || [])
    .filter((item: any) => item?.name && item.name !== 'Stock / IPO')
    .map((item: any, index: number) => {
      const { open, close } = parseDateRange(
        item.date || '',
        item.listingDate || item.allotmentDate,
        item.year
      );
      const gmpValue = parseInt(String(item.gmp || '0').replace(/[₹,+-]/g, ''), 10) || 0;
      const subscription = readSubscription(item.subscriptionCategories);
      const overallSubscribed = toTimes(item.subscribed);

      return {
        // The name is stable across refreshes; the array index was not, so a
        // list that reordered remounted every card instead of reusing them.
        id: String(item._id || item.name || index),
        companyName: String(item.name || 'N/A'),
        openDate: String(open || ''),
        closeDate: String(close || ''),
        issuePrice: String(item.price || 'N/A'),
        registrar: String(item.Registerare || item.registerar || item.registrar || ''),
        lotSize: String(item.lotSize || ''),
        status: getStatus(open, close, item.status),
        gmp: gmpValue,
        gain: String(item.gain && item.gain !== '-%' ? item.gain : '0'),
        gmpChange: 0,
        subscription: {
          retail: subscription.retail,
          qib: subscription.qib,
          hni: subscription.hni,
        },
        quota: {
          retail: parseQuota(item.retailQuota),
          qib: parseQuota(item.qibQuota),
          hni: parseQuota(item.hniQuota),
        },
        hasSubscriptionData: subscription.any || overallSubscribed > 0,
        listedToday: Boolean(item.listedToday),
        allotmentToday: Boolean(item.allotmentToday),
        allotmentout: String(item.allotment || ''),
        allotment: String(item.allotmentDate || ''),
        listingDate: String(item.listingDate || ''),
        subscribed: String(item.subscribed || ''),
        category: String(item.type || 'Mainboard'),
        totalIssueSize: String(item.IssueSize || 'N/A'),
        faceValue: Number(item.faceValue) || 0,
        priceRange: String(item.priceRange || ''),
      } as IPO;
    });

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

const isCacheExpired = (timestamp: number) => (Date.now() - timestamp) / 60000 > CACHE_EXPIRY_MINUTES;

async function loadFromCache() {
  try {
    const cache = await AsyncStorage.getItem(CACHE_KEY);
    if (!cache) return false;

    const parsed = JSON.parse(cache);
    // Stale data is still shown while the refresh runs — an empty screen is a
    // worse answer than a slightly old one.
    setStore({
      ipos: parsed.data || [],
      rawIPOs: parsed.raw || [],
      mainboardIPOs: parsed.mainboard || [],
      smeIPOs: parsed.sme || [],
    });
    return !isCacheExpired(parsed.timestamp);
  } catch (error) {
    console.warn('Failed to load IPO cache:', error);
    return false;
  }
}

export async function refreshData() {
  // Three screens mounting at once asked for the same data three times over
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      setStore({ loading: store.ipos.length === 0 });

      // Only what these screens show. The closed tab has its own paginated
      // endpoint, so pulling all 300-odd closed records here was downloading
      // roughly 600 records to display fourteen.
      //
      // dated=true drops the issues still marked TBA. They are announced, but
      // a card has no dates, price band or lot size to show for them, so they
      // read as broken rows rather than as upcoming IPOs.
      const data = await fetchJson<{ ipos?: any[] }>(
        apiUrl('/upcoming-ipos?status=upcoming,live&dated=true')
      );
      const list = data?.ipos || [];

      // Keep whatever is cached if the request failed outright
      if (!data) return;

      const mapped = mapAPIData(list);
      const mainboard = mapped.filter((ipo) => ipo.category !== 'SME');
      const sme = mapped.filter((ipo) => ipo.category === 'SME');

      setStore({ ipos: mapped, rawIPOs: list, mainboardIPOs: mainboard, smeIPOs: sme });

      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: mapped, raw: list, mainboard, sme })
      );
    } catch (error) {
      console.error('Error fetching IPOs:', error);
    } finally {
      setStore({ loading: false });
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Server-side search and paging over closed IPOs — the app never holds them all. */
export async function fetchClosedIPOsWithSearch(
  search: string = '',
  page: number = 1,
  limit: number = 10,
  type?: 'mainboard' | 'sme'
) {
  const empty = { success: false, data: [] as any[], total: 0, page: 1, limit, totalPages: 0 };

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (type) params.set('type', type);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const result = await fetchJson<any>(apiUrl(`/api/closed-iposs/app?${params.toString()}`));
  if (!result?.success || !result?.data) return empty;

  return {
    success: true,
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

async function initialise() {
  if (hydrated) return;
  hydrated = true;

  const fresh = await loadFromCache();
  if (!fresh) await refreshData();
  else setTimeout(() => refreshData(), 1000);

  // One timer for the whole app, not one per hook instance
  if (!refreshTimer) {
    refreshTimer = setInterval(() => refreshData(), CACHE_EXPIRY_MINUTES * 60 * 1000);
  }
}

export function useIPOData() {
  const [snapshot, setSnapshot] = useState<Store>(store);

  useEffect(() => {
    listeners.add(setSnapshot);
    setSnapshot(store);
    initialise();
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);

  return {
    ipos: snapshot.ipos,
    rawIPOs: snapshot.rawIPOs,
    loading: snapshot.loading,
    mainboardIPOs: snapshot.mainboardIPOs,
    smeIPOs: snapshot.smeIPOs,
    getMainboardIPOs: () => snapshot.mainboardIPOs,
    getSMEIPOs: () => snapshot.smeIPOs,
    allotmentData: [] as any[],
    refreshData,
    fetchClosedIPOsWithSearch,
    fetchMainboardIPOs: (search = '', page = 1, limit = 10) =>
      fetchClosedIPOsWithSearch(search, page, limit, 'mainboard'),
    fetchSMEIPOs: (search = '', page = 1, limit = 10) =>
      fetchClosedIPOsWithSearch(search, page, limit, 'sme'),
    mapAPIData,
  };
}
