import React, { useState, useEffect } from 'react'
import { useScore } from '../contexts/ScoreContext'
import { useAuth } from '../contexts/AuthContext'
import { Check, X, Trophy } from 'lucide-react'
import axios from 'axios'
import { useMobileClick } from '../hooks/useMobileClick'

interface HoleScore {
  hole_number: number
  score: number
}

interface CourseInfo {
  name: string
  hole_pars: Record<string, number>
  total_par: number
}

const ScoreEntry: React.FC = () => {
  const [selectedHole, setSelectedHole] = useState<number>(1)
  const [score, setScore] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [existingScores, setExistingScores] = useState<HoleScore[]>([])
  const [isLoadingScores, setIsLoadingScores] = useState(false)
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  
  const { submitScore } = useScore()
  const { team } = useAuth()

  const holes = Array.from({ length: 18 }, (_, i) => i + 1)

  // Fetch course information
  useEffect(() => {
    const fetchCourseInfo = async () => {
      setIsLoadingCourse(true)
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/courses/current`)
        setCourseInfo(response.data)
      } catch (error) {
        console.error('Failed to fetch course info:', error)
      } finally {
        setIsLoadingCourse(false)
      }
    }

    fetchCourseInfo()
  }, [])

  // Fetch existing scores for the team
  useEffect(() => {
    const fetchExistingScores = async () => {
      if (!team) return
      
      setIsLoadingScores(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/scores/team/${team.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setExistingScores(response.data.scores)
      } catch (error) {
        console.error('Failed to fetch existing scores:', error)
      } finally {
        setIsLoadingScores(false)
      }
    }

    fetchExistingScores()
  }, [team])

  // Update score input when hole selection changes
  useEffect(() => {
    const existingScore = existingScores.find(s => s.hole_number === selectedHole)
    if (existingScore) {
      setScore(existingScore.score.toString())
    } else {
      setScore('')
    }
  }, [selectedHole, existingScores])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 1) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    // Safari-specific: Use setTimeout to break out of the form submission context
    setTimeout(async () => {
      try {
        const success = await submitScore(selectedHole, scoreNum)
        
        if (success) {
          setSubmitStatus('success')
          setScore('')
          // Refresh existing scores
          const token = localStorage.getItem('token')
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/scores/team/${team?.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            setExistingScores(response.data.scores)
          } catch (error) {
            console.error('Failed to refresh scores:', error)
          }
          // Auto-advance to next hole if not on last hole
          if (selectedHole < 18) {
            setSelectedHole(selectedHole + 1)
          }
        } else {
          setSubmitStatus('error')
        }
      } catch (error) {
        console.error('Score submission error:', error)
        setSubmitStatus('error')
      } finally {
        setIsSubmitting(false)
      }
    }, 0)
  }

  const resetForm = () => {
    setScore('')
    setSubmitStatus('idle')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Score</h1>
        <p className="text-gray-600">Submit your team's score for each hole</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Team: {team?.name}</h2>
          <p className="text-sm text-gray-500">Select a hole and enter your score</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6" 
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
          autoComplete="off"
          noValidate
        >
          {/* Hole Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Hole
            </label>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
              {holes.map((hole) => {
                const hasScore = existingScores.some(s => s.hole_number === hole)
                const par = courseInfo?.hole_pars[hole.toString()] || 0
                return (
                  <button
                    key={hole}
                    type="button"
                    {...useMobileClick(() => {
                      console.log('Hole selected:', hole)
                      setSelectedHole(hole)
                    })}
                    className={`p-3 rounded-lg border-2 font-semibold transition-colors relative ${
                      selectedHole === hole
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : hasScore
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">{hole}</div>
                      <div className="text-xs text-gray-500">Par {par}</div>
                    </div>
                    {hasScore && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Score Input */}
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
              Score for Hole {selectedHole}
              {courseInfo && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Par {courseInfo.hole_pars[selectedHole.toString()] || 0})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="score"
                type="number"
                min="1"
                max="20"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="input text-center text-2xl font-bold"
                placeholder="Enter score"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Trophy className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Enter the total strokes for this hole
              {courseInfo && score && (
                <span className="ml-2">
                  • Relative to par: {(() => {
                    const scoreNum = parseInt(score)
                    const par = courseInfo.hole_pars[selectedHole.toString()] || 0
                    const relative = scoreNum - par
                    if (relative === 0) return 'E'
                    if (relative > 0) return `+${relative}`
                    return `${relative}`
                  })()}
                </span>
              )}
            </p>
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-800">Score submitted successfully!</span>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">Failed to submit score. Please try again.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || !score}
              className="btn btn-primary flex-1 flex items-center justify-center"
              style={{ 
                WebkitAppearance: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Score
                </>
              )}
            </button>
            
            <button
              type="button"
              {...useMobileClick(resetForm)}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Quick Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enter the total strokes for the hole (including penalty strokes)</li>
          <li>• Scores are automatically saved and visible on the leaderboard</li>
          <li>• You can update scores by submitting the same hole again</li>
          <li>• The form will automatically advance to the next hole after submission</li>
        </ul>
      </div>
    </div>
  )
}

export default ScoreEntry 