// Finds an IPO's entry in a registrar's own company list.
//
// The allotment endpoints are addressed by the registrar's internal company id,
// not by the IPO name we hold, so the two have to be matched up. A registrar
// only publishes a company once allotment is finalised, which is why a lookup
// can legitimately come back empty — that means "not out yet", not "failed".

import { apiUrl, fetchJson } from './api';

export type RegistrarType = 'MUFGL' | 'BIGSHARE';

export interface RegistrarCompany {
  value: string;
  name: string;
  companyType: RegistrarType;
}

let cache: { at: number; companies: RegistrarCompany[] } | null = null;
let inFlight: Promise<RegistrarCompany[]> | null = null;

const CACHE_MINUTES = 15;

/** "Deepa Jewellers Limited - SME IPO" -> "deepa jewellers" */
function normalise(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(limited|ltd|pvt|private|public|issue|sme|ipo|fpo|nfo)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function loadRegistrarCompanies(): Promise<RegistrarCompany[]> {
  if (cache && (Date.now() - cache.at) / 60000 < CACHE_MINUTES) return cache.companies;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const [mufg, bigshare] = await Promise.all([
        fetchJson<{ companies?: any[] }>(apiUrl('/mufg-ipo-companies')),
        fetchJson<{ companies?: any[] }>(apiUrl('/bigshare-ipo-companies')),
      ]);

      const map = (rows: any[] | undefined, companyType: RegistrarType): RegistrarCompany[] =>
        (rows || [])
          .filter((row) => row?.value && row.value !== '--Select Company--')
          .map((row) => ({ value: String(row.value), name: String(row.name), companyType }));

      const companies = [
        ...map(mufg?.companies, 'MUFGL'),
        ...map(bigshare?.companies, 'BIGSHARE'),
      ];

      if (companies.length) cache = { at: Date.now(), companies };
      return companies;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * Matches an IPO name against the registrar lists. Exact first, then a prefix,
 * then a strong word overlap — registrar listings carry suffixes ("- SME IPO")
 * and legal forms that our own names do not.
 */
export async function findRegistrarCompany(ipoName: string): Promise<RegistrarCompany | null> {
  const companies = await loadRegistrarCompanies();
  if (!companies.length) return null;

  const target = normalise(ipoName);
  if (!target) return null;

  const scored = companies.map((company) => ({ company, name: normalise(company.name) }));

  const exact = scored.find((row) => row.name === target);
  if (exact) return exact.company;

  const prefix = scored.find(
    (row) => row.name.startsWith(target) || target.startsWith(row.name)
  );
  if (prefix) return prefix.company;

  // Every meaningful word of the shorter name present in the longer one
  const targetWords = target.split(' ').filter((word) => word.length > 2);
  if (!targetWords.length) return null;

  const overlap = scored.find((row) => {
    const words = row.name.split(' ').filter((word) => word.length > 2);
    if (!words.length) return false;
    const shorter = targetWords.length <= words.length ? targetWords : words;
    const longer = targetWords.length <= words.length ? words : targetWords;
    return shorter.every((word) => longer.includes(word));
  });

  return overlap ? overlap.company : null;
}
