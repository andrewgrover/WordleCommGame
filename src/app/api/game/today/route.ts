import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTodaysGame } from '@/lib/game-logic'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const game = await getTodaysGame()

  if (!game) {
    return NextResponse.json({ game: null })
  }

  // Check if user has already picked
  const userPick = game.picks.find((p) => p.userId === user.id)

  return NextResponse.json({
    game: {
      id: game.id,
      sport: game.sport,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      spread: game.spread,
      date: game.date,
      isComplete: game.isComplete,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
    },
    userPick: userPick
      ? {
          pickedHome: userPick.pickedHome,
          result: userPick.result,
        }
      : null,
  })
}
