import React from 'react'
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
  
  // Add a simple test to see if any clicks work
  const handleTestClick = () => {
    console.log('App test click!')
    alert('App test click works!')
  }
  
  return (
    <AuthProvider>
      <ScoreProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Test button at app level */}
            <button 
              onClick={handleTestClick}
              style={{ 
                position: 'fixed', 
                top: '10px', 
                right: '10px', 
                zIndex: 9999,
                padding: '10px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              APP TEST
            </button>
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