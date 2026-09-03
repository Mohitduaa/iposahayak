// One place for the API base URL and for talking to it.
//
// The URL was written out at 21 call sites, so pointing the app at a staging
// backend meant editing every one of them.

export const API_BASE = 'https://api.iposahayak.com';

export const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

const DEFAULT_TIMEOUT = 15000;

/**
 * fetch + JSON with a timeout and one retry.
 *
 * On a phone the first request after a cold start regularly lands on a flaky
 * connection. Without a timeout the promise could hang for a minute with the
 * screen stuck on its skeleton; without a retry a single blip emptied the list.
 * Returns null rather than throwing, so a caller can keep showing cached data.
 */
export async function fetchJson<T = any>(
  url: string,
  { timeoutMs = DEFAULT_TIMEOUT, retries = 1 }: { timeoutMs?: number; retries?: number } = {}
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      // A proxy or captive portal answers with an HTML page; parsing that as
      // JSON throws something unreadable, so it is caught here instead.
      if (text.trim().startsWith('<')) throw new Error('Expected JSON, received HTML');

      return JSON.parse(text) as T;
    } catch (error: any) {
      if (attempt === retries) {
        console.warn(`API request failed: ${url} — ${error?.message || error}`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}
