'use client'

import { useState } from 'react'

interface LeaderboardEntry {
  id: string
  name: string
  wins: number
  losses: number
  pushes: number
  points: number
  totalPicks: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

function formatLeaderboardText(entries: LeaderboardEntry[]): string {
  const header = '🏆 Daily Pick Leaderboard\n\n'
  const rows = entries.map((entry, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
    return `${medal} ${entry.name}: ${entry.points} pts (${entry.wins}W-${entry.losses}L-${entry.pushes}P)`
  }).join('\n')
  return header + rows
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const handleShare = async () => {
    const text = formatLeaderboardText(entries)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Pick Leaderboard',
          text: text,
        })
        setShareStatus('shared')
      } catch (err) {
        // User cancelled or share failed - try clipboard fallback
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(text)
        }
      }
    } else {
      await copyToClipboard(text)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No picks recorded yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex justify-end p-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          {shareStatus === 'copied' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : shareStatus === 'shared' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Shared!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </>
          )}
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-700 text-left">
            <th className="px-4 py-3 text-gray-300 font-medium">#</th>
            <th className="px-4 py-3 text-gray-300 font-medium">Name</th>
            <th className="px-4 py-3 text-gray-300 font-medium text-center">W</th>
            <th className="px-4 py-3 text-gray-300 font-medium text-center">L</th>
            <th className="px-4 py-3 text-gray-300 font-medium text-center">P</th>
            <th className="px-4 py-3 text-gray-300 font-medium text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className={`border-t border-gray-700 ${
                entry.id === currentUserId ? 'bg-blue-900/30' : ''
              }`}
            >
              <td className="px-4 py-3 text-gray-400">
                {index === 0 && <span className="text-yellow-400">1</span>}
                {index === 1 && <span className="text-gray-300">2</span>}
                {index === 2 && <span className="text-orange-400">3</span>}
                {index > 2 && <span>{index + 1}</span>}
              </td>
              <td className="px-4 py-3 text-white font-medium">
                {entry.name}
                {entry.id === currentUserId && (
                  <span className="ml-2 text-xs text-blue-400">(you)</span>
                )}
              </td>
              <td className="px-4 py-3 text-green-400 text-center">{entry.wins}</td>
              <td className="px-4 py-3 text-red-400 text-center">{entry.losses}</td>
              <td className="px-4 py-3 text-yellow-400 text-center">{entry.pushes}</td>
              <td className="px-4 py-3 text-white font-bold text-right">{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
