import { prisma } from './db'
import { fetchGamesForSport, SPORT_PRIORITY, isQualifiedCollegeGame, type GameData } from './odds-api'

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export async function getTodaysGame() {
  const today = getStartOfDay()
  const tomorrow = getEndOfDay()

  // First check for any existing game for today
  const existingGame = await prisma.game.findFirst({
    where: {
      date: {
        gte: today,
        lte: tomorrow,
      },
    },
    include: {
      picks: true,
    },
  })

  return existingGame
}

export async function selectDailyGame(): Promise<GameData | null> {
  const now = new Date()
  const tomorrow = getEndOfDay()

  // Helper to filter games that haven't started yet
  const filterAvailable = (games: GameData[]) =>
    games.filter((game) => {
      const gameDate = new Date(game.date)
      return gameDate > now && gameDate <= tomorrow
    })

  // First priority: Check for qualified college basketball games
  // (ranked team + spread < 15)
  const ncaabGames = await fetchGamesForSport('NCAAB')
  const availableNcaab = filterAvailable(ncaabGames)
  const qualifiedNcaab = availableNcaab.filter(isQualifiedCollegeGame)

  if (qualifiedNcaab.length > 0) {
    return qualifiedNcaab.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  }

  // Check for games in sport priority order (skip NCAAB since we already checked)
  for (const sport of SPORT_PRIORITY) {
    if (sport === 'NCAAB') continue // Already handled above

    const games = await fetchGamesForSport(sport)
    const availableGames = filterAvailable(games)

    if (availableGames.length > 0) {
      // Return the first game (earliest) of the highest priority sport
      return availableGames.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
    }
  }

  return null
}

export type PickResult = 'win' | 'loss' | 'push'

export function calculatePickResult(
  pickedHome: boolean,
  homeScore: number,
  awayScore: number,
  spread: number
): PickResult {
  // Spread is from home team perspective
  // negative spread = home team is favored (must win by more than spread)
  // positive spread = home team is underdog (can lose by less than spread)

  // Calculate if home team covered the spread
  const homeScoreWithSpread = homeScore + spread

  if (homeScoreWithSpread > awayScore) {
    // Home covered
    return pickedHome ? 'win' : 'loss'
  } else if (homeScoreWithSpread < awayScore) {
    // Away covered
    return pickedHome ? 'loss' : 'win'
  } else {
    // Push
    return 'push'
  }
}

export function getPointsForResult(result: PickResult): number {
  switch (result) {
    case 'win':
      return 1
    case 'push':
      return 0.5
    case 'loss':
      return 0
  }
}

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    include: {
      picks: {
        where: {
          result: { not: null },
        },
      },
    },
  })

  return users
    .map((user) => {
      const wins = user.picks.filter((p) => p.result === 'win').length
      const losses = user.picks.filter((p) => p.result === 'loss').length
      const pushes = user.picks.filter((p) => p.result === 'push').length
      const points = wins + pushes * 0.5

      return {
        id: user.id,
        name: user.name,
        wins,
        losses,
        pushes,
        points,
        totalPicks: user.picks.length,
      }
    })
    .sort((a, b) => b.points - a.points)
}
