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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
              <h2 className="text-2xl font-bold text-white mb-4">No Game Today</h2>
              <p className="text-gray-400">
                Check back later! Games are updated daily.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
