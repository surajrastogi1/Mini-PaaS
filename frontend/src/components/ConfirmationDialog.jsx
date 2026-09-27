import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmationDialog({ title, message, confirmLabel, onCancel, onConfirm, destructive = false }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-4" onClick={onCancel}>
      <section aria-describedby="confirmation-message" aria-labelledby="confirmation-title" aria-modal="true" className="w-full max-w-md rounded-lg border border-[#303647] bg-[#10131b] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} role="alertdialog">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md ${destructive ? 'bg-rose-950 text-rose-300' : 'bg-blue-950 text-blue-300'}`}><FiAlertTriangle /></span>
          <div>
            <h2 className="font-semibold text-white" id="confirmation-title">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-400" id="confirmation-message">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button autoFocus className="h-10 rounded-md border border-[#303647] px-4 text-sm font-medium text-slate-300 hover:bg-[#202535]" onClick={onCancel} type="button">Cancel</button>
          <button className={`h-10 rounded-md px-4 text-sm font-semibold text-white ${destructive ? 'bg-rose-700 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-500'}`} onClick={onConfirm} type="button">{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}