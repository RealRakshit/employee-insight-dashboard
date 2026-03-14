import { useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchEmployees } from '../api/tableApi.js'

export default function DetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const [employee, setEmployee] = useState(location.state?.employee || null)
  const [loading, setLoading] = useState(!location.state?.employee)
  const [error, setError] = useState('')

  useEffect(() => {
    // agar List se state aaya hai to refetch ki zaroorat nahi
    if (employee) return

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await fetchEmployees()
        if (cancelled) return

        const found =
          data.find((row) => String(row.id) === String(id)) ?? null

        if (!found) {
          setError('Employee not found')
        }
        setEmployee(found)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load employee')
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
  }, [employee, id])

  if (loading) {
    return <div className="text-slate-200">Loading employee details…</div>
  }

  if (error || !employee) {
    return (
      <div className="text-red-400">
        {error || 'Employee not found for this id.'}
      </div>
    )
  }

  // yahan bhi API fields ke hisaab se change kar sakte ho
  const { name, city, salary } = employee

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-100">Employee Details</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">ID</span>
          <span className="font-mono text-slate-100">{employee.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Name</span>
          <span className="text-slate-100">{name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">City</span>
          <span className="text-slate-100">{city}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Salary</span>
          <span className="text-slate-100">{salary}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Next step yahan se camera + signature capture add karenge.
      </p>
    </div>
  )
}