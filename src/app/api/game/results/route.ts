import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's most recent completed pick that hasn't been "seen"
  // We track this by checking picks from completed games
  const pendingResults = await prisma.pick.findMany({
    where: {
      userId: user.id,
      result: { not: null },
      game: {
        isComplete: true,
      },
    },
    include: {
      game: true,
    },
    orderBy: {
      game: {
        date: 'desc',
      },
    },
    take: 1,
  })

  if (pendingResults.length === 0) {
    return NextResponse.json({ result: null })
  }

  const pick = pendingResults[0]

  return NextResponse.json({
    result: {
      game: {
        sport: pick.game.sport,
        homeTeam: pick.game.homeTeam,
        awayTeam: pick.game.awayTeam,
        spread: pick.game.spread,
        homeScore: pick.game.homeScore,
        awayScore: pick.game.awayScore,
        date: pick.game.date,
      },
      pick: {
        pickedHome: pick.pickedHome,
        result: pick.result,
      },
    },
  })
}
