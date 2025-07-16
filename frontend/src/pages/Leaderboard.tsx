import React, { useState } from 'react'
import { useScore } from '../contexts/ScoreContext'
import { Trophy, Medal, RefreshCw, X } from 'lucide-react'
import axios from 'axios'
import { useMobileClick } from '../hooks/useMobileClick'

// Add type declaration for Vite env
declare global {
  interface ImportMeta {
    readonly env: Record<string, string>
  }
}

interface TeamScore {
  id: number
  name: string
  players: string
  total_score: number
  total_par: number
  relative_to_par: number
  par_display: string
}

interface HoleScore {
  hole: number
  par: number
  score: number
  relative_to_par: number
  par_display: string
}

const Leaderboard: React.FC = () => {
  const { leaderboard, isLoading, error, refreshLeaderboard } = useScore()
  const [selectedTeam, setSelectedTeam] = useState<TeamScore | null>(null)
  const [teamScores, setTeamScores] = useState<HoleScore[]>([])
  const [isLoadingScores, setIsLoadingScores] = useState(false)

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-semibold text-gray-400">{index + 1}</span>
    }
  }

  const formatScore = (team: TeamScore) => {
    return team.par_display
  }

  const handleTeamClick = async (team: TeamScore) => {
    console.log('handleTeamClick called for team:', team.name)
    setIsLoadingScores(true)
    try {
      // Use relative URL for production, full URL for development
      const apiUrl = window.location.protocol === 'https:' ? `/courses/team/${team.id}/scorecard` : `${import.meta.env.VITE_API_URL}/courses/team/${team.id}/scorecard`
      const response = await axios.get(apiUrl)
      console.log('Scorecard response:', response.data)
      setTeamScores(response.data.scorecard)
      setSelectedTeam(team)
      console.log('Modal should now be visible, selectedTeam:', team.name)
    } catch (error) {
      console.error('Failed to fetch team scores:', error)
    } finally {
      setIsLoadingScores(false)
    }
  }

  const closeScorecard = () => {
    setSelectedTeam(null)
    setTeamScores([])
  }

  // Create a click handler function that can be used for all teams
  const handleTeamClickWrapper = (team: TeamScore) => {
    return () => handleTeamClick(team)
  }

  if (isLoading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshLeaderboard}
            className="btn btn-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600">Live tournament standings</p>
        </div>
        <button
          onClick={refreshLeaderboard}
          disabled={isLoading}
          className="btn btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Team Rankings</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {leaderboard.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No scores yet</h3>
              <p className="mt-1 text-sm text-gray-500">Teams will appear here once they start scoring.</p>
            </div>
          ) : (
            leaderboard.map((team, index) => (
              <div key={team.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getPositionIcon(index)}
                    </div>
                    <div>
                      <h3 
                        className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
                        {...useMobileClick(handleTeamClickWrapper(team))}
                      >
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {(() => {
                          try {
                            return team.players ? JSON.parse(team.players).join(', ') : 'No players'
                          } catch (error) {
                            console.error('Error parsing players JSON for team:', team.name, 'players:', team.players)
                            return 'Players unavailable'
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {team.par_display}
                    </div>
                    <div className="text-sm text-gray-500">
                      {team.total_score} strokes
                    </div>
                  </div>
                </div>
                
                {/* Course info */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Course Par</span>
                    <span>{team.total_par}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        team.relative_to_par <= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(team.relative_to_par) * 10 + 20, 100)}%`,
                        marginLeft: team.relative_to_par < 0 ? 'auto' : '0'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Live Updates</h3>
            <p className="text-sm text-blue-700 mt-1">
              Leaderboard automatically refreshes every 30 seconds. Pull to refresh for immediate updates.
            </p>
          </div>
        </div>
      </div>

      {/* Team Scorecard Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 9999 }}>
          {(() => { console.log('Modal is rendering for team:', selectedTeam.name); return null; })()}
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTeam.name} - Scorecard
              </h2>
              <button
                onClick={closeScorecard}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {isLoadingScores ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-1 text-sm font-medium text-gray-500">Hole</th>
                        {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
                          <th key={hole} className="py-2 px-1 text-center text-sm font-medium text-gray-500">
                            {hole}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-1 text-sm font-medium text-gray-700">Score</td>
                        {Array.from({ length: 18 }, (_, i) => {
                          const holeNumber = i + 1
                          const score = teamScores.find(s => s.hole === holeNumber)
                          return (
                            <td key={holeNumber} className="py-2 px-1 text-center">
                              {score && score.score > 0 ? (
                                <div className="flex flex-col items-center">
                                  <span className="inline-block w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {score.score}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {score.par_display}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="inline-block w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm">
                                    -
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {score ? score.par : '-'}
                                  </span>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Total Score:</span>
                        <span className="ml-2 text-lg font-bold text-gray-900">
                          {teamScores.reduce((sum, s) => sum + s.score, 0)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Holes Played:</span>
                        <span className="ml-2 text-lg font-bold text-gray-900">
                          {teamScores.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard 