import { FiAlertTriangle, FiCheckCircle, FiInbox, FiLoader, FiRefreshCw } from 'react-icons/fi'

const variants = {
  empty: { icon: FiInbox, color: 'text-slate-400' },
  error: { icon: FiAlertTriangle, color: 'text-rose-300' },
  success: { icon: FiCheckCircle, color: 'text-emerald-400' },
}

export default function FeedbackState({ variant = 'empty', title, message, actionLabel, onAction, compact = false }) {
  if (variant === 'loading') {
    return (
      <section aria-label={title || 'Loading'} aria-live="polite" className="rounded-lg border border-[#242a3a] bg-[#0b0d14] p-5">
        <div className="flex items-center gap-3 text-sm text-slate-300"><FiLoader className="animate-spin text-blue-300" />{title || 'Loading...'}</div>
        <div aria-hidden="true" className="mt-5 space-y-3">
          <div className="h-4 w-2/5 animate-pulse rounded bg-[#202535]" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-[#202535]" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-[#202535]" />
        </div>
      </section>
    )
  }

  const { icon: Icon, color } = variants[variant] || variants.empty

  if (compact) {
    return <p aria-live={variant === 'error' ? 'assertive' : 'polite'} className={`inline-flex items-center gap-2 text-sm ${color}`}><Icon />{title}</p>
  }

  return (
    <section aria-live={variant === 'error' ? 'assertive' : 'polite'} className="rounded-lg border border-[#242a3a] bg-[#0b0d14] px-5 py-8 text-center">
      <Icon aria-hidden="true" className={`mx-auto text-2xl ${color}`} />
      <h2 className="mt-3 font-semibold text-white">{title}</h2>
      {message && <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-slate-400">{message}</p>}
      {actionLabel && onAction && <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#303647] px-3 py-2 text-sm text-slate-200 hover:bg-[#202535]" onClick={onAction} type="button"><FiRefreshCw />{actionLabel}</button>}
    </section>
  )
}