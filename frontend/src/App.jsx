import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OAuthCallbackPage from './pages/OAuthCallbackPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { clearAuthSession, getAuthSession } from './services/auth.js'

function getCurrentPath() {
  const path = window.location.pathname
  const protectedPath = ['/dashboard', '/applications', '/alerts', '/settings'].includes(path)
    || path.startsWith('/applications/')

  if (protectedPath && !getAuthSession()) {
    window.history.replaceState({}, '', '/login')
    return '/login'
  }
  return path
}

function App() {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  let page
  const oauthCallback = path.match(/^\/auth\/callback\/(google|github)$/)
  if (oauthCallback) page = <OAuthCallbackPage provider={oauthCallback[1]} onNavigate={navigate} />
  else if (path === '/register') page = <RegisterPage onNavigate={navigate} />
  else if (['/dashboard', '/applications', '/alerts', '/settings'].includes(path) || path.startsWith('/applications/')) {
    page = <Dashboard path={path} onNavigate={navigate} onLogout={() => { clearAuthSession(); navigate('/login') }} />
  }
  if (!page) page = <LoginPage onNavigate={navigate} />

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { background: '#10131b', border: '1px solid #303647', color: '#f1f5f9' } }} />
      {page}
    </>
  )
}

export default App