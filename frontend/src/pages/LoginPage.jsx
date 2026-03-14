import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/list')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(username.trim(), password)
    if (!result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
        <h1 className="text-xl font-semibold mb-1">Login</h1>
        <p className="text-sm text-slate-400 mb-4">
          Use <span className="font-mono">testuser / Test123</span> to sign in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Username</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Password</label>
            <input
              type="password"
              className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 border border-red-500/40 bg-red-950/40 rounded px-2 py-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded bg-indigo-600 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}