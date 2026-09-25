// Finds an IPO's entry in its registrar's own company list.
//
// The allotment lookup is addressed by the registrar's internal company id,
// not by the IPO name we hold, so the two have to be matched up. A registrar
// only publishes a company once allotment is finalised, which is why a lookup
// can legitimately come back empty — that means "not out yet", not "failed".
//
// The backend gathers every registrar's list into one call; the app used to
// fetch two registrars itself and had no way to check the other seven.

import { apiUrl, fetchJson } from './api';

export type RegistrarType =
  | 'MUFG'
  | 'BIGSHARE'
  | 'KFIN'
  | 'CAMEO'
  | 'SKYLINE'
  | 'MAASHITLA'
  | 'PURVA'
  | 'INTEGRATED'
  | 'MAS';

export interface RegistrarCompany {
  value: string;
  name: string;
  companyType: RegistrarType;
  /** The registrar's display name, e.g. "KFin Technologies" */
  registrar: string;
  /**
   * True when the backend matched this row to an issue that closed in the
   * last few weeks. Registrars keep companies listed for years; the picker
   * shows only the current ones.
   */
  current: boolean;
  /** Our own name for the issue, when matched */
  ipoName?: string;
  closeDate?: string;
}

let cache: { at: number; companies: RegistrarCompany[] } | null = null;
let inFlight: Promise<RegistrarCompany[]> | null = null;

const CACHE_MINUTES = 15;

/** "Deepa Jewellers Limited - SME IPO" -> "deepa jewellers" */
function normalise(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(limited|ltd|pvt|private|public|issue|sme|ipo|fpo|nfo|india)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const NAME_PATTERNS: [RegistrarType, RegExp][] = [
  ['MUFG', /mufg|mugf|link\s*intime|mpms/i],
  ['KFIN', /kfin|karvy/i],
  ['BIGSHARE', /bigshare|big\s*share/i],
  ['CAMEO', /cameo/i],
  ['SKYLINE', /skyline/i],
  ['MAASHITLA', /maashitla/i],
  ['PURVA', /purva/i],
  ['INTEGRATED', /integrated/i],
  ['MAS', /\bmas\b/i],
];

/** "Bigshare Services Pvt.Ltd." -> "BIGSHARE"; null when it is none we know. */
export function registrarKeyFromName(name?: string | null): RegistrarType | null {
  const text = String(name || '');
  const hit = NAME_PATTERNS.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : null;
}

export async function loadRegistrarCompanies(): Promise<RegistrarCompany[]> {
  if (cache && (Date.now() - cache.at) / 60000 < CACHE_MINUTES) return cache.companies;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      // The backend may have to read nine registrar sites on a cold cache
      const data = await fetchJson<{ companies?: any[] }>(apiUrl('/registrar-companies'), {
        timeoutMs: 45000,
      });

      const companies: RegistrarCompany[] = (data?.companies || [])
        .filter((row) => row?.value && row?.name && row?.companyType)
        .map((row) => ({
          value: String(row.value),
          name: String(row.name),
          companyType: String(row.companyType).toUpperCase() as RegistrarType,
          registrar: String(row.registrar || row.companyType),
          current: Boolean(row.current),
          ipoName: row.ipoName ? String(row.ipoName) : undefined,
          closeDate: row.closeDate ? String(row.closeDate) : undefined,
        }));

      if (companies.length) cache = { at: Date.now(), companies };
      return companies;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function bestMatch(ipoName: string, companies: RegistrarCompany[]): RegistrarCompany | null {
  const target = normalise(ipoName);
  if (!target) return null;

  // The backend already matched each listing to our own IPO names — with
  // abbreviation handling this fuzzy pass does not have ("NSE" against
  // "National Stock Exchange Of India Limited"). Trust its verdict first.
  const backendMatched = companies.find(
    (company) => company.ipoName && normalise(company.ipoName) === target
  );
  if (backendMatched) return backendMatched;

  const scored = companies.map((company) => ({ company, name: normalise(company.name) }));

  const exact = scored.find((row) => row.name === target);
  if (exact) return exact.company;

  const prefix = scored.find((row) => row.name.startsWith(target) || target.startsWith(row.name));
  if (prefix) return prefix.company;

  // Every meaningful word of the shorter name present in the longer one
  const targetWords = target.split(' ').filter((word) => word.length > 2);
  if (!targetWords.length) return null;

  const overlap = scored.find((row) => {
    const words = row.name.split(' ').filter((word) => word.length > 2);
    const shorter = targetWords.length <= words.length ? targetWords : words;
    const longer = targetWords.length <= words.length ? words : targetWords;
    // One shared word is not a match: "QT Foods" is not "Shivashrit Foods"
    if (shorter.length < 2) return false;
    return shorter.every((word) => longer.includes(word));
  });

  return overlap ? overlap.company : null;
}

/**
 * Matches an IPO name against the registrar lists. Exact first, then a prefix,
 * then a strong word overlap — registrar listings carry suffixes ("- SME IPO")
 * and legal forms that our own names do not.
 *
 * When the IPO says which registrar it uses, that registrar's list is tried
 * first: two registrars can list companies with similar names, and the one
 * named on the IPO is the one holding its allotment.
 */
export async function findRegistrarCompany(
  ipoName: string,
  registrarName?: string | null
): Promise<RegistrarCompany | null> {
  const companies = await loadRegistrarCompanies();
  if (!companies.length) return null;

  const key = registrarKeyFromName(registrarName);
  if (key) {
    const own = companies.filter((company) => company.companyType === key);
    const match = bestMatch(ipoName, own);
    if (match) return match;
  }

  return bestMatch(ipoName, companies);
}
