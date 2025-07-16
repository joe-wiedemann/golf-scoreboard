import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface Team {
  id: number
  name: string
  players: string[]
}

interface AuthContextType {
  team: Team | null
  token: string | null
  login: (teamName: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [team, setTeam] = useState<Team | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          // Use relative URL for production, full URL for development
          const apiUrl = window.location.protocol === 'https:' ? '/auth/me' : `${import.meta.env.VITE_API_URL}/auth/me`
          const response = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
          setTeam(response.data.team)
          setToken(storedToken)
        } catch (error) {
          console.log('Auth initialization error:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (teamName: string, password: string): Promise<boolean> => {
    try {
      // Use relative URL for production, full URL for development
      const apiUrl = window.location.protocol === 'https:' ? '/auth/login' : `${import.meta.env.VITE_API_URL}/auth/login`
      const response = await axios.post(apiUrl, {
        team_name: teamName,
        password: password
      })
      
      const { access_token, team } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setTeam(team)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setTeam(null)
  }

  const value = {
    team,
    token,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 