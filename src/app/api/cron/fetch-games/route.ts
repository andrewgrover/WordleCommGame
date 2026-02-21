import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { selectDailyGame, calculatePickResult } from '@/lib/game-logic'
import { fetchScoresForSport, SPORT_PRIORITY } from '@/lib/odds-api'

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
    // Check if there's an active manual game — if so, don't override it
    const activeManualGame = await prisma.game.findFirst({
      where: {
        isComplete: false,
        isManual: true,
      },
    })

    if (activeManualGame) {
      return NextResponse.json({
        message: 'Skipping — active manual game exists',
        game: {
          id: activeManualGame.id,
          sport: activeManualGame.sport,
          homeTeam: activeManualGame.homeTeam,
          awayTeam: activeManualGame.awayTeam,
        },
      })
    }

    // Try to resolve scores for all incomplete past games before marking them complete
    const incompleteGames = await prisma.game.findMany({
      where: {
        isComplete: false,
      },
      include: {
        picks: true,
      },
    })

    const resolvedGames: string[] = []
    const unresolvedGames: string[] = []

    // Fetch scores and update results for incomplete games
    const sportsWithGames = Array.from(new Set(incompleteGames.map((g) => g.sport))) as Array<
      (typeof SPORT_PRIORITY)[number]
    >

    for (const sport of sportsWithGames) {
      const scores = await fetchScoresForSport(sport)

      for (const game of incompleteGames.filter((g) => g.sport === sport)) {
        const scoreData = scores.find(
          (s) =>
            (s.homeTeam === game.homeTeam && s.awayTeam === game.awayTeam) ||
            (s.homeTeam.includes(game.homeTeam) && s.awayTeam.includes(game.awayTeam))
        )

        if (scoreData && scoreData.completed) {
          // Update game with scores and mark complete
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

          resolvedGames.push(`${game.homeTeam} vs ${game.awayTeam}`)
          console.log(`Resolved scores: ${game.homeTeam} vs ${game.awayTeam}`)
        } else {
          // No scores available — mark complete without scores so it doesn't block new games
          await prisma.game.update({
            where: { id: game.id },
            data: { isComplete: true },
          })
          unresolvedGames.push(`${game.homeTeam} vs ${game.awayTeam}`)
          console.log(`No scores found, marking complete: ${game.homeTeam} vs ${game.awayTeam}`)
        }
      }
    }

    // Handle incomplete games with no sport match (shouldn't happen, but safety net)
    for (const game of incompleteGames) {
      if (!resolvedGames.includes(`${game.homeTeam} vs ${game.awayTeam}`) &&
          !unresolvedGames.includes(`${game.homeTeam} vs ${game.awayTeam}`)) {
        await prisma.game.update({
          where: { id: game.id },
          data: { isComplete: true },
        })
        unresolvedGames.push(`${game.homeTeam} vs ${game.awayTeam}`)
      }
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
      resolvedGames,
      unresolvedGames,
    })
  } catch (error) {
    console.error('Cron fetch-games error:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}
