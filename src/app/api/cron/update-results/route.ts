import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchScoresForSport, SPORT_PRIORITY } from '@/lib/odds-api'
import { calculatePickResult } from '@/lib/game-logic'

export const dynamic = 'force-dynamic'

// Cron job to update game results and calculate pick outcomes
export async function GET(request: NextRequest) {
  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find games that are not complete and have passed their start time
    const incompleteGames = await prisma.game.findMany({
      where: {
        isComplete: false,
        date: {
          lt: new Date(),
        },
      },
      include: {
        picks: true,
      },
    })

    if (incompleteGames.length === 0) {
      return NextResponse.json({ message: 'No games to update' })
    }

    const updates: Array<{
      gameId: string
      sport: string
      homeTeam: string
      homeScore: number
      awayScore: number
      picksUpdated: number
    }> = []

    // Fetch scores for each sport that has incomplete games
    const sportsWithGames = Array.from(new Set(incompleteGames.map((g) => g.sport))) as Array<
      (typeof SPORT_PRIORITY)[number]
    >

    for (const sport of sportsWithGames) {
      const scores = await fetchScoresForSport(sport)

      for (const game of incompleteGames.filter((g) => g.sport === sport)) {
        // Try to find matching score data
        const scoreData = scores.find(
          (s) =>
            (s.homeTeam === game.homeTeam && s.awayTeam === game.awayTeam) ||
            (s.homeTeam.includes(game.homeTeam) && s.awayTeam.includes(game.awayTeam))
        )

        if (scoreData && scoreData.completed) {
          // Update game with scores
          await prisma.game.update({
            where: { id: game.id },
            data: {
              homeScore: scoreData.homeScore,
              awayScore: scoreData.awayScore,
              isComplete: true,
            },
          })

          // Calculate and update pick results
          for (const pick of game.picks) {
            const result = calculatePickResult(
              pick.pickedHome,
              scoreData.homeScore,
              scoreData.awayScore,
              game.spread
            )

            await prisma.pick.update({
              where: { id: pick.id },
              data: { result },
            })
          }

          updates.push({
            gameId: game.id,
            sport: game.sport,
            homeTeam: game.homeTeam,
            homeScore: scoreData.homeScore,
            awayScore: scoreData.awayScore,
            picksUpdated: game.picks.length,
          })
        }
      }
    }

    return NextResponse.json({
      message: `Updated ${updates.length} games`,
      updates,
    })
  } catch (error) {
    console.error('Cron update-results error:', error)
    return NextResponse.json({ error: 'Failed to update results' }, { status: 500 })
  }
}
