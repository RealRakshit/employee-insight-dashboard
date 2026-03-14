import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEmployees } from '../api/tableApi.js'

export default function ListPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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

  if (loading) return <div className="text-slate-200">Loading employees…</div>

  if (error) {
    return (
      <div className="text-red-400">
        Error loading employees:{' '}
        <span className="font-mono text-xs">{error}</span>
      </div>
    )
  }

  if (!rows.length) {
    return <div className="text-slate-300">No employees found.</div>
  }

  // yahan API ka real response dekh ke columns adjust karna:
  const columns = ['id', 'name', 'city', 'salary']

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-slate-100">Employees</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium uppercase tracking-wide text-[11px] text-slate-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => navigate(`/details/${row.id}`)}
                className="cursor-pointer border-t border-slate-800/60 hover:bg-slate-800/60"
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-slate-100">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Click any row to open the Details page.
      </p>
    </div>
  )
}