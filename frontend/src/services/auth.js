import { DEMO_USER } from './demoUser.js'

const USERS_KEY = 'mini-paas-demo-users'
const SESSION_KEY = 'mini-paas-demo-session'

function getRegisteredUsers() {
  return JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]')
}

function saveSession(user) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
  }))
}

export function loginDemoUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = [DEMO_USER, ...getRegisteredUsers()].find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password,
  )

  if (!user) return { ok: false, error: 'Email or password is incorrect.' }

  saveSession(user)
  return { ok: true }
}

export function registerDemoUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getRegisteredUsers()
  const emailExists = [DEMO_USER, ...users].some(
    (user) => user.email.toLowerCase() === normalizedEmail,
  )

  if (emailExists) return { ok: false, error: 'An account with this email already exists.' }

  const user = { name: name.trim(), email: normalizedEmail, password }
  users.push(user)
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  saveSession(user)
  return { ok: true }
}

export function getDemoSession() {
  const session = window.sessionStorage.getItem(SESSION_KEY)
  return session ? JSON.parse(session) : null
}

export function clearDemoSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}