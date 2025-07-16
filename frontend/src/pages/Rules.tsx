import React from 'react'
import { BookOpen } from 'lucide-react'

const Rules: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rules</h1>
          <p className="text-gray-600">Tournament format and guidelines</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Tournament Rules</h2>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          {/* Opener */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Opener</h3>
            <p className="text-gray-700 leading-relaxed">
              This tournament will be played in a 2-man scramble format. For a given team, both golfers will take a tee shot and then select the better of the two attempts until the ball is holed.
            </p>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Rules</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Both team members must contribute at least 1 shot per hole</li>
              <li>All hazards will be treated as red stakes (lateral drop + penalty)</li>
              <li>The ball may be placed within 4 feet of the natural resting position in a preferred lie</li>
              <li>A ball may be move from the rough to the fairway if it is within the radius (general area → general area)</li>
              <li>A ball may not be placed on the green, or out of a bunker</li>
              <li>Bunkers are lift, rake, and place</li>
              <li>The paired teams will arbitrate each others scores</li>
            </ol>
          </div>

          {/* Quote */}
          <div className="bg-gray-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
            <blockquote className="italic text-gray-700">
              "Honestly, I would start stroking guys. If you are going to take that long, you have to get stroked"
            </blockquote>
            <cite className="block text-sm text-gray-500 mt-2">— Brooks Koepka</cite>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rules 