'use client'

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

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No picks recorded yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
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
