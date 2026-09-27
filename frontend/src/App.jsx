import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { clearDemoSession, getDemoSession } from './services/auth.js'

function getCurrentPath() {
  const path = window.location.pathname
  const protectedPath = ['/dashboard', '/applications', '/alerts', '/settings'].includes(path)
    || path.startsWith('/applications/')

  if (protectedPath && !getDemoSession()) {
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

  if (path === '/register') return <RegisterPage onNavigate={navigate} />
  if (['/dashboard', '/applications', '/alerts', '/settings'].includes(path) || path.startsWith('/applications/')) {
    return <Dashboard path={path} onNavigate={navigate} onLogout={() => { clearDemoSession(); navigate('/login') }} />
  }
  return <LoginPage onNavigate={navigate} />
}

export default App