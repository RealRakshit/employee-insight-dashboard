import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchEmployees } from '../api/tableApi.js'

const AUDIT_STORAGE_KEY = 'employee-dashboard-audit-image'

// simple hardcoded city -> coordinate map (pseudo map, not real lat/long)
const CITY_COORDS = {
  Mumbai: { x: 120, y: 260 },
  Delhi: { x: 170, y: 150 },
  Bengaluru: { x: 140, y: 280 },
  Chennai: { x: 180, y: 310 },
  Kolkata: { x: 240, y: 190 },
  Hyderabad: { x: 160, y: 260 },
}

export default function AnalyticsPage() {
  const location = useLocation()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const auditImage =
    location.state?.auditImage || localStorage.getItem(AUDIT_STORAGE_KEY)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await fetchEmployees()
        if (!cancelled) {
          setRows(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load analytics data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const salaryByCity = useMemo(() => {
    const map = new Map()
    for (const row of rows) {
      const city =
        row.city || row.City || row.CITY || row.location || 'Unknown'
      const salary = Number(
        row.salary || row.SALARY || row.ctc || row.CTC || 0,
      )
      if (!map.has(city)) {
        map.set(city, { city, total: 0, count: 0 })
      }
      const entry = map.get(city)
      entry.total += salary
      entry.count += 1
    }
    return Array.from(map.values()).map((e) => ({
      city: e.city,
      avgSalary: e.count ? e.total / e.count : 0,
      count: e.count,
    }))
  }, [rows])

  // chart dimensions
  const chartWidth = 500
  const chartHeight = 220
  const padding = 40

  const maxSalary =
    salaryByCity.length > 0
      ? Math.max(...salaryByCity.map((c) => c.avgSalary))
      : 0

  const barWidth =
    salaryByCity.length > 0
      ? (chartWidth - padding * 2) / salaryByCity.length
      : 0

  if (loading) {
    return <div className="text-slate-200">Loading analytics…</div>
  }

  if (error) {
    return (
      <div className="text-red-400">
        Error loading analytics:{' '}
        <span className="font-mono text-xs">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-100">Analytics</h1>

      {/* Audit image card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-lg shadow-black/30 p-4 space-y-2">
        <h2 className="font-semibold text-slate-100">Audit Image (Photo + Signature)</h2>
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

      {/* Salary distribution chart */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-lg shadow-black/30 p-4 space-y-2">
        <h2 className="font-semibold text-slate-100">Salary Distribution per City</h2>
        {salaryByCity.length === 0 ? (
          <p className="text-sm text-slate-400">No salary data available.</p>
        ) : (
          <svg
            width={chartWidth}
            height={chartHeight}
            className="bg-slate-950/60 rounded border border-slate-800"
          >
            {/* axes */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke="#64748b"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#64748b"
              strokeWidth="1"
            />

            {/* y-axis labels (0 and max) */}
            <text
              x={padding - 8}
              y={chartHeight - padding}
              textAnchor="end"
              fontSize="10"
              fill="#94a3b8"
            >
              0
            </text>
            <text
              x={padding - 8}
              y={padding + 4}
              textAnchor="end"
              fontSize="10"
              fill="#94a3b8"
            >
              {Math.round(maxSalary)}
            </text>

            {/* bars */}
            {salaryByCity.map((entry, index) => {
              const x = padding + index * barWidth + barWidth * 0.1
              const valueRatio = maxSalary ? entry.avgSalary / maxSalary : 0
              const barHeight = valueRatio * (chartHeight - padding * 2)
              const y = chartHeight - padding - barHeight
              return (
                <g key={entry.city}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth * 0.8}
                    height={barHeight}
                    rx="3"
                    fill="#4f46e5"
                  />
                  {/* city label */}
                  <text
                    x={x + barWidth * 0.4}
                    y={chartHeight - padding + 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#cbd5f5"
                  >
                    {entry.city}
                  </text>
                  {/* value label */}
                  <text
                    x={x + barWidth * 0.4}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#e5e7eb"
                  >
                    {Math.round(entry.avgSalary)}
                  </text>
                </g>
              )
            })}
          </svg>
        )}
        <p className="text-xs text-slate-500">
          Chart rendered using raw SVG elements (no chart library).
        </p>
      </div>

      {/* City map */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-lg shadow-black/30 p-4 space-y-2">
        <h2 className="font-semibold text-slate-100">City Map (Approximate)</h2>
        <svg
          viewBox="0 0 320 360"
          className="w-full max-w-md bg-slate-950/60 rounded border border-slate-800"
        >
          {/* simple background to suggest India-like shape (very rough) */}
          <path
            d="M80 40 L 200 40 L 260 120 L 220 220 L 180 260 L 140 320 L 80 280 L 60 200 L 40 120 Z"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* cities with labeled markers */}
          {salaryByCity.map((entry) => {
            const coord = CITY_COORDS[entry.city]
            if (!coord) return null
            const size = 4 + Math.min(entry.count, 8)
            return (
              <g key={entry.city}>
                <circle cx={coord.x} cy={coord.y} r={size} fill="#22c55e" />

                {/* label background */}
                <rect
                  x={coord.x + 6}
                  y={coord.y - 14}
                  rx={3}
                  ry={3}
                  width={70}
                  height={16}
                  fill="rgba(15,23,42,0.9)"
                  stroke="#334155"
                  strokeWidth="0.5"
                />

                {/* label text: city + count */}
                <text
                  x={coord.x + 10}
                  y={coord.y - 3}
                  fontSize="9"
                  fill="#e5e7eb"
                >
                  {entry.city} ({entry.count})
                </text>
              </g>
            )
          })}
        </svg>
        <p className="text-xs text-slate-500">
          City positions are hardcoded (city → x,y) to approximate a map. No map
          library is used here.
        </p>
      </div>
    </div>
  )
}