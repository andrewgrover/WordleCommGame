'use client'

interface ResultsModalProps {
  result: {
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
  onClose: () => void
}

export default function ResultsModal({ result, onClose }: ResultsModalProps) {
  const { game, pick } = result

  const getResultColor = (r: string) => {
    switch (r) {
      case 'win':
        return 'text-green-400'
      case 'loss':
        return 'text-red-400'
      case 'push':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getPoints = (r: string) => {
    switch (r) {
      case 'win':
        return '+1'
      case 'push':
        return '+0.5'
      case 'loss':
        return '+0'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Yesterday&apos;s Result
        </h2>

        <div className="text-center mb-4">
          <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
            {game.sport}
          </span>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-3 gap-4 items-center mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-400">{game.awayTeam}</p>
            <p className="text-3xl font-bold text-white">{game.awayScore}</p>
          </div>
          <div className="text-center">
            <span className="text-gray-500">FINAL</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">{game.homeTeam}</p>
            <p className="text-3xl font-bold text-white">{game.homeScore}</p>
          </div>
        </div>

        {/* Your Pick */}
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-1">Your pick:</p>
          <p className="text-xl font-semibold text-white">
            {pick.pickedHome ? game.homeTeam : game.awayTeam}
            <span className="text-gray-400 ml-2">
              ({game.spread < 0 && pick.pickedHome
                ? game.spread
                : game.spread > 0 && !pick.pickedHome
                ? -game.spread
                : pick.pickedHome
                ? `+${game.spread}`
                : -game.spread})
            </span>
          </p>
        </div>

        {/* Result */}
        <div className={`text-center text-4xl font-bold mb-4 ${getResultColor(pick.result)}`}>
          {pick.result.toUpperCase()}!
        </div>

        <div className="text-center text-gray-300 mb-6">
          {getPoints(pick.result)} point{pick.result !== 'win' && pick.result !== 'loss' ? '' : 's'}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          See Today&apos;s Game
        </button>
      </div>
    </div>
  )
}
