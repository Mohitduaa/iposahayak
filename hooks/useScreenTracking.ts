import {useEffect} from 'react'
import {usePathname} from 'expo-router'
import {logScreen} from '@/services/analytics'

/**
 * Reports every screen the router lands on.
 *
 * Mounted once at the root: expo-router's pathname changes on every
 * navigation, which is exactly the moment a screen view happens.
 */
export function useScreenTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    // "/(tabs)/allotment" reads better as "allotment"
    const name = pathname.replace(/^\/+/, '').replace(/\(tabs\)\//, '').replace(/\(auth\)\//, '') || 'home'
    logScreen(name)
  }, [pathname])
}
