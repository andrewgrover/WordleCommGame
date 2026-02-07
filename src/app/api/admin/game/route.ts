import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStartOfDay, getEndOfDay } from '@/lib/game-logic'

export async function POST(request: NextRequest) {
  const user = await getSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { sport, homeTeam, awayTeam, spread, date } = await request.json()

  // Validate required fields
  if (!sport || !homeTeam || !awayTeam || spread === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const gameDate = date ? new Date(date) : new Date()
  const today = getStartOfDay(gameDate)
  const tomorrow = getEndOfDay(gameDate)

  // Check if a game already exists for this date
  const existingGame = await prisma.game.findFirst({
    where: {
      date: {
        gte: today,
        lte: tomorrow,
      },
    },
  })

  if (existingGame) {
    // Update the existing game
    const updatedGame = await prisma.game.update({
      where: { id: existingGame.id },
      data: {
        sport,
        homeTeam,
        awayTeam,
        spread: parseFloat(spread),
        isManual: true,
      },
    })

    return NextResponse.json({ success: true, game: updatedGame, updated: true })
  }

  // Create a new game
  const game = await prisma.game.create({
    data: {
      date: gameDate,
      sport,
      homeTeam,
      awayTeam,
      spread: parseFloat(spread),
      isManual: true,
    },
  })

  return NextResponse.json({ success: true, game })
}

export async function PUT(request: NextRequest) {
  const user = await getSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { gameId, homeScore, awayScore } = await request.json()

  if (!gameId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Update game with scores
  const game = await prisma.game.update({
    where: { id: gameId },
    data: {
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
      isComplete: true,
    },
    include: {
      picks: true,
    },
  })

  // Calculate results for all picks
  for (const pick of game.picks) {
    const homeScoreWithSpread = game.homeScore! + game.spread

    let result: 'win' | 'loss' | 'push'
    if (homeScoreWithSpread > game.awayScore!) {
      result = pick.pickedHome ? 'win' : 'loss'
    } else if (homeScoreWithSpread < game.awayScore!) {
      result = pick.pickedHome ? 'loss' : 'win'
    } else {
      result = 'push'
    }

    await prisma.pick.update({
      where: { id: pick.id },
      data: { result },
    })
  }

  return NextResponse.json({ success: true, game })
}
