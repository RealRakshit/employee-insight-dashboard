import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEmployees } from '../api/tableApi.js'

const ROW_HEIGHT = 40          // px
const VIEWPORT_HEIGHT = 480    // px (approx panel height)
const BUFFER_ROWS = 5          // upar + neeche extra rows

export default function ListPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // INTENTIONAL BUG (required by assignment):
  // Adds a global resize listener but never removes it -> memory leak / wasted work.
  useEffect(() => {
    const onResize = () => {
      // touch state on every resize without changing value
      setScrollTop((v) => v)
    }
    window.addEventListener('resize', onResize)
    // no cleanup on purpose (violates best practice)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await fetchEmployees()
        if (!cancelled) {
          // yahan ek baar console.log(data) karke actual fields dekh lena
          setRows(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load data')
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

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const totalHeight = rows.length * ROW_HEIGHT

  const { startIndex, endIndex, offsetTop } = useMemo(() => {
    const rawStart = Math.floor(scrollTop / ROW_HEIGHT)
    const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT)

    let start = Math.max(rawStart - BUFFER_ROWS, 0)
    let end = Math.min(rawStart + visibleCount + BUFFER_ROWS, rows.length - 1)

    const top = start * ROW_HEIGHT

    return { startIndex: start, endIndex: end, offsetTop: top }
  }, [scrollTop, rows.length])

  const visibleRows = useMemo(() => {
    if (!rows.length) return []
    return rows.slice(startIndex, endIndex + 1)
  }, [rows, startIndex, endIndex])

  if (loading) {
    return <div className="text-slate-200">Loading employees…</div>
  }

  if (error) {
    return (
      <div className="text-red-400">
        Error loading employees:{' '}
        <span className="font-mono text-xs">{error}</span>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="space-y-2">
        <div className="text-slate-300">No employees found.</div>
        <p className="text-xs text-slate-500">
          If this keeps showing, the backend may be returning an unexpected shape.
        </p>
      </div>
    )
  }

  // Derive columns from the first row so that the table always shows something,
  // even if the API uses different field names.
  const derivedColumns = Object.keys(rows[0] || {})
  const preferred = ['id', 'name', 'city', 'salary']
  const columns =
    preferred.filter((k) => derivedColumns.includes(k)).length > 0
      ? preferred.filter((k) => derivedColumns.includes(k))
      : derivedColumns.slice(0, 6)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-100">Employees</h1>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-lg shadow-black/30 overflow-hidden">
        {/* scroll container */}
        <div
          ref={containerRef}
          className="relative overflow-y-auto"
          style={{ height: VIEWPORT_HEIGHT }}
          onScroll={handleScroll}
        >
          {/* spacer for full scroll height */}
          <div style={{ height: totalHeight, position: 'relative' }}>
            {/* actual visible rows wrapper */}
            <table
              className="absolute left-0 right-0 text-sm border-collapse"
              style={{ top: offsetTop }}
            >
              <thead className="bg-slate-900/80 sticky top-0 z-10">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-medium uppercase tracking-wide text-[11px] text-slate-400 bg-slate-900/90"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => {
                  const actualIndex = startIndex + idx
                  const key = row.id ?? actualIndex

                  return (
                    <tr
                      key={key}
                      style={{ height: ROW_HEIGHT }}
                      className="cursor-pointer border-b border-slate-800/60 hover:bg-slate-800/60"
                      onClick={() =>
                        navigate(`/details/${row.id ?? actualIndex}`, { state: { employee: row } })
                      }
                    >
                      {columns.map((col) => (
                        <td key={col} className="px-3 py-2 text-slate-100">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Custom virtualized grid: only visible rows are rendered.
      </p>
    </div>
  )
}