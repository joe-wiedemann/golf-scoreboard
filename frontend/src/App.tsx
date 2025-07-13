import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ScoreProvider } from './contexts/ScoreContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Leaderboard from './pages/Leaderboard'
import ScoreEntry from './pages/ScoreEntry'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  console.log('App component rendering')
  return (
    <AuthProvider>
      <ScoreProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Leaderboard />} />
                <Route path="score" element={<ScoreEntry />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ScoreProvider>
    </AuthProvider>
  )
}

export default App 