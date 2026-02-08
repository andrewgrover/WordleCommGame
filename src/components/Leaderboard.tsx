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
    return `${medal} ${entry.name}: ${entry.points} pts`
  }).join('\n')
  const siteLink = `\n\nPlay at: ${window.location.origin}`
  return header + rows + siteLink
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30">
        <span className="text-xl">👑</span>
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg shadow-gray-400/30">
        <span className="text-lg font-bold text-white">2</span>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 shadow-lg shadow-orange-500/30">
        <span className="text-lg font-bold text-white">3</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50">
      <span className="text-lg font-medium text-gray-400">{rank}</span>
    </div>
  )
}

function WinRate({ wins, total }: { wins: number; total: number }) {
  const rate = total > 0 ? Math.round((wins / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10">{rate}%</span>
    </div>
  )
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
      <div className="glass card-glow rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <p className="text-gray-400 text-lg">No picks recorded yet.</p>
        <p className="text-gray-500 mt-2">Be the first to make a pick!</p>
      </div>
    )
  }

  return (
    <div className="glass card-glow rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h2 className="text-lg font-bold text-white">Rankings</h2>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 rounded-lg transition-all border border-purple-500/20"
        >
          {shareStatus === 'copied' || shareStatus === 'shared' ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">{shareStatus === 'copied' ? 'Copied!' : 'Shared!'}</span>
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

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 p-4 bg-gradient-to-b from-purple-900/20 to-transparent">
          {/* Second Place */}
          <div className="order-1 pt-4">
            <div className="text-center p-3 rounded-xl bg-gray-800/50">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-xl">
                🥈
              </div>
              <p className="font-bold text-white text-sm truncate">{entries[1].name}</p>
              <p className="text-2xl font-bold gradient-text">{entries[1].points}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>

          {/* First Place */}
          <div className="order-2">
            <div className="text-center p-3 rounded-xl bg-gradient-to-b from-yellow-900/30 to-gray-800/50 border border-yellow-500/20">
              <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">
                👑
              </div>
              <p className="font-bold text-white truncate">{entries[0].name}</p>
              <p className="text-3xl font-bold gradient-text-gold">{entries[0].points}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>

          {/* Third Place */}
          <div className="order-3 pt-6">
            <div className="text-center p-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-lg">
                🥉
              </div>
              <p className="font-bold text-white text-sm truncate">{entries[2].name}</p>
              <p className="text-xl font-bold gradient-text">{entries[2].points}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="pb-3 pl-2">Rank</th>
              <th className="pb-3">Player</th>
              <th className="pb-3 text-center hidden sm:table-cell">Record</th>
              <th className="pb-3 text-center hidden sm:table-cell">Win %</th>
              <th className="pb-3 text-right pr-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`row-hover border-t border-gray-700/30 ${
                  entry.id === currentUserId ? 'bg-purple-900/20' : ''
                }`}
              >
                <td className="py-3 pl-2">
                  <RankBadge rank={index + 1} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                      {entry.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {entry.name}
                        {entry.id === currentUserId && (
                          <span className="ml-2 text-xs text-purple-400 font-normal">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 sm:hidden">
                        {entry.wins}W-{entry.losses}L-{entry.pushes}P
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-center hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="text-green-400 font-medium">{entry.wins}</span>
                    <span className="text-gray-600">-</span>
                    <span className="text-red-400 font-medium">{entry.losses}</span>
                    <span className="text-gray-600">-</span>
                    <span className="text-yellow-400 font-medium">{entry.pushes}</span>
                  </div>
                </td>
                <td className="py-3 hidden sm:table-cell">
                  <WinRate wins={entry.wins} total={entry.totalPicks} />
                </td>
                <td className="py-3 text-right pr-2">
                  <span className={`text-xl font-bold ${index === 0 ? 'gradient-text-gold' : 'text-white'}`}>
                    {entry.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
