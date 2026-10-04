import { useState } from 'react'
import toast from 'react-hot-toast'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { startOAuthLogin } from '../services/auth.js'

export default function OAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState('')

  async function handleClick(provider) {
    setLoadingProvider(provider)
    try {
      await startOAuthLogin(provider)
    } catch (error) {
      toast.error(error.message)
      setLoadingProvider('')
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-[#242129] px-4 text-sm font-semibold text-ink hover:bg-[#302c37] disabled:cursor-wait disabled:opacity-60" disabled={Boolean(loadingProvider)} onClick={() => handleClick('google')} type="button">
        <FcGoogle />{loadingProvider === 'google' ? 'Connecting...' : 'Continue with Google'}
      </button>
      <button className="flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-[#242129] px-4 text-sm font-semibold text-ink hover:bg-[#302c37] disabled:cursor-wait disabled:opacity-60" disabled={Boolean(loadingProvider)} onClick={() => handleClick('github')} type="button">
        <FaGithub />{loadingProvider === 'github' ? 'Connecting...' : 'Continue with GitHub'}
      </button>
    </div>
  )
}