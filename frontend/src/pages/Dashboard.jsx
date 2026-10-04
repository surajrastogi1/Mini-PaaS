import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  FiActivity,
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiChevronDown,
  FiCpu,
  FiExternalLink,
  FiGrid,
  FiHardDrive,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiSearch,
  FiSettings,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { getAuthSession } from '../services/auth.js'
import ApplicationSettings from '../components/ApplicationSettings.jsx'
import ApplicationLogs from '../components/ApplicationLogs.jsx'
import SettingsPage from '../components/SettingsPage.jsx'
import FeedbackState from '../components/FeedbackState.jsx'

const SAMPLE_APPLICATIONS = [
  { id: 'research-api', name: 'Research API', provider: 'AWS', region: 'us-east-1', status: 'Healthy', cpu: 32, memory: 48, requests: '12.4K', errors: '0.2%', updated: '2 min ago' },
  { id: 'ai-backend', name: 'AI Backend', provider: 'Render', region: 'Oregon', status: 'Warning', cpu: 76, memory: 81, updated: '1 min ago' },
  { id: 'web-console', name: 'Web Console', provider: 'Vercel', region: 'Global', status: 'Healthy', cpu: 18, memory: 36, updated: '3 min ago' },
  { id: 'events-worker', name: 'Events Worker', provider: 'AWS', region: 'eu-west-1', status: 'Healthy', cpu: 24, memory: 51, updated: '4 min ago' },
  { id: 'docs-portal', name: 'Docs Portal', provider: 'Vercel', region: 'Global', status: 'Healthy', cpu: 12, memory: 29, updated: '5 min ago' },
]
const APPLICATIONS_KEY = 'devpulse-monitored-applications'
const APPLICATION_SETTINGS_KEY = 'devpulse-application-settings'
const DELETED_APPLICATIONS_KEY = 'devpulse-deleted-applications'

function getApplicationId(application) {
  return application.id || application.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function loadSavedApplications() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(APPLICATIONS_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function loadApplicationSettings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(APPLICATION_SETTINGS_KEY) || '{}')
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  } catch {
    return {}
  }
}

function loadDeletedApplicationIds() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DELETED_APPLICATIONS_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function loadApplications() {
  const settings = loadApplicationSettings()
  const deletedIds = new Set(loadDeletedApplicationIds())
  return [...SAMPLE_APPLICATIONS, ...loadSavedApplications()]
    .filter((application) => !deletedIds.has(getApplicationId(application)))
    .map((application) => ({ ...application, ...settings[getApplicationId(application)] }))
}

const navigation = [
  { label: 'Dashboard', icon: FiHome },
  { label: 'Applications', icon: FiGrid },
  { label: 'Alerts', icon: FiBell },
  { label: 'Settings', icon: FiSettings },
]

function Metric({ label, value, icon: Icon, tone }) {
  const styles = {
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    red: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  }

  return (
    <article className={`flex min-h-28 items-center gap-4 rounded-lg border p-5 ${styles[tone]}`}>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-black/30 text-xl"><Icon /></span>
      <div>
        <p className="text-3xl font-semibold leading-none text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-300">{label}</p>
      </div>
    </article>
  )
}

function ApplicationRow({ application, onView }) {
  const isHealthy = application.status === 'Healthy'
  const statusColor = isHealthy ? 'text-emerald-400' : application.status === 'Warning' || application.status === 'Down' ? 'text-amber-400' : 'text-slate-400'
  const statusDot = isHealthy ? 'bg-emerald-400' : application.status === 'Warning' || application.status === 'Down' ? 'bg-amber-400' : 'bg-slate-400'

  return (
    <article className="grid gap-4 rounded-lg border border-[#242a3a] bg-[#0b0d14] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xl text-white"><FiActivity /></span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="truncate font-semibold text-white"><button className="text-left hover:text-blue-300" onClick={() => onView(application)} type="button">{application.name}</button></h3>
            <span className="rounded border border-[#34394a] px-2 py-0.5 text-xs text-slate-300">{application.provider}</span>
          </div>
          <p className={`mt-1 flex items-center gap-1.5 text-sm ${statusColor}`}>
            <span className={`size-2 rounded-full ${statusDot}`} />
            {application.status}<span className="text-slate-500">· {application.region}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2"><FiCpu className="text-slate-400" />CPU {application.cpu === null ? 'Not connected' : `${application.cpu}%`}</span>
            <span className="inline-flex items-center gap-2"><FiHardDrive className="text-slate-400" />Memory {application.memory === null ? 'Not connected' : `${application.memory}%`}</span>
            <span className="text-slate-500">Updated {application.updated}</span>
          </div>
        </div>
      </div>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:justify-self-end" type="button" onClick={() => onView(application)}>
        View details <FiExternalLink />
      </button>
    </article>
  )
}

function UsageChart({ title, value, color, points }) {
  return (
    <article className="rounded-lg border border-[#242a3a] bg-[#0b0d14] p-5 sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-2 text-3xl font-semibold text-white">{value}%</p>
        </div>
        <span className="text-xs text-slate-500">Demo history · 24 hours</span>
      </div>
      <svg aria-label={`${title} over the last 24 hours (demo data)`} className="mt-5 h-44 w-full" preserveAspectRatio="none" role="img" viewBox="0 0 600 180">
        {[20, 60, 100, 140].map((y) => <line key={y} stroke="#242a3a" strokeWidth="1" x1="0" x2="600" y1={y} y2={y} />)}
        <path d={`${points} L 600 160 L 0 160 Z`} fill={color} fillOpacity="0.12" />
        <path d={points} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <text fill="#697386" fontSize="11" x="0" y="176">00:00</text>
        <text fill="#697386" fontSize="11" textAnchor="middle" x="300" y="176">12:00</text>
        <text fill="#697386" fontSize="11" textAnchor="end" x="600" y="176">Now</text>
      </svg>
    </article>
  )
}

function ApplicationDetails({ application, onBack, onSettings }) {
  const monitoringEnabled = application.monitoringEnabled !== false
  const isConnected = monitoringEnabled && Number.isFinite(application.cpu) && Number.isFinite(application.memory)
  const statusClass = application.status === 'Healthy' ? 'text-emerald-400' : application.status === 'Pending setup' ? 'text-slate-300' : 'text-amber-400'
  const metrics = [
    { label: 'CPU', value: isConnected ? `${application.cpu}%` : 'Not connected', icon: FiCpu },
    { label: 'Memory', value: isConnected ? `${application.memory}%` : 'Not connected', icon: FiHardDrive },
    { label: 'Requests', value: application.requests || 'Not connected', icon: FiActivity },
    { label: 'Errors', value: application.errors || 'Not connected', icon: FiBell },
  ]

  return (
    <div>
      <button className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white" onClick={onBack} type="button"><FiArrowLeft />Back to applications</button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Applications / {application.name}</p>
          <h1 className="mt-2 font-sans text-3xl font-semibold text-white">{application.name}</h1>
          <p className={`mt-2 flex items-center gap-2 text-sm ${statusClass}`}>
            <span className={`size-2 rounded-full ${application.status === 'Healthy' ? 'bg-emerald-400' : application.status === 'Pending setup' ? 'bg-slate-400' : 'bg-amber-400'}`} />
            {application.status}<span className="text-slate-500">· {application.provider} · {application.region}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded border border-[#303647] bg-[#11141d] px-2 py-1 text-xs text-slate-400">Demo monitoring data</span>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#303647] px-3 text-sm text-slate-300 hover:bg-[#171b26]" onClick={onSettings} type="button"><FiSettings />Settings</button>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article className="min-h-28 rounded-lg border border-[#242a3a] bg-[#0b0d14] p-4 sm:p-5" key={label}>
            <p className="flex items-center gap-2 text-sm text-slate-400"><Icon />{label}</p>
            <p className={`mt-3 text-xl font-semibold ${value === 'Not connected' ? 'text-slate-500' : 'text-white'}`}>{value}</p>
          </article>
        ))}
      </div>

      {isConnected ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <UsageChart color="#3b82f6" points="M 0 119 C 38 113 50 94 83 101 S 127 132 164 111 S 207 92 242 103 S 285 82 326 95 S 369 111 407 82 S 453 91 489 72 S 550 89 600 61" title="CPU Usage" value={application.cpu} />
          <UsageChart color="#34d399" points="M 0 93 C 42 88 52 104 88 83 S 135 69 166 91 S 212 106 245 81 S 287 91 326 72 S 372 77 409 62 S 455 79 492 53 S 550 71 600 46" title="Memory Usage" value={application.memory} />
        </div>
      ) : (
        <section className="rounded-lg border border-[#242a3a] bg-[#0b0d14] p-6">
          <h2 className="font-semibold text-white">Usage history</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Usage charts will appear when monitoring is connected. Current status: {application.status}.</p>
          {application.endpoint && <p className="mt-3 break-all text-sm text-blue-300">Health endpoint: {application.endpoint}</p>}
        </section>
      )}
      <ApplicationLogs application={application} />
      <p className="mt-4 text-xs text-slate-500">Sample figures and chart history are illustrative only; live metrics require a monitoring backend.</p>
    </div>
  )
}

export default function Dashboard({ path, onNavigate, onLogout }) {
  const session = getAuthSession()
  const routeParts = path.split('/').filter(Boolean)
  const applicationRoute = routeParts[0] === 'applications' && routeParts.length > 1
  const applicationSettingsRoute = applicationRoute && routeParts[2] === 'settings'
  const activePage = path === '/alerts' ? 'Alerts' : path === '/settings' || applicationSettingsRoute ? 'Settings' : path === '/applications' || applicationRoute ? 'Applications' : 'Dashboard'
  const [query, setQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [applications, setApplications] = useState(loadApplications)
  const [showAddApplication, setShowAddApplication] = useState(false)
  const [addError, setAddError] = useState('')
  const applicationId = applicationRoute ? decodeURIComponent(routeParts[1]) : null
  const selectedApplication = applications.find((application) => getApplicationId(application) === applicationId)
  const healthyCount = applications.filter((app) => app.status === 'Healthy').length
  const alertCount = applications.filter((app) => app.status === 'Warning' || app.status === 'Down').length
  const visibleApplications = activePage === 'Alerts'
    ? applications.filter((app) => app.status === 'Warning' || app.status === 'Down')
    : applications
  const filteredApplications = visibleApplications.filter((app) => `${app.name} ${app.provider} ${app.status}`.toLowerCase().includes(query.trim().toLowerCase()))

  function handleAddApplication(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name').trim()
    if (applications.some((application) => application.name.toLowerCase() === name.toLowerCase())) {
      setAddError('An application with this name is already listed.')
      toast.error('An application with this name is already listed.')
      return
    }

    const application = {
      id: window.crypto.randomUUID(),
      name,
      provider: formData.get('provider'),
      endpoint: formData.get('endpoint').trim(),
      region: formData.get('region').trim() || 'Not specified',
      status: 'Pending setup',
      cpu: null,
      memory: null,
      updated: 'Waiting for first check',
    }

    try {
      const savedApplications = loadSavedApplications()
      window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([...savedApplications, application]))
    } catch {
      setAddError('Could not save this application in browser storage.')
      toast.error('Could not save the application.')
      return
    }

    setApplications((current) => [...current, application])
    setQuery('')
    setAddError('')
    setShowAddApplication(false)
    onNavigate('/applications')
    toast.success(`${name} added to Applications.`)
  }

  function updateApplicationSettings(id, changes) {
    const currentApplication = applications.find((application) => getApplicationId(application) === id)
    const savedChanges = { ...changes }

    if (changes.monitoringEnabled === false && !changes.status) {
      savedChanges.status = currentApplication.status === 'Disconnected' ? 'Disconnected' : 'Monitoring disabled'
      savedChanges.updated = 'Monitoring paused'
    } else if (changes.monitoringEnabled === true && currentApplication.monitoringEnabled === false) {
      savedChanges.status = 'Pending setup'
      savedChanges.updated = 'Waiting for first check'
    }

    try {
      const settings = loadApplicationSettings()
      window.localStorage.setItem(APPLICATION_SETTINGS_KEY, JSON.stringify({ ...settings, [id]: { ...settings[id], ...savedChanges } }))
      const savedApplications = loadSavedApplications().map((application) => getApplicationId(application) === id
        ? { ...application, id, ...savedChanges }
        : application)
      window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(savedApplications))
    } catch {
      return false
    }

    setApplications((current) => current.map((application) => getApplicationId(application) === id
      ? { ...application, id, ...savedChanges }
      : application))
    return true
  }

  function disconnectApplication(id) {
    return updateApplicationSettings(id, {
      monitoringEnabled: false,
      status: 'Disconnected',
      updated: 'Monitoring disconnected',
    })
  }

  function deleteApplication(id) {
    try {
      const deletedIds = new Set(loadDeletedApplicationIds())
      deletedIds.add(id)
      window.localStorage.setItem(DELETED_APPLICATIONS_KEY, JSON.stringify([...deletedIds]))
      window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(loadSavedApplications().filter((application) => getApplicationId(application) !== id)))
      const settings = loadApplicationSettings()
      delete settings[id]
      window.localStorage.setItem(APPLICATION_SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      return false
    }

    setApplications((current) => current.filter((application) => getApplicationId(application) !== id))
    onNavigate('/settings')
    return true
  }

  return (
    <main className="min-h-screen bg-black text-slate-100 md:flex">
      {mobileNavOpen && <button aria-label="Close navigation menu" className="fixed inset-0 z-30 bg-black/70 md:hidden" onClick={() => setMobileNavOpen(false)} type="button" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 shrink-0 flex-col border-r border-[#202535] bg-[#080a10] transition-transform duration-200 md:static md:z-auto md:h-auto md:min-h-screen md:w-60 md:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`} id="mobile-navigation">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#202535] px-5">
          <a className="flex items-center gap-3" href="/dashboard" aria-label="DevPulse dashboard" onClick={(event) => { event.preventDefault(); setMobileNavOpen(false); onNavigate('/dashboard') }}>
            <img className="size-10 rounded-md object-cover" src="/favicon.png" alt="DevPulse" />
            <span className="font-semibold tracking-normal text-white">DevPulse</span>
          </a>
          <button aria-label="Close navigation menu" className="rounded-md p-2 text-slate-400 hover:bg-[#171b26] hover:text-white md:hidden" onClick={() => setMobileNavOpen(false)} type="button"><FiX /></button>
        </div>
        <nav className="flex flex-col gap-1 p-4" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`relative flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${activePage === label ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-[#171b26] hover:text-white'}`} onClick={() => { setMobileNavOpen(false); onNavigate(label === 'Dashboard' ? '/dashboard' : `/${label.toLowerCase()}`) }} type="button">
              <Icon className="text-lg" /><span className="whitespace-nowrap">{label}</span>
              {label === 'Alerts' && alertCount > 0 && <span className="ml-auto rounded bg-rose-500/20 px-1.5 py-0.5 text-xs text-rose-300">{alertCount}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-[#202535] p-4 text-xs text-slate-500">Self-hosted monitoring · Demo data</div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[#202535] bg-[#080a10] px-4 sm:px-7">
          <button aria-controls="mobile-navigation" aria-expanded={mobileNavOpen} aria-label="Open navigation menu" className="flex size-10 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-[#171b26] md:hidden" onClick={() => setMobileNavOpen(true)} type="button"><FiMenu className="text-xl" /></button>
          <label className="flex h-10 min-w-0 w-full max-w-md flex-1 items-center gap-2 rounded-md border border-[#252b3b] bg-[#10131d] px-3 text-slate-400 focus-within:border-blue-500">
            <FiSearch />
            <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(event) => setQuery(event.target.value)} placeholder="Search applications..." type="search" value={query} />
          </label>
          <div className="relative shrink-0">
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-200 hover:bg-[#171b26]" onClick={() => setProfileOpen(!profileOpen)} type="button" aria-expanded={profileOpen}>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#252b3b] text-slate-300"><FiUser /></span>
              <span className="hidden max-w-32 truncate sm:block">{session?.user?.name || session?.user?.email || 'User'}</span>
              <FiChevronDown className="text-slate-400" />
            </button>
            {profileOpen && <button className="absolute right-0 top-12 z-10 flex w-36 items-center gap-2 rounded-md border border-[#303647] bg-[#11141d] px-3 py-2.5 text-left text-sm text-slate-200 shadow-xl hover:bg-[#202535]" onClick={onLogout} type="button"><FiLogOut /> Sign out</button>}
          </div>
        </header>

        <div className="mx-auto max-w-375 px-4 py-7 sm:px-7 lg:px-9">
          {!selectedApplication && <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-sans text-3xl font-semibold text-white">{activePage}</h1>
                <span className="rounded border border-[#303647] bg-[#11141d] px-2 py-1 text-xs text-slate-400">Demo monitoring data</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}. Here is your application status.</p>
            </div>
            <p className="inline-flex items-center gap-2 text-xs text-slate-500"><span className="size-2 rounded-full bg-emerald-400" /><FiCheckCircle className="text-emerald-400" />Monitoring active</p>
          </div>}

          {selectedApplication && !applicationSettingsRoute ? (
            <ApplicationDetails application={selectedApplication} onBack={() => onNavigate('/applications')} onSettings={() => onNavigate(`/applications/${applicationId}/settings`)} />
          ) : !selectedApplication && activePage !== 'Settings' && (
            <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Metric label="Applications" value={applications.length} icon={FiGrid} tone="blue" />
              <Metric label="Healthy" value={healthyCount} icon={FiCheckCircle} tone="green" />
              <Metric label="Active alerts" value={alertCount} icon={FiBell} tone="red" />
            </div>
          )}

          {!selectedApplication && activePage === 'Settings' ? (
            <SettingsPage applications={applications} onSelectApplication={(application) => onNavigate(`/applications/${getApplicationId(application)}/settings`)} />
          ) : selectedApplication && applicationSettingsRoute ? (
            <ApplicationSettings
              key={applicationId}
              application={selectedApplication}
              applicationId={applicationId}
              onBack={() => onNavigate('/settings')}
              onSave={(changes) => updateApplicationSettings(applicationId, changes)}
              onDisconnect={() => disconnectApplication(applicationId)}
              onDelete={() => deleteApplication(applicationId)}
            />
          ) : !selectedApplication && (
            <section aria-labelledby="applications-title">
              <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
                <h2 className="font-sans text-xl font-semibold text-white" id="applications-title">{activePage === 'Alerts' ? 'Applications needing attention' : 'Applications'}</h2>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 text-sm text-slate-500">{filteredApplications.length} shown</span>
                  {activePage === 'Applications' && <button className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:h-10 sm:flex-none" onClick={() => { setAddError(''); setShowAddApplication(true) }} type="button"><FiPlus />Add application</button>}
                </div>
              </div>
              <div className="space-y-3">
                {filteredApplications.map((application) => <ApplicationRow application={application} key={application.name} onView={(app) => onNavigate(`/applications/${getApplicationId(app)}`)} />)}
                {filteredApplications.length === 0 && <FeedbackState title={applications.length === 0 ? 'No applications yet' : 'No matching applications'} message={applications.length === 0 ? 'Add an application to begin monitoring.' : 'Try another application name, provider, or status.'} />}
              </div>
            </section>
          )}
        </div>
      </section>
      {showAddApplication && (
        <div className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/75 p-4" onClick={() => setShowAddApplication(false)}>
          <section aria-labelledby="add-app-title" aria-modal="true" className="my-auto w-full max-w-lg rounded-lg border border-[#303647] bg-[#10131b] p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white" id="add-app-title">Add application</h2>
                <p className="mt-1 text-sm text-slate-400">Add a deployment to your monitored applications.</p>
              </div>
              <button aria-label="Close add application form" className="rounded-md p-2 text-slate-400 hover:bg-[#252b3b] hover:text-white" onClick={() => setShowAddApplication(false)} type="button"><FiX /></button>
            </div>
            <form className="space-y-4" onSubmit={handleAddApplication}>
              <label className="block text-sm font-medium text-slate-200" htmlFor="application-name">Application name
                <input className="mt-1.5 h-11 w-full rounded-md border border-[#303647] bg-[#191d28] px-3 text-white outline-none focus:border-blue-500" id="application-name" name="name" placeholder="Payments API" required />
              </label>
              <label className="block text-sm font-medium text-slate-200" htmlFor="application-provider">Hosting provider
                <select className="mt-1.5 h-11 w-full rounded-md border border-[#303647] bg-[#191d28] px-3 text-white outline-none focus:border-blue-500" defaultValue="AWS" id="application-provider" name="provider">
                  <option>AWS</option><option>Render</option><option>Vercel</option><option>Other</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-200" htmlFor="application-endpoint">Application URL or health endpoint
                <input className="mt-1.5 h-11 w-full rounded-md border border-[#303647] bg-[#191d28] px-3 text-white outline-none focus:border-blue-500" id="application-endpoint" name="endpoint" placeholder="https://api.example.com/health" required type="url" />
              </label>
              <label className="block text-sm font-medium text-slate-200" htmlFor="application-region">Region <span className="font-normal text-slate-500">(optional)</span>
                <input className="mt-1.5 h-11 w-full rounded-md border border-[#303647] bg-[#191d28] px-3 text-white outline-none focus:border-blue-500" id="application-region" name="region" placeholder="us-east-1" />
              </label>
              <p className="text-xs leading-5 text-slate-400">The app will be saved as Pending setup. Live health and performance checks require a monitoring backend.</p>
              {addError && <FeedbackState compact title={addError} variant="error" />}
              <div className="flex justify-end gap-2 pt-1">
                <button className="h-10 rounded-md border border-[#303647] px-4 text-sm font-medium text-slate-300 hover:bg-[#202535]" onClick={() => setShowAddApplication(false)} type="button">Cancel</button>
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500" type="submit"><FiPlus />Add application</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}