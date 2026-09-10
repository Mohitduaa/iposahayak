// The native Google account sheet, wrapped so the screens only see "an ID
// token or a reason there is none".
//
// The module is required lazily: it does not exist on the web or in Expo
// Go, and importing it there would throw before the login screen renders.
// The web client ID comes from app.config.js; it is what Google mints the ID
// token for, and the backend checks the same value.

import Constants from 'expo-constants'
import {Platform} from 'react-native'

export type GoogleSignInResult = {cancelled: true} | {cancelled?: false; idToken: string; email?: string; name?: string}

/** Thrown for failures the person can act on; the message is shown as-is. */
export class GoogleSignInError extends Error {}

let lib: any = null
let looked = false
let configured = false

function module() {
  if (looked) return lib
  looked = true
  if (Platform.OS === 'web') return null
  try {
    lib = require('@react-native-google-signin/google-signin')
  } catch (error: any) {
    console.warn('Google Sign-In unavailable:', error?.message || error)
    lib = null
  }
  return lib
}

export function googleSignInAvailable() {
  return Boolean(module())
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const m = module()
  if (!m) throw new GoogleSignInError('Google sign-in is not available in this build')

  const {GoogleSignin, statusCodes, isErrorWithCode} = m
  if (!configured) {
    const webClientId = Constants.expoConfig?.extra?.googleWebClientId
    if (!webClientId) throw new GoogleSignInError('Google sign-in is not set up yet')
    GoogleSignin.configure({webClientId, offlineAccess: false})
    configured = true
  }

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true})
    }
    const response = await GoogleSignin.signIn()
    if (response.type === 'cancelled') return {cancelled: true}

    const idToken = response.data?.idToken
    if (!idToken) throw new GoogleSignInError('Google did not return a sign-in token. Please try again.')
    return {idToken, email: response.data.user?.email, name: response.data.user?.name || undefined}
  } catch (error: any) {
    if (error instanceof GoogleSignInError) throw error
    if (isErrorWithCode?.(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return {cancelled: true}
        case statusCodes.IN_PROGRESS:
          throw new GoogleSignInError('Google sign-in is already open')
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new GoogleSignInError('Google Play services is needed for Google sign-in')
        default:
          // DEVELOPER_ERROR: the SHA-1 or package name is not registered for
          // this build; worth the console line while the app is being set up
          console.warn('Google sign-in failed:', error.code, error.message)
      }
    }
    throw new GoogleSignInError('Google sign-in did not work. Please try again or use your email.')
  }
}

/** Forget the Google session too, so the next sign-in shows the account picker. */
export async function signOutOfGoogle() {
  try {
    await module()?.GoogleSignin?.signOut()
  } catch {
    // Nothing to do; the app's own session is what matters
  }
}
