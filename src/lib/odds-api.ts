const ODDS_API_KEY = process.env.ODDS_API_KEY

// Sport keys for The Odds API
const SPORT_KEYS = {
  NFL: 'americanfootball_nfl',
  NBA: 'basketball_nba',
  NCAAB: 'basketball_ncaab',
  NHL: 'icehockey_nhl',
  MLB: 'baseball_mlb',
} as const

type Sport = keyof typeof SPORT_KEYS

// Check if a team name indicates a ranked team (e.g., "#5 Duke" or "(5) Duke")
export function isRankedTeam(teamName: string): boolean {
  return /^#?\d+\s|^\(\d+\)\s/.test(teamName)
}

// Check if a college basketball game qualifies for priority
// Must have a ranked team AND spread less than 15
export function isQualifiedCollegeGame(game: GameData): boolean {
  if (game.sport !== 'NCAAB') return false
  const hasRankedTeam = isRankedTeam(game.homeTeam) || isRankedTeam(game.awayTeam)
  const spreadUnder15 = Math.abs(game.spread) < 15
  return hasRankedTeam && spreadUnder15
}

interface OddsGame {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Array<{
    key: string
    title: string
    markets: Array<{
      key: string
      outcomes: Array<{
        name: string
        price: number
        point?: number
      }>
    }>
  }>
}

interface OddsScore {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  completed: boolean
  home_team: string
  away_team: string
  scores: Array<{
    name: string
    score: string
  }> | null
}

export interface GameData {
  externalId: string
  sport: Sport
  homeTeam: string
  awayTeam: string
  spread: number
  date: Date
}

export interface ScoreData {
  externalId: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  completed: boolean
}

export async function fetchGamesForSport(sport: Sport): Promise<GameData[]> {
  if (!ODDS_API_KEY || ODDS_API_KEY === 'your_odds_api_key') {
    console.log(`[Dev] Would fetch games for ${sport}`)
    return []
  }

  const sportKey = SPORT_KEYS[sport]
  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=spreads&oddsFormat=american`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Failed to fetch ${sport} games: ${response.status}`)
      return []
    }

    const games: OddsGame[] = await response.json()

    return games.map((game) => {
      // Find the spread from the first bookmaker that has it
      let spread = 0
      for (const bookmaker of game.bookmakers) {
        const spreadsMarket = bookmaker.markets.find((m) => m.key === 'spreads')
        if (spreadsMarket) {
          const homeOutcome = spreadsMarket.outcomes.find((o) => o.name === game.home_team)
          if (homeOutcome?.point !== undefined) {
            spread = homeOutcome.point
            break
          }
        }
      }

      return {
        externalId: game.id,
        sport,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        spread,
        date: new Date(game.commence_time),
      }
    })
  } catch (error) {
    console.error(`Error fetching ${sport} games:`, error)
    return []
  }
}

export async function fetchScoresForSport(sport: Sport): Promise<ScoreData[]> {
  if (!ODDS_API_KEY || ODDS_API_KEY === 'your_odds_api_key') {
    console.log(`[Dev] Would fetch scores for ${sport}`)
    return []
  }

  const sportKey = SPORT_KEYS[sport]
  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=1`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Failed to fetch ${sport} scores: ${response.status}`)
      return []
    }

    const games: OddsScore[] = await response.json()

    return games
      .filter((game) => game.scores && game.scores.length > 0)
      .map((game) => {
        const homeScoreData = game.scores?.find((s) => s.name === game.home_team)
        const awayScoreData = game.scores?.find((s) => s.name === game.away_team)

        return {
          externalId: game.id,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          homeScore: parseInt(homeScoreData?.score || '0', 10),
          awayScore: parseInt(awayScoreData?.score || '0', 10),
          completed: game.completed,
        }
      })
  } catch (error) {
    console.error(`Error fetching ${sport} scores:`, error)
    return []
  }
}

// Priority order for selecting daily game
// NCAAB is included but has special handling - only gets priority if ranked team + spread < 15
export const SPORT_PRIORITY: Sport[] = ['NFL', 'NBA', 'NCAAB', 'NHL', 'MLB']
