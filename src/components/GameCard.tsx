'use client'

import { useState } from 'react'

interface GameCardProps {
  game: {
    id: string
    sport: string
    homeTeam: string
    awayTeam: string
    spread: number
    date: string
    isComplete: boolean
  }
  userPick: {
    pickedHome: boolean
    result: string | null
  } | null
  onPickSubmit: () => void
}

export default function GameCard({ game, userPick, onPickSubmit }: GameCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatSpread = (spread: number) => {
    if (spread > 0) return `+${spread}`
    return spread.toString()
  }

  const handlePick = async (pickedHome: boolean) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickedHome }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit pick')
      } else {
        onPickSubmit()
      }
    } catch {
      setError('Failed to submit pick')
    } finally {
      setLoading(false)
    }
  }

  const gameTime = new Date(game.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const hasStarted = new Date() > new Date(game.date)

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
          {game.sport}
        </span>
        <p className="text-gray-400 mt-2">Today at {gameTime}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center mb-6">
        {/* Away Team */}
        <div className="text-center">
          <p className="text-lg font-bold text-white">{game.awayTeam}</p>
          <p className="text-sm text-gray-400">
            {game.spread < 0 ? formatSpread(-game.spread) : ''}
          </p>
        </div>

        {/* VS */}
        <div className="text-center">
          <span className="text-gray-500 text-xl">@</span>
        </div>

        {/* Home Team */}
        <div className="text-center">
          <p className="text-lg font-bold text-white">{game.homeTeam}</p>
          <p className="text-sm text-gray-400">
            {game.spread >= 0 ? '' : formatSpread(game.spread)}
          </p>
        </div>
      </div>

      {/* Spread Info */}
      <div className="text-center mb-6 p-3 bg-gray-700 rounded-lg">
        <p className="text-gray-300 text-sm">
          {game.spread < 0 ? (
            <>
              <span className="text-white font-semibold">{game.homeTeam}</span> favored by{' '}
              <span className="text-white font-semibold">{Math.abs(game.spread)}</span>
            </>
          ) : game.spread > 0 ? (
            <>
              <span className="text-white font-semibold">{game.awayTeam}</span> favored by{' '}
              <span className="text-white font-semibold">{Math.abs(game.spread)}</span>
            </>
          ) : (
            <span className="text-white">Even matchup</span>
          )}
        </p>
      </div>

      {/* Pick buttons or status */}
      {userPick ? (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <p className="text-gray-400 mb-1">Your pick:</p>
          <p className="text-xl font-bold text-white">
            {userPick.pickedHome ? game.homeTeam : game.awayTeam}
          </p>
          {userPick.result && (
            <p className={`mt-2 font-semibold ${
              userPick.result === 'win' ? 'text-green-400' :
              userPick.result === 'loss' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {userPick.result.toUpperCase()}
            </p>
          )}
        </div>
      ) : hasStarted ? (
        <div className="text-center p-4 bg-gray-700 rounded-lg">
          <p className="text-yellow-400">Game has started - picks are locked</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handlePick(false)}
            disabled={loading}
            className="py-4 px-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-medium rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
          >
            {game.awayTeam}
          </button>
          <button
            onClick={() => handlePick(true)}
            disabled={loading}
            className="py-4 px-6 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-medium rounded-lg transition-colors border-2 border-transparent hover:border-blue-500"
          >
            {game.homeTeam}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-center mt-4">{error}</p>
      )}
    </div>
  )
}
