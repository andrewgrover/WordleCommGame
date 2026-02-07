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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Leaderboard</h1>
      <Leaderboard entries={entries} currentUserId={currentUserId} />
    </div>
  )
}
