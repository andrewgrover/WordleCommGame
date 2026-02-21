'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Game {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  spread: number
  date: string
  isComplete: boolean
  homeScore: number | null
  awayScore: number | null
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [todaysGame, setTodaysGame] = useState<Game | null>(null)

  // Form state for creating/updating game
  const [sport, setSport] = useState('NFL')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [spread, setSpread] = useState('')
  const [gameTime, setGameTime] = useState('')

  // Form state for updating scores
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (!data.user) {
        router.push('/auth/login')
        return
      }

      if (!data.user.isAdmin) {
        router.push('/')
        return
      }

      setIsAdmin(true)

      // Fetch today's game
      const gameRes = await fetch('/api/game/today')
      const gameData = await gameRes.json()

      if (gameData.game) {
        setTodaysGame(gameData.game)
        setSport(gameData.game.sport)
        setHomeTeam(gameData.game.homeTeam)
        setAwayTeam(gameData.game.awayTeam)
        setSpread(gameData.game.spread.toString())
        // Convert UTC date to local datetime-local format
        const d = new Date(gameData.game.date)
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        setGameTime(local.toISOString().slice(0, 16))
        if (gameData.game.homeScore !== null) {
          setHomeScore(gameData.game.homeScore.toString())
        }
        if (gameData.game.awayScore !== null) {
          setAwayScore(gameData.game.awayScore.toString())
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport,
          homeTeam,
          awayTeam,
          spread: parseFloat(spread),
          date: gameTime ? new Date(gameTime).toISOString() : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Failed to create game')
      } else {
        setMessage(data.updated ? 'Game updated!' : 'Game created!')
        setTodaysGame(data.game)
      }
    } catch {
      setMessage('Failed to create game')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateScores = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!todaysGame) return

    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: todaysGame.id,
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Failed to update scores')
      } else {
        setMessage('Scores updated and results calculated!')
        setTodaysGame(data.game)
      }
    } catch {
      setMessage('Failed to update scores')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>

      {/* Create/Update Game Form */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {todaysGame ? "Update Today's Game" : 'Create Game'}
        </h2>

        <form onSubmit={handleCreateGame} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sport
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="NCAAB">NCAAB</option>
              <option value="NHL">NHL</option>
              <option value="MLB">MLB</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Away Team
              </label>
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kansas City Chiefs"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Home Team
              </label>
              <input
                type="text"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Francisco 49ers"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Spread (negative = home favored)
            </label>
            <input
              type="number"
              step="0.5"
              value={spread}
              onChange={(e) => setSpread(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="-3.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Game Time (picks lock at this time)
            </label>
            <input
              type="datetime-local"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : todaysGame ? 'Update Game' : 'Create Game'}
          </button>
        </form>
      </div>

      {/* Update Scores Form (only if game exists) */}
      {todaysGame && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Update Final Scores
          </h2>

          {todaysGame.isComplete ? (
            <p className="text-green-400">
              Game completed: {todaysGame.awayTeam} {todaysGame.awayScore} - {todaysGame.homeTeam} {todaysGame.homeScore}
            </p>
          ) : (
            <form onSubmit={handleUpdateScores} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {todaysGame.awayTeam} Score
                  </label>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {todaysGame.homeTeam} Score
                  </label>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Updating...' : 'Mark Complete & Calculate Results'}
              </button>
            </form>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-4 text-center ${message.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
