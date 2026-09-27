import { useState } from 'react'
import { loginDemoUser } from '../services/auth.js'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

function BrandPanel() {
  return (
    <aside className="flex min-h-[230px] flex-col justify-between bg-[#131116] px-7 py-7 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
      <a className="flex w-fit items-center gap-3" href="/login" aria-label="Mini-PaaS home">
        <span className="flex size-12 items-center justify-center rounded-md p-1.5">
          <img className="size-full object-contain" src="/favicon.png" alt="" />
        </span>
        <span className="font-semibold tracking-normal">DevPulse</span>
      </a>
      <div className="max-w-lg py-10 lg:py-0">
        <p className="mb-4 text-sm font-semibold uppercase text-[#bd91ff]">Your platform, in view</p>
        <h1 className="font-[Space_Grotesk] text-3xl font-semibold leading-tight sm:text-4xl">
          One place to deploy and observe your applications.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-[#c5c1cb] sm:text-base">
          Keep application health, performance, logs, and alerts close at hand.
        </p>
      </div>
      <p className="hidden text-xs text-[#aaa5b1] lg:block">Self-hosted application monitoring</p>
    </aside>
  )
}

function OAuthButtons({ onDemoNotice }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-[#242129] px-4 text-sm font-semibold text-ink hover:bg-[#302c37]" onClick={onDemoNotice} type="button">
        <span aria-hidden="true" className="font-bold text-violet"><FcGoogle /></span>
        Continue with Google
      </button>
      <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-[#242129] px-4 text-sm font-semibold text-ink hover:bg-[#302c37]" onClick={onDemoNotice} type="button">
        <span aria-hidden="true" className="font-bold"><FaGithub /></span>
        Continue with GitHub
      </button>
    </div>
  )
}

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const result = loginDemoUser(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onNavigate('/dashboard')
  }

  function showOAuthNotice() {
    setNotice('Google and GitHub sign-in are not connected in this demo.')
  }

  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(360px,0.92fr)_1.08fr]">
      <BrandPanel />
      <section className="flex min-h-[calc(100vh-230px)] items-center justify-center px-6 py-12 sm:px-10 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-md">
          <p className="text-sm font-medium text-muted">Welcome back</p>
          <h2 className="mt-1 font-[Space_Grotesk] text-3xl font-semibold">Sign in to DevPulse</h2>
          <p className="mt-2 text-sm text-muted">Use your account to continue to the platform.</p>

          <div className="mt-7"><OAuthButtons onDemoNotice={showOAuthNotice} /></div>
          <div className="my-6 flex items-center gap-4 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            <span>OR CONTINUE WITH EMAIL</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold" htmlFor="login-email">
              Email address
              <input className="mt-1.5 h-11 w-full rounded-md border border-line bg-[#242129] px-3 font-normal text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15" id="login-email" autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <label className="block text-sm font-semibold" htmlFor="login-password">
              Password
              <input className="mt-1.5 h-11 w-full rounded-md border border-line bg-[#242129] px-3 font-normal text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15" id="login-password" autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            {notice && <p className="text-sm text-muted" role="status">{notice}</p>}
            <button className="h-11 w-full rounded-md bg-violet px-4 text-sm font-semibold text-white hover:bg-violet-dark focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-paper" type="submit">
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            New to DevPulse?{' '}
            <button className="font-semibold text-violet hover:text-violet-dark" onClick={() => onNavigate('/register')} type="button">Create an account</button>
          </p>
          <p className="mt-8 border-t border-line pt-4 text-center text-xs leading-5 text-muted">
            Demo account: <span className="font-semibold text-ink">demo@mini-paas.local</span> / <span className="font-semibold text-ink">DemoPass123!</span>
          </p>
        </div>
      </section>
    </main>
  )
}