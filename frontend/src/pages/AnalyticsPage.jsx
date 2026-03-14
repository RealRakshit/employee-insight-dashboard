import { useLocation } from 'react-router-dom'

const AUDIT_STORAGE_KEY = 'employee-dashboard-audit-image'

export default function AnalyticsPage() {
  const location = useLocation()
  const auditImage = location.state?.auditImage || localStorage.getItem(AUDIT_STORAGE_KEY)

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-slate-100">Analytics</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="font-semibold text-slate-100 mb-2">Audit Image (Photo + Signature)</h2>
        {auditImage ? (
          <img
            src={auditImage}
            alt="Audit"
            className="w-full max-w-2xl rounded-lg border border-slate-800"
          />
        ) : (
          <p className="text-sm text-slate-400">
            No audit image yet. Go to Details page and capture + sign.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-400">
          Next: yahan salary distribution ka custom SVG chart + city map add karenge.
        </p>
      </div>
    </div>
  )
}