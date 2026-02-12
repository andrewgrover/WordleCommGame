import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { selectDailyGame, getStartOfDay, getEndOfDay } from '@/lib/game-logic'

export const dynamic = 'force-dynamic'

// Cron job to fetch and select daily game
// Can be called by external cron service (e.g., Vercel cron, GitHub Actions)
export async function GET(request: NextRequest) {
  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = getStartOfDay()
    const tomorrow = getEndOfDay()

    // Disqualify any existing incomplete game for today
    const existingGame = await prisma.game.findFirst({
      where: {
        date: {
          gte: today,
          lte: tomorrow,
        },
        isComplete: false,
      },
    })

    if (existingGame) {
      // Mark as complete (disqualified) - picks on this game will have no result
      await prisma.game.update({
        where: { id: existingGame.id },
        data: { isComplete: true },
      })
      console.log(`Disqualified game: ${existingGame.homeTeam} vs ${existingGame.awayTeam}`)
    }

    // Select a new game
    const selectedGame = await selectDailyGame()

    if (!selectedGame) {
      return NextResponse.json({
        message: 'No games available today',
      })
    }

    // Create the game in database
    const game = await prisma.game.create({
      data: {
        date: selectedGame.date,
        sport: selectedGame.sport,
        homeTeam: selectedGame.homeTeam,
        awayTeam: selectedGame.awayTeam,
        spread: selectedGame.spread,
        isManual: false,
      },
    })

    return NextResponse.json({
      message: 'Game created',
      game: {
        id: game.id,
        sport: game.sport,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        spread: game.spread,
      },
    })
  } catch (error) {
    console.error('Cron fetch-games error:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}
