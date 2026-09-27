import { useState } from 'react'
import { registerDemoUser } from '../services/auth.js'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export default function RegisterPage({ onNavigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const result = registerDemoUser({ name, email, password })
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
    <main className="min-h-screen w-auto bg-paper px-6 py-8 sm:px-10">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <a className="flex items-center gap-3 font-semibold text-ink" href="/login">
          <span className="flex size-11 items-center justify-center rounded-md p-1.5">
            <img className="size-full object-contain" src="/favicon.png" alt="logo" />
          </span>
          DevPulse
        </a>
        <p className="text-sm text-muted">Already registered? <button className="font-semibold text-violet hover:text-violet-dark" onClick={() => onNavigate('/login')} type="button">Sign in</button></p>
      </div>

      <section className="mx-auto mt-8 w-full max-w-md rounded-md border border-line bg-[#201e25] px-6 py-8 sm:mt-12 sm:px-9">
        <p className="text-sm font-medium text-muted">Create your account</p>
        <h1 className="mt-1 font-[Space_Grotesk] text-3xl font-semibold">Get started</h1>
        <p className="mt-2 text-sm text-muted">Set up an account for your DevPulse workspace.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols">
          <button className="h-11 rounded-md border border-line bg-[#242129] flex justify-center items-center text-sm font-semibold text-ink hover:bg-[#302c37] gap-3" onClick={showOAuthNotice} type="button"><FcGoogle /> Continue with Google</button> 
          <button className="h-11 rounded-md border border-line bg-[#242129] flex justify-center items-center gap-3 text-sm font-semibold text-ink hover:bg-[#302c37]" onClick={showOAuthNotice} type="button"><FaGithub /> Continue with GitHub</button>
        </div>
        <div className="my-6 flex items-center gap-4 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          <span>OR REGISTER WITH EMAIL</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold" htmlFor="register-name">
            Name
            <input className="mt-1.5 h-11 w-full rounded-md border border-line bg-[#242129] px-3 font-normal text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15" id="register-name" autoComplete="name" onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label className="block text-sm font-semibold" htmlFor="register-email">
            Email address
            <input className="mt-1.5 h-11 w-full rounded-md border border-line bg-[#242129] px-3 font-normal text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15" id="register-email" autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label className="block text-sm font-semibold" htmlFor="register-password">
            Password
            <input className="mt-1.5 h-11 w-full rounded-md border border-line bg-[#242129] px-3 font-normal text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15" id="register-password" autoComplete="new-password" minLength="8" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <label className="block text-sm font-semibold" htmlFor="register-confirm-password">
            Confirm password
            <input className="mt-1.5 h-11 w-full rounded-md border border-line bg-[#242129] px-3 font-normal text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/15" id="register-confirm-password" autoComplete="new-password" minLength="8" onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          </label>
          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
          {notice && <p className="text-sm text-muted" role="status">{notice}</p>}
          <button className="h-11 w-full rounded-md bg-violet px-4 text-sm font-semibold text-white hover:bg-violet-dark focus:outline-none focus:ring-2 focus:ring-violet focus:ring-offset-2 focus:ring-offset-paper" type="submit">Create account</button>
        </form>
      </section>
    </main>
  )
}