import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { apiUrl, fetchJson } from '@/services/api';

// ---------------------------------------------------------------------------
// Grey market premium, shared by the GMP tab and the global provider.
//
// The hook was called from both, and each copy fetched every upcoming IPO and
// every closed one — around 600 records — then did it again every two minutes.
// It also decided for itself which issues were open, using the same
// assume-the-current-year date parsing that put last year's issues on the
// screen. The API answers both questions now, so this asks it for the fourteen
// records the screen actually shows.
// ---------------------------------------------------------------------------

export interface GMPRow {
  companyName: string;
  gmp: number;
  issuePrice: number;
  /** GMP as a share of the issue price — the listing gain the premium implies. */
  gmpPercent: number;
  subject: number;
  lotSize: number;
  isLive: boolean;
  status: string;
  dateRange: string;
  allotmentDate: string;
  listingDate: string;
  /** Kept for older screens that read `change`. */
  change: number;
  percentage: number;
  kostak: number;
}

type ChartData = { labels: string[]; datasets: { data: number[]; strokeWidth?: number }[] };

type Store = {
  gmpData: GMPRow[];
  chartData: ChartData;
  topGainers: GMPRow[];
  topLosers: GMPRow[];
  loading: boolean;
};

const REFRESH_MINUTES = 2;

let store: Store = {
  gmpData: [],
  chartData: { labels: [], datasets: [{ data: [] }] },
  topGainers: [],
  topLosers: [],
  loading: false,
};

const listeners = new Set<(s: Store) => void>();
let inFlight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let started = false;

function setStore(patch: Partial<Store>) {
  store = { ...store, ...patch };
  listeners.forEach((listener) => listener(store));
}

function parseRupee(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[₹,]/g, '').trim();
  if (!cleaned || cleaned === '-') return 0;
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Upper end of "₹168 to ₹177", or the plain price when there is no band. */
function upperPrice(item: any): number {
  const band = String(item.priceRange || '');
  const numbers = band.match(/\d+(\.\d+)?/g);
  if (numbers && numbers.length) return parseFloat(numbers[numbers.length - 1]);
  return parseRupee(item.price);
}

/** Short enough for a chart axis, but still recognisable. */
function shortLabel(name: string): string {
  const first = String(name || '').split(' ')[0];
  return first.length > 8 ? `${first.slice(0, 8)}…` : first;
}

function buildRows(items: any[]): GMPRow[] {
  return items
    .filter((item) => item?.name)
    .map((item) => {
      const gmp = parseRupee(item.gmp);
      const issuePrice = upperPrice(item);
      const lotSize = parseInt(String(item.lotSize || '').replace(/,/g, ''), 10) || 0;

      // What one lot is worth at the grey market premium
      const subject =
        item.subject && item.subject !== '0' && item.subject !== ''
          ? parseRupee(item.subject)
          : gmp * lotSize;

      // The premium as a percentage of the issue price. This is the number a
      // GMP screen is really about — a ₹28 premium means very different things
      // on a ₹59 issue and on a ₹1,080 one, so ranking by rupees alone put the
      // most expensive shares on top rather than the strongest premiums.
      const gmpPercent = issuePrice > 0 ? (gmp / issuePrice) * 100 : 0;

      return {
        companyName: item.name,
        gmp,
        issuePrice,
        gmpPercent: Math.round(gmpPercent * 10) / 10,
        subject,
        lotSize,
        isLive: String(item.status || '').toLowerCase() === 'live',
        status: item.status || '',
        dateRange: item.date || '',
        allotmentDate: item.allotmentDate || '',
        listingDate: item.listingDate || '',
        change: Math.round(gmpPercent * 10) / 10,
        percentage: Math.round(gmpPercent * 10) / 10,
        kostak: 0,
      };
    });
}

export async function refreshGMPData() {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      setStore({ loading: store.gmpData.length === 0 });

      // A premium only exists while an issue is open or still to come; once it
      // has listed there is nothing left to quote.
      const data = await fetchJson<{ ipos?: any[] }>(
        apiUrl('/upcoming-ipos?status=upcoming,live&dated=true')
      );
      if (!data) return;

      const rows = buildRows(data.ipos || []);

      // Open issues first, then the ones with the strongest premium
      const ranked = [...rows].sort((a, b) => {
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return b.gmpPercent - a.gmpPercent;
      });

      const forChart = ranked.filter((row) => row.gmp > 0).slice(0, 6);

      setStore({
        gmpData: ranked,
        chartData: {
          labels: forChart.map((row) => shortLabel(row.companyName)),
          datasets: [{ data: forChart.map((row) => row.gmp), strokeWidth: 2 }],
        },
        // Gainers and losers are ranked by the premium itself, not by which
        // share happens to cost more. An issue quoted at zero has no premium
        // yet — it is not a loser, and listing three of them under "Top
        // Losers" said something about them that the data does not.
        topGainers: ranked.filter((row) => row.gmpPercent > 0).slice(0, 5),
        topLosers: rows
          .filter((row) => row.gmpPercent < 0)
          .sort((a, b) => a.gmpPercent - b.gmpPercent)
          .slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching GMP data:', error);
    } finally {
      setStore({ loading: false });
      inFlight = null;
    }
  })();

  return inFlight;
}

export function useGMPData(_timeRange?: string) {
  const [snapshot, setSnapshot] = useState<Store>(store);

  useEffect(() => {
    listeners.add(setSnapshot);
    setSnapshot(store);

    if (!started) {
      started = true;
      refreshGMPData();

      // Two minutes is a sensible pace for a premium that moves through the
      // day, and no pace at all is right for an app in the background.
      const start = () => {
        if (!timer) timer = setInterval(() => refreshGMPData(), REFRESH_MINUTES * 60 * 1000);
      };
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      start();
      AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          start();
          refreshGMPData();
        } else {
          stop();
        }
      });
    }

    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);

  return {
    gmpData: snapshot.gmpData,
    chartData: snapshot.chartData,
    topGainers: snapshot.topGainers,
    topLosers: snapshot.topLosers,
    loading: snapshot.loading,
    refreshGMPData,
  };
}
