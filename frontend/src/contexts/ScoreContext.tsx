import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface TeamScore {
  id: number
  name: string
  players: string
  total_score: number
  total_par: number
  relative_to_par: number
  par_display: string
}

interface ScoreContextType {
  leaderboard: TeamScore[]
  isLoading: boolean
  error: string | null
  refreshLeaderboard: () => Promise<void>
  submitScore: (holeNumber: number, score: number) => Promise<boolean>
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined)

export const useScore = () => {
  const context = useContext(ScoreContext)
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider')
  }
  return context
}

interface ScoreProviderProps {
  children: ReactNode
}

export const ScoreProvider: React.FC<ScoreProviderProps> = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState<TeamScore[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshLeaderboard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/courses/leaderboard`)
      setLeaderboard(response.data.leaderboard)
    } catch (err) {
      setError('Failed to load leaderboard')
      console.error('Leaderboard fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const submitScore = async (holeNumber: number, score: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/scores`,
        {
          hole_number: holeNumber,
          score: score
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      await refreshLeaderboard()
      return true
    } catch (err) {
      console.error('Score submission error:', err)
      return false
    }
  }

  useEffect(() => {
    refreshLeaderboard()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(refreshLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const value = {
    leaderboard,
    isLoading,
    error,
    refreshLeaderboard,
    submitScore
  }

  return (
    <ScoreContext.Provider value={value}>
      {children}
    </ScoreContext.Provider>
  )
} 