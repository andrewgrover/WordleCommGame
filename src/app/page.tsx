'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GameCard from '@/components/GameCard'
import ResultsModal from '@/components/ResultsModal'

interface Game {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  spread: number
  date: string
  isComplete: boolean
}

interface UserPick {
  pickedHome: boolean
  result: string | null
}

interface ResultData {
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

export default function HomePage() {
  const [game, setGame] = useState<Game | null>(null)
  const [userPick, setUserPick] = useState<UserPick | null>(null)
  const [result, setResult] = useState<ResultData | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (!data.user) {
        router.push('/auth/login')
        return
      }

      setUser(data.user)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      try {
        // Check for pending results first
        const resultsRes = await fetch('/api/game/results')
        const resultsData = await resultsRes.json()

        if (resultsData.result) {
          setResult(resultsData.result)
          setShowResults(true)
        }

        // Fetch today's game
        const gameRes = await fetch('/api/game/today')
        const gameData = await gameRes.json()

        if (gameData.game) {
          setGame(gameData.game)
          setUserPick(gameData.userPick)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handlePickSubmit = async () => {
    // Refresh the game data
    const gameRes = await fetch('/api/game/today')
    const gameData = await gameRes.json()
    if (gameData.game) {
      setGame(gameData.game)
      setUserPick(gameData.userPick)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {showResults && result && (
        <ResultsModal
          result={result}
          onClose={() => setShowResults(false)}
        />
      )}

      {!showResults && (
        <>
          {game ? (
            <GameCard
              game={game}
              userPick={userPick}
              onPickSubmit={handlePickSubmit}
            />
          ) : (
            <div className="glass card-glow rounded-2xl p-8 w-full max-w-md text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                <span className="text-4xl">🏈</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Game Today</h2>
              <p className="text-gray-400 mb-6">
                Check back later! Games are updated daily.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Next game coming soon</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
