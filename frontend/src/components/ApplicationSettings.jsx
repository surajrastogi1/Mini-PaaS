import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiAlertTriangle, FiLink, FiSave, FiTrash2 } from 'react-icons/fi'
import ConfirmationDialog from './ConfirmationDialog.jsx'
import FeedbackState from './FeedbackState.jsx'

const inputClass = 'mt-1.5 h-11 w-full rounded-md border border-[#303647] bg-[#191d28] px-3 text-white outline-none focus:border-blue-500'

export default function ApplicationSettings({ application, applicationId, onBack, onSave, onDisconnect, onDelete }) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [monitoringEnabled, setMonitoringEnabled] = useState(application.monitoringEnabled !== false)
  const [confirmation, setConfirmation] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const didSave = onSave({
      name: form.get('name').trim(),
      environment: form.get('environment'),
      monitoringEnabled: form.get('monitoringEnabled') === 'on',
      monitoringInterval: Number(form.get('monitoringInterval')),
    })
    setSaved(didSave)
    setError(didSave ? '' : 'Settings could not be saved in browser storage.')
    if (didSave) toast.success('Application settings saved.')
    else toast.error('Settings could not be saved.')
  }

  function confirmAction({ title, message, confirmLabel, action, successMessage, onSuccess, destructive }) {
    setConfirmation({ title, message, confirmLabel, action, successMessage, onSuccess, destructive })
  }

  function handleConfirm() {
    if (!confirmation.action()) {
      setError('The application could not be updated in browser storage.')
      toast.error('The application could not be updated.')
      setConfirmation(null)
      return
    }
    toast.success(confirmation.successMessage)
    confirmation.onSuccess?.()
    setConfirmation(null)
  }

  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="application-settings-title">
      <button className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white" onClick={onBack} type="button"><FiArrowLeft />Back to applications</button>
      <div className="mb-6">
        <p className="text-sm text-slate-500">Settings / {application.name}</p>
        <h1 className="mt-1 text-3xl font-semibold text-white" id="application-settings-title">Application settings</h1>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <section className="rounded-lg border border-[#242a3a] bg-[#0b0d14] p-5 sm:p-6" aria-labelledby="application-info-title">
          <h2 className="font-semibold text-white" id="application-info-title">Application information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="settings-app-name">Application name
              <input className={inputClass} defaultValue={application.name} id="settings-app-name" name="name" required />
            </label>
            <label className="block text-sm font-medium text-slate-200" htmlFor="settings-app-id">Application ID
              <input className={`${inputClass} text-slate-400`} id="settings-app-id" readOnly value={applicationId} />
            </label>
            <label className="block text-sm font-medium text-slate-200 sm:col-span-2" htmlFor="settings-environment">Environment
              <select className={inputClass} defaultValue={application.environment || 'Production'} id="settings-environment" name="environment">
                <option>Production</option><option>Staging</option><option>Development</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-[#242a3a] bg-[#0b0d14] p-5 sm:p-6" aria-labelledby="monitoring-settings-title">
          <h2 className="font-semibold text-white" id="monitoring-settings-title">Monitoring</h2>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-200">Monitoring status</p>
              <p className="mt-1 text-sm text-slate-400">Enable or pause monitoring for this application.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input aria-label="Monitoring status" checked={monitoringEnabled} className="peer sr-only" id="monitoring-enabled" name="monitoringEnabled" onChange={(event) => setMonitoringEnabled(event.target.checked)} role="switch" type="checkbox" />
              <span className="relative h-6 w-11 rounded-full bg-[#3a4050] transition-colors peer-checked:bg-blue-600 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400" />
              {monitoringEnabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
          <label className="mt-5 block max-w-sm text-sm font-medium text-slate-200" htmlFor="monitoring-interval">Monitoring interval
            <select className={inputClass} defaultValue={application.monitoringInterval || 5} id="monitoring-interval" name="monitoringInterval">
              <option value="1">Every minute</option><option value="5">Every 5 minutes</option><option value="10">Every 10 minutes</option><option value="30">Every 30 minutes</option><option value="60">Every hour</option>
            </select>
          </label>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {error && <FeedbackState compact message={error} title={error} variant="error" />}
          {!error && saved && <FeedbackState compact title="Settings saved." variant="success" />}
          <button className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500" type="submit"><FiSave />Save settings</button>
        </div>
      </form>

      <section className="mt-8 rounded-lg border border-rose-900/70 bg-[#130c11] p-5 sm:p-6" aria-labelledby="danger-zone-title">
        <div className="flex items-center gap-2 text-rose-300">
          <FiAlertTriangle />
          <h2 className="font-semibold" id="danger-zone-title">Danger zone</h2>
        </div>
        <div className="mt-5 divide-y divide-rose-950/80">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
            <div><h3 className="text-sm font-medium text-white">Disconnect application</h3><p className="mt-1 text-sm text-slate-400">Stop monitoring this application. It will remain in your list.</p></div>
            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-800 px-3 text-sm font-medium text-rose-300 hover:bg-rose-950/60" onClick={() => confirmAction({ title: 'Disconnect application?', message: `Monitoring for ${application.name} will stop, but the application will remain in your list.`, confirmLabel: 'Disconnect', action: onDisconnect, successMessage: 'Application monitoring disconnected.', onSuccess: () => setMonitoringEnabled(false), destructive: true })} type="button"><FiLink />Disconnect</button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 pb-0">
            <div><h3 className="text-sm font-medium text-white">Delete application</h3><p className="mt-1 text-sm text-slate-400">Remove this application and its saved settings from this dashboard.</p></div>
            <button className="inline-flex h-9 items-center gap-2 rounded-md bg-rose-700 px-3 text-sm font-semibold text-white hover:bg-rose-600" onClick={() => confirmAction({ title: 'Delete application?', message: `${application.name} and its saved settings will be removed from this dashboard. This cannot be undone.`, confirmLabel: 'Delete application', action: onDelete, successMessage: 'Application deleted.', destructive: true })} type="button"><FiTrash2 />Delete</button>
          </div>
        </div>
      </section>
      {confirmation && <ConfirmationDialog {...confirmation} onCancel={() => setConfirmation(null)} onConfirm={handleConfirm} />}
    </section>
  )
}