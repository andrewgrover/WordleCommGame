'use client'

import { useEffect, useState } from 'react'

interface ResultsModalProps {
  result: {
    game: {
      sport: string
      homeTeam: string
      awayTeam: string
      spread: number
      homeScore: number
      awayScore: number
    }
    pick: {
      pickedHome: boolean
      result: string
    }
  }
  onClose: () => void
}

function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; color: string; delay: number }>>([])

  useEffect(() => {
    const colors = ['#667eea', '#764ba2', '#f6d365', '#fda085', '#22c55e', '#3b82f6']
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }))
    setPieces(newPieces)
  }, [])

  return (
    <>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </>
  )
}

export default function ResultsModal({ result, onClose }: ResultsModalProps) {
  const { game, pick } = result
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100)
  }, [])

  const getResultEmoji = (r: string) => {
    switch (r) {
      case 'win': return '🎉'
      case 'loss': return '😔'
      case 'push': return '🤝'
      default: return ''
    }
  }

  const getResultColor = (r: string) => {
    switch (r) {
      case 'win': return 'text-green-400'
      case 'loss': return 'text-red-400'
      case 'push': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getResultBg = (r: string) => {
    switch (r) {
      case 'win': return 'from-green-900/40 to-emerald-900/40 border-green-500/30'
      case 'loss': return 'from-red-900/40 to-rose-900/40 border-red-500/30'
      case 'push': return 'from-yellow-900/40 to-amber-900/40 border-yellow-500/30'
      default: return 'from-gray-900/40 to-gray-800/40 border-gray-500/30'
    }
  }

  const getPoints = (r: string) => {
    switch (r) {
      case 'win': return '+1 pt'
      case 'push': return '+0.5 pt'
      case 'loss': return '0 pts'
      default: return ''
    }
  }

  const getSportBadgeClass = (sport: string) => {
    const sportLower = sport.toLowerCase()
    if (sportLower.includes('nfl') || sportLower.includes('football')) return 'sport-badge-nfl'
    if (sportLower.includes('nba') || sportLower.includes('basketball')) return 'sport-badge-nba'
    if (sportLower.includes('nhl') || sportLower.includes('hockey')) return 'sport-badge-nhl'
    if (sportLower.includes('mlb') || sportLower.includes('baseball')) return 'sport-badge-mlb'
    return 'sport-badge'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {pick.result === 'win' && <Confetti />}

      <div className={`glass rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Result Banner */}
        <div className={`-mx-8 -mt-8 mb-6 p-6 rounded-t-2xl bg-gradient-to-r ${getResultBg(pick.result)} border-b`}>
          <div className={`text-center ${showContent ? 'animate-bounce-in' : ''}`}>
            <span className="text-5xl mb-2 block">{getResultEmoji(pick.result)}</span>
            <h2 className={`text-3xl font-bold ${getResultColor(pick.result)}`}>
              {pick.result.toUpperCase()}!
            </h2>
            <p className="text-white/80 mt-1 font-medium">{getPoints(pick.result)}</p>
          </div>
        </div>

        {/* Sport Badge */}
        <div className="text-center mb-4">
          <span className={`inline-block px-4 py-1.5 text-white text-sm font-bold rounded-full ${getSportBadgeClass(game.sport)}`}>
            {game.sport}
          </span>
        </div>

        {/* Score Display */}
        <div className={`grid grid-cols-3 gap-4 items-center mb-6 p-5 rounded-xl bg-gray-800/50 border border-gray-700/50 ${showContent ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">{game.awayTeam}</p>
            <p className="text-4xl font-bold text-white">{game.awayScore}</p>
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider">Final</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">{game.homeTeam}</p>
            <p className="text-4xl font-bold text-white">{game.homeScore}</p>
          </div>
        </div>

        {/* Your Pick */}
        <div className={`text-center mb-6 p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 ${showContent ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-400 text-sm mb-1">Your pick</p>
          <p className="text-xl font-bold text-white">
            {pick.pickedHome ? game.homeTeam : game.awayTeam}
            <span className="text-gray-400 ml-2 text-base font-normal">
              ({game.spread < 0 && pick.pickedHome
                ? game.spread
                : game.spread > 0 && !pick.pickedHome
                ? -game.spread
                : pick.pickedHome
                ? `+${game.spread}`
                : -game.spread})
            </span>
          </p>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${showContent ? 'animate-slide-up' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          See Today&apos;s Game
        </button>
      </div>
    </div>
  )
}
