'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  user: {
    name: string
    isAdmin: boolean
  } | null
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            Sports Picks
          </Link>
          <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
            Leaderboard
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
