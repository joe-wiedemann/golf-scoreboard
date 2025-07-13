import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { team, isLoading } = useAuth()
  
  console.log('ProtectedRoute - team:', team, 'isLoading:', isLoading)

  if (isLoading) {
    console.log('ProtectedRoute - showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!team) {
    console.log('ProtectedRoute - redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - rendering children')
  return <>{children}</>
}

export default ProtectedRoute 