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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to={isAuthenticated ? '/list' : '/login'} className="font-semibold text-lg">
            Employee Insights Dashboard
          </Link>
          {isAuthenticated && (
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/list">List</Link>
              <Link to="/analytics">Analytics</Link>
              <button
                onClick={logout}
                className="rounded border border-slate-600 px-3 py-1 text-xs hover:bg-slate-800"
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