const SESSION_KEY = 'devpulse-auth-session'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const OAUTH_STATE_KEY = 'devpulse-oauth-state'

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new Error('Unable to reach the DevPulse API. Check that the backend is running.')
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = body?.detail
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((issue) => issue.msg).join(', ')
        : `Request failed (${response.status}).`
    throw new Error(message)
  }

  return body
}

async function getUser(accessToken) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

function saveSession(accessToken, tokenType, user) {
  const session = { accessToken, tokenType: tokenType || 'bearer', user }
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

async function createSession(email, password) {
  const credentials = new URLSearchParams({ username: email.trim(), password })
  const token = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: credentials,
  })

  if (!token?.access_token) throw new Error('The API did not return an access token.')

  const user = await getUser(token.access_token)
  return saveSession(token.access_token, token.token_type, user)
}

export async function loginUser(email, password) {
  return createSession(email, password)
}

export async function authenticatedRequest(path, options = {}) {
  const session = getAuthSession()
  if (!session) throw new Error('You are signed out. Please sign in again.')

  const headers = new Headers(options.headers)
  headers.set('Authorization', `${session.tokenType || 'bearer'} ${session.accessToken}`)
  return request(path, { ...options, headers })
}

export async function registerUser({ name, email, password }) {
  await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
  })

  return createSession(email, password)
}

export async function startOAuthLogin(provider) {
  const providers = await request('/auth/providers')
  const providerConfig = providers?.[provider]
  if (!providerConfig?.enabled || !providerConfig.client_id || !providerConfig.redirect_uri) {
    throw new Error(`${provider} sign-in is not configured on the API.`)
  }

  const state = window.crypto.randomUUID()
  window.sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ provider, state }))

  const authorizeUrl = provider === 'google'
    ? new URL('https://accounts.google.com/o/oauth2/v2/auth')
    : new URL('https://github.com/login/oauth/authorize')
  authorizeUrl.search = new URLSearchParams({
    client_id: providerConfig.client_id,
    redirect_uri: providerConfig.redirect_uri,
    response_type: 'code',
    scope: provider === 'google' ? 'openid email profile' : 'read:user user:email',
    state,
    ...(provider === 'google' ? { prompt: 'select_account' } : {}),
  }).toString()

  window.location.assign(authorizeUrl)
}

export async function completeOAuthLogin(provider, code, returnedState) {
  let savedState
  try {
    savedState = JSON.parse(window.sessionStorage.getItem(OAUTH_STATE_KEY) || 'null')
  } catch {
    savedState = null
  }
  window.sessionStorage.removeItem(OAUTH_STATE_KEY)

  if (!savedState || savedState.provider !== provider || savedState.state !== returnedState) {
    throw new Error('OAuth state verification failed. Please try signing in again.')
  }

  const token = await request(`/auth/${provider}/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!token?.access_token) throw new Error('The API did not return an access token.')

  const user = await getUser(token.access_token)
  return saveSession(token.access_token, token.token_type, user)
}

export function getAuthSession() {
  try {
    const session = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null')
    return session?.accessToken && session?.user ? session : null
  } catch {
    return null
  }
}

export function clearAuthSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}