import { useEffect, useRef, useState } from 'react'
import FeedbackState from '../components/FeedbackState.jsx'
import { completeOAuthLogin } from '../services/auth.js'

export default function OAuthCallbackPage({ provider, onNavigate }) {
  const started = useRef(false)
  const params = new URLSearchParams(window.location.search)
  const providerError = params.get('error_description') || params.get('error')
  const code = params.get('code')
  const state = params.get('state')
  const initialError = providerError
    ? `Sign-in was not completed: ${providerError}`
    : !code || !state
      ? 'The provider did not return an authorization code. Please try again.'
      : ''
  const [error, setError] = useState(initialError)

  useEffect(() => {
    if (started.current || initialError) return
    started.current = true
    completeOAuthLogin(provider, code, state)
      .then(() => onNavigate('/dashboard'))
      .catch((callbackError) => setError(callbackError.message))
  }, [code, initialError, onNavigate, provider, state])

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10 text-slate-100">
      <div className="w-full max-w-lg">
        {error ? (
          <FeedbackState actionLabel="Return to sign in" message={error} onAction={() => onNavigate('/login')} title="Could not complete sign-in" variant="error" />
        ) : (
          <FeedbackState title={`Finishing ${provider} sign-in...`} variant="loading" />
        )}
      </div>
    </main>
  )
}