import { FiChevronRight, FiSettings } from 'react-icons/fi'

export default function SettingsPage({ applications, onSelectApplication }) {
  return (
    <section aria-labelledby="settings-title">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white" id="settings-title">Application settings</h2>
        <p className="mt-1 text-sm text-slate-400">Choose an application to manage its information and monitoring.</p>
      </div>
      <div className="divide-y divide-[#202535] rounded-lg border border-[#242a3a] bg-[#0b0d14]">
        {applications.map((application) => (
          <button className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left first:rounded-t-lg last:rounded-b-lg hover:bg-[#121621] sm:px-5" key={application.id || application.name} onClick={() => onSelectApplication(application)} type="button">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#202535] text-slate-300"><FiSettings /></span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-white">{application.name}</span>
                <span className="mt-1 block text-sm text-slate-400">{application.provider} · {application.environment || 'Production'}</span>
              </span>
            </span>
            <FiChevronRight className="shrink-0 text-slate-500" />
          </button>
        ))}
        {applications.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No applications have been added.</p>}
      </div>
    </section>
  )
}