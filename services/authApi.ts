// POST + JSON for the sign-in screens.
//
// Unlike fetchJson this never hides the status code: a 400 from /auth/login
// means "wrong password" and the screen has to say so, whereas a timeout or
// a dead connection is a different message. Nothing here throws.

import {apiUrl} from './api'

export interface ApiReply<T = any> {
  ok: boolean
  /** 0 when the request never reached the server */
  status: number
  data: T & {message?: string}
}

export async function postJson<T = any>(path: string, body: unknown, timeoutMs = 20000): Promise<ApiReply<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(apiUrl(path), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const text = await response.text()
    let data: any = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = {message: 'The server sent an unexpected reply. Please try again.'}
    }
    return {ok: response.ok, status: response.status, data}
  } catch (error: any) {
    const timedOut = error?.name === 'AbortError'
    return {
      ok: false,
      status: 0,
      data: {
        message: timedOut
          ? 'The server took too long to answer. Check your connection and try again.'
          : 'Could not reach the server. Check your internet connection.',
      } as any,
    }
  } finally {
    clearTimeout(timer)
  }
}
