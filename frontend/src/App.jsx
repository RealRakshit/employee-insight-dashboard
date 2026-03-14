import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ListPage from './pages/ListPage.jsx'
import DetailsPage from './pages/DetailsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function AppShell({ children }) {
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link
            to={isAuthenticated ? '/list' : '/login'}
            className="font-semibold text-lg tracking-tight"
          >
            <span className="text-indigo-400">Employee</span>{' '}
            <span className="text-slate-100">Insights</span>
          </Link>
          {isAuthenticated && (
            <nav className="flex items-center gap-2 text-sm">
              <Link
                to="/list"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800/70 text-slate-200"
              >
                List
              </Link>
              <Link
                to="/analytics"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800/70 text-slate-200"
              >
                Analytics
              </Link>
              <button
                onClick={logout}
                className="ml-2 inline-flex items-center rounded-md border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800/80 hover:border-slate-500/80 transition-colors"
              >
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/list" element={<ListPage />} />
          <Route path="/details/:id" element={<DetailsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App