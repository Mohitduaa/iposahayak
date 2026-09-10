// Colours the sign-in, sign-up and reset screens share, in both appearances.
//
// The dashboard is navy with blue and orange accents; these screens take
// the same palette so arriving in the app feels like one product, not two.

export interface AuthPalette {
  /** Page background, top to bottom */
  bg: [string, string, string]
  /** A solid page colour, for sheets that need one */
  surface: string
  /** The two soft glows behind the card, as "rgba(r, g, b, a)" */
  glowA: string
  glowB: string
  card: string
  cardBorder: string
  text: string
  muted: string
  faint: string
  inputBg: string
  inputBorder: string
  focus: string
  /** Primary button gradient */
  primary: [string, string]
  link: string
  error: string
  errorBg: string
  /** A soft blue wash behind small icons */
  tint: string
  up: string
  googleBg: string
  googleBorder: string
  googleText: string
}

export function authPalette(isDark: boolean): AuthPalette {
  return isDark
    ? {
        bg: ['#0B1120', '#0F172A', '#131F3A'],
        surface: '#0F172A',
        glowA: 'rgba(59, 130, 246, 0.32)',
        glowB: 'rgba(249, 115, 22, 0.18)',
        card: '#1E293B',
        cardBorder: 'rgba(148, 163, 184, 0.16)',
        text: '#F1F5F9',
        muted: '#94A3B8',
        faint: '#64748B',
        inputBg: '#0F172A',
        inputBorder: '#334155',
        focus: '#60A5FA',
        primary: ['#3B82F6', '#1D4ED8'],
        link: '#60A5FA',
        error: '#F87171',
        errorBg: 'rgba(248, 113, 113, 0.12)',
        tint: 'rgba(96, 165, 250, 0.14)',
        up: '#34D399',
        googleBg: '#FFFFFF',
        googleBorder: '#FFFFFF',
        googleText: '#1F2937',
      }
    : {
        bg: ['#DBEAFE', '#EFF6FF', '#F8FAFC'],
        surface: '#FFFFFF',
        glowA: 'rgba(59, 130, 246, 0.26)',
        glowB: 'rgba(251, 146, 60, 0.22)',
        card: '#FFFFFF',
        cardBorder: '#E2E8F0',
        text: '#0F172A',
        muted: '#64748B',
        faint: '#94A3B8',
        inputBg: '#F8FAFC',
        inputBorder: '#E2E8F0',
        focus: '#2563EB',
        primary: ['#2563EB', '#1E40AF'],
        link: '#1D4ED8',
        error: '#DC2626',
        errorBg: '#FEF2F2',
        tint: '#EFF6FF',
        up: '#059669',
        googleBg: '#FFFFFF',
        googleBorder: '#E2E8F0',
        googleText: '#1F2937',
      }
}
