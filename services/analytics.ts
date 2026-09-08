// What people actually do in the app, sent to Firebase Analytics.
//
// Screen views tell us which tabs get used; the handful of events below tell
// us whether the thing the app exists for is happening — allotment being
// checked, results coming back, GMP being read. The figures land in the same
// GA4 account the panel's Marketing page reads.
//
// Nothing here throws. Analytics is not worth a crash, and the native module
// is absent in Expo Go and on the web, where every call becomes a no-op.

import {Platform} from 'react-native'

type Params = Record<string, string | number | boolean | undefined>

let analytics: any = null
let ready = false

function client() {
  if (ready) return analytics
  ready = true
  if (Platform.OS === 'web') return null
  try {
    // Required lazily: importing it in Expo Go throws before any screen renders
    const module = require('@react-native-firebase/analytics')
    analytics = module.default ? module.default() : null
  } catch (error: any) {
    console.warn('Analytics unavailable:', error?.message || error)
    analytics = null
  }
  return analytics
}

/** Firebase rejects names and values that are too long or oddly typed. */
function clean(params?: Params) {
  const out: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null) continue
    const name = key.slice(0, 40)
    out[name] = typeof value === 'number' ? value : String(value).slice(0, 100)
  }
  return out
}

export function logEvent(name: string, params?: Params) {
  const a = client()
  if (!a) return
  a.logEvent(name.slice(0, 40), clean(params)).catch((error: any) => {
    console.warn(`Analytics event "${name}" not sent:`, error?.message || error)
  })
}

export function logScreen(screen: string) {
  const a = client()
  if (!a) return
  a.logScreenView({screen_name: screen, screen_class: screen}).catch(() => {})
}

// ---- the events worth naming ----------------------------------------------

export const track = {
  /** Someone opened an IPO's detail sheet. */
  ipoOpened: (name: string, status?: string) => logEvent('ipo_opened', {ipo: name, status}),

  /** "Check allotment" was pressed, and what came back. */
  allotmentChecked: (registrar: string, ipo: string, pans: number) =>
    logEvent('allotment_checked', {registrar, ipo, pans}),
  allotmentResult: (registrar: string, allotted: number, notAllotted: number, noRecord: number) =>
    logEvent('allotment_result', {registrar, allotted, not_allotted: notAllotted, no_record: noRecord}),

  /** A PAN was saved; the count says how far people get with the feature. */
  panSaved: (total: number) => logEvent('pan_saved', {total}),

  /** The GMP sheet for one issue. */
  gmpOpened: (name: string, gmp: number) => logEvent('gmp_opened', {ipo: name, gmp}),

  /** Search, and whether it found anything. */
  searched: (query: string, results: number) => logEvent('search', {search_term: query.slice(0, 60), results}),

  /** The Play Store rating flow. */
  rateApp: (path: 'in_app' | 'store') => logEvent('rate_app', {path}),
}
