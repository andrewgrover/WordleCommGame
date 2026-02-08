'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Leaderboard from '@/components/Leaderboard'

interface LeaderboardEntry {
  id: string
  name: string
  wins: number
  losses: number
  pushes: number
  points: number
  totalPicks: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        // Check auth
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()

        if (!authData.user) {
          router.push('/auth/login')
          return
        }

        setCurrentUserId(authData.user.id)

        // Fetch leaderboard
        const res = await fetch('/api/leaderboard')
        const data = await res.json()

        setEntries(data.leaderboard)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
      </div>
      <Leaderboard entries={entries} currentUserId={currentUserId} />
    </div>
  )
}
