import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getTodaysGame } from '@/lib/game-logic'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getSession()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pickedHome } = await request.json()

  if (typeof pickedHome !== 'boolean') {
    return NextResponse.json({ error: 'Invalid pick' }, { status: 400 })
  }

  const game = await getTodaysGame()

  if (!game) {
    return NextResponse.json({ error: 'No game available today' }, { status: 404 })
  }

  if (game.isComplete) {
    return NextResponse.json({ error: 'Game has already completed' }, { status: 400 })
  }

  // Check if game has started (can't pick after game starts)
  if (new Date() > game.date) {
    return NextResponse.json({ error: 'Game has already started' }, { status: 400 })
  }

  // Check if user already has a pick
  const existingPick = await prisma.pick.findUnique({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: game.id,
      },
    },
  })

  if (existingPick) {
    return NextResponse.json({ error: 'You have already made a pick for this game' }, { status: 400 })
  }

  // Create the pick
  const pick = await prisma.pick.create({
    data: {
      userId: user.id,
      gameId: game.id,
      pickedHome,
    },
  })

  return NextResponse.json({
    success: true,
    pick: {
      pickedHome: pick.pickedHome,
    },
  })
}
