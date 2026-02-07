'use client'

import Link from 'next/link'
import Image from 'next/image'
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
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/umd-logo.svg"
              alt="UMD Logo"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9"
            />
            <span className="text-lg sm:text-xl font-bold text-white">
              <span className="hidden xs:inline">WordleCommPicks</span>
              <span className="xs:hidden">WCP</span>
            </span>
          </Link>
          <Link href="/leaderboard" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">
            <span className="hidden sm:inline">Leaderboard</span>
            <span className="sm:hidden">Board</span>
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <span className="text-sm sm:text-base text-gray-400 hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
