import { useState } from 'react'
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiTerminal } from 'react-icons/fi'

function getDemoLogs(application) {
  if (application.status === 'Pending setup' || application.status === 'Disconnected' || application.status === 'Monitoring disabled' || application.monitoringEnabled === false) return []

  if (application.status === 'Warning') {
    return [
      { time: '2 min ago', level: 'WARN', source: 'resource-monitor', message: `CPU usage reached ${application.cpu}%. Check for a recent workload increase.` },
      { time: '3 min ago', level: 'WARN', source: 'resource-monitor', message: `Memory usage reached ${application.memory}%. Review the application's memory usage.` },
      { time: '5 min ago', level: 'INFO', source: 'health-check', message: 'Application is responding to health checks.' },
    ]
  }

  return [
    { time: '2 min ago', level: 'INFO', source: 'health-check', message: 'Health check passed.' },
    { time: '3 min ago', level: 'INFO', source: 'resource-monitor', message: `CPU ${application.cpu}% · Memory ${application.memory}%.` },
    { time: '5 min ago', level: 'INFO', source: 'request-monitor', message: `${application.requests || 'No'} requests recorded in the sample period.` },
  ]
}

const levelStyles = {
  WARN: { icon: FiAlertTriangle, className: 'text-amber-400' },
  ERROR: { icon: FiAlertTriangle, className: 'text-rose-400' },
  INFO: { icon: FiInfo, className: 'text-blue-300' },
}

export default function ApplicationLogs({ application }) {
  const [level, setLevel] = useState('ALL')
  const logs = getDemoLogs(application)
  const visibleLogs = level === 'ALL' ? logs : logs.filter((entry) => entry.level === level)

  return (
    <section aria-labelledby="application-logs-title" className="mt-5 rounded-lg border border-[#242a3a] bg-[#0b0d14]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242a3a] px-5 py-4">
        <div className="flex items-center gap-2">
          <FiTerminal className="text-slate-400" />
          <h2 className="font-semibold text-white" id="application-logs-title">Application logs</h2>
          <span className="rounded border border-[#303647] px-1.5 py-0.5 text-[10px] uppercase text-slate-500">Demo</span>
        </div>
        {logs.length > 0 && (
          <div aria-label="Filter logs by level" className="flex rounded-md border border-[#303647] p-0.5" role="group">
            {['ALL', 'WARN', 'ERROR', 'INFO'].map((option) => (
              <button aria-pressed={level === option} className={`rounded px-2 py-1 text-xs ${level === option ? 'bg-[#252b3b] text-white' : 'text-slate-400 hover:text-white'}`} key={option} onClick={() => setLevel(option)} type="button">{option}</button>
            ))}
          </div>
        )}
      </div>

      {visibleLogs.length > 0 ? (
        <ul className="divide-y divide-[#202535]">
          {visibleLogs.map((entry) => {
            const { icon: Icon, className } = levelStyles[entry.level]
            return (
              <li className="grid gap-2 px-5 py-3 sm:grid-cols-[100px_68px_150px_minmax(0,1fr)] sm:items-start" key={`${entry.time}-${entry.source}`}>
                <time className="text-xs text-slate-500">{entry.time}</time>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${className}`}><Icon />{entry.level}</span>
                <span className="text-xs text-slate-400">{entry.source}</span>
                <p className="break-words text-sm leading-5 text-slate-300">{entry.message}</p>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex items-center gap-3 px-5 py-6 text-sm text-slate-400">
          <FiCheckCircle className="shrink-0 text-slate-500" />
          {logs.length === 0 ? 'Logs are unavailable while monitoring is disconnected or not configured.' : `No ${level.toLowerCase()} log entries.`}
        </div>
      )}
      <p className="border-t border-[#202535] px-5 py-3 text-xs text-slate-500">Example entries only. Connect a log source to view live application output.</p>
    </section>
  )
}