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
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null)

  const formatSpread = (spread: number) => {
    if (spread > 0) return `+${spread}`
    return spread.toString()
  }

  const getSportBadgeClass = (sport: string) => {
    const sportLower = sport.toLowerCase()
    if (sportLower.includes('nfl') || sportLower.includes('football')) return 'sport-badge-nfl'
    if (sportLower.includes('nba') || sportLower.includes('basketball')) return 'sport-badge-nba'
    if (sportLower.includes('nhl') || sportLower.includes('hockey')) return 'sport-badge-nhl'
    if (sportLower.includes('mlb') || sportLower.includes('baseball')) return 'sport-badge-mlb'
    return 'sport-badge'
  }

  const handlePick = async (pickedHome: boolean) => {
    setLoading(true)
    setError('')
    setSelectedTeam(pickedHome ? 'home' : 'away')

    try {
      const res = await fetch('/api/game/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickedHome }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit pick')
        setSelectedTeam(null)
      } else {
        onPickSubmit()
      }
    } catch {
      setError('Failed to submit pick')
      setSelectedTeam(null)
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
    <div className="glass card-glow rounded-2xl p-6 sm:p-8 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <span className={`inline-block px-4 py-1.5 text-white text-sm font-bold rounded-full ${getSportBadgeClass(game.sport)}`}>
          {game.sport}
        </span>
        <div className="mt-3 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Today at {gameTime}</p>
        </div>
      </div>

      {/* Teams Display */}
      <div className="grid grid-cols-3 gap-2 items-center mb-8">
        {/* Away Team */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600">
            <span className="text-2xl font-bold text-white">{game.awayTeam.slice(0, 2).toUpperCase()}</span>
          </div>
          <p className="text-lg font-bold text-white">{game.awayTeam}</p>
          {game.spread < 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded">
              {formatSpread(-game.spread)}
            </span>
          )}
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="vs-badge w-12 h-12 mx-auto rounded-full flex items-center justify-center">
            <span className="text-gray-400 font-bold text-sm">VS</span>
          </div>
        </div>

        {/* Home Team */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600">
            <span className="text-2xl font-bold text-white">{game.homeTeam.slice(0, 2).toUpperCase()}</span>
          </div>
          <p className="text-lg font-bold text-white">{game.homeTeam}</p>
          {game.spread < 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded">
              {formatSpread(game.spread)}
            </span>
          )}
        </div>
      </div>

      {/* Spread Info */}
      <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20">
        <p className="text-gray-300 text-sm">
          {game.spread < 0 ? (
            <>
              <span className="text-white font-semibold">{game.homeTeam}</span> favored by{' '}
              <span className="gradient-text-gold font-bold">{Math.abs(game.spread)}</span>
            </>
          ) : game.spread > 0 ? (
            <>
              <span className="text-white font-semibold">{game.awayTeam}</span> favored by{' '}
              <span className="gradient-text-gold font-bold">{Math.abs(game.spread)}</span>
            </>
          ) : (
            <span className="text-white font-semibold">Even matchup - Pick &apos;em!</span>
          )}
        </p>
      </div>

      {/* Pick buttons or status */}
      {userPick ? (
        <div className={`text-center p-5 rounded-xl ${userPick.result === 'win' ? 'card-glow-win bg-green-900/20' : userPick.result === 'loss' ? 'card-glow-loss bg-red-900/20' : 'pulse-glow bg-purple-900/20'}`}>
          <p className="text-gray-400 mb-1 text-sm">Your pick</p>
          <p className="text-2xl font-bold text-white mb-2">
            {userPick.pickedHome ? game.homeTeam : game.awayTeam}
          </p>
          {userPick.result ? (
            <span className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-bold ${
              userPick.result === 'win' ? 'bg-green-500/20 text-green-400' :
              userPick.result === 'loss' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {userPick.result === 'win' && <span>+1</span>}
              {userPick.result === 'push' && <span>+0.5</span>}
              {userPick.result === 'loss' && <span>0</span>}
              <span className="mx-1">·</span>
              {userPick.result.toUpperCase()}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-purple-400 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Waiting for result...
            </span>
          )}
        </div>
      ) : hasStarted ? (
        <div className="text-center p-5 rounded-xl bg-yellow-900/20 border border-yellow-500/30">
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">Game in progress - picks locked</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-gray-400 text-sm mb-4">Make your pick!</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePick(false)}
              disabled={loading}
              className={`team-btn py-5 px-4 rounded-xl font-bold text-white transition-all ${
                selectedTeam === 'away' ? 'selected' : 'bg-gray-800/80 hover:bg-gray-700/80'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="block text-lg">{game.awayTeam}</span>
              {game.spread < 0 && <span className="block text-xs text-gray-400 mt-1">{formatSpread(-game.spread)}</span>}
            </button>
            <button
              onClick={() => handlePick(true)}
              disabled={loading}
              className={`team-btn py-5 px-4 rounded-xl font-bold text-white transition-all ${
                selectedTeam === 'home' ? 'selected' : 'bg-gray-800/80 hover:bg-gray-700/80'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="block text-lg">{game.homeTeam}</span>
              {game.spread < 0 && <span className="block text-xs text-gray-400 mt-1">{formatSpread(game.spread)}</span>}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
          <p className="text-red-400 text-center text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
