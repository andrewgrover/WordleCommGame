import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/game-logic'

export async function GET() {
  const leaderboard = await getLeaderboard()

  return NextResponse.json({ leaderboard })
}
