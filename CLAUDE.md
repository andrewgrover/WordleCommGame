# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma migrate dev    # Apply database migrations
npx prisma studio         # Open database GUI
npx prisma generate       # Regenerate Prisma client after schema changes
```

## Architecture

**Daily Sports Pick Game** - Users pick one game per day against the spread, tracking results on a leaderboard.

### Tech Stack
- Next.js 14 (App Router) with TypeScript
- SQLite database via Prisma ORM
- Tailwind CSS for styling
- The Odds API for sports data
- bcryptjs for password hashing, jose for JWT sessions

### Core Flow
1. **Game Selection**: Cron job (`/api/cron/fetch-games`) fetches games from The Odds API with sport priority: NFL > NBA > NHL > MLB. First available game of highest-priority sport becomes the daily game.
2. **User Picks**: Users pick home or away team (covering the spread). Picks lock when game starts.
3. **Results**: Cron job (`/api/cron/update-results`) fetches scores and calculates pick outcomes (win/loss/push).
4. **Scoring**: Win = 1 point, Push = 0.5 points, Loss = 0 points.

### Key Files
- `src/lib/game-logic.ts` - Spread calculation, result determination, leaderboard aggregation
- `src/lib/odds-api.ts` - The Odds API client, sport priority constant
- `src/lib/auth.ts` - JWT session management via httpOnly cookies
- `prisma/schema.prisma` - User, Game, Pick models

### Spread Logic
The `spread` field is from the home team's perspective:
- Negative spread = home team favored (must win by more than spread)
- Positive spread = home team is underdog (can lose by less than spread)
- `calculatePickResult()` adds spread to home score then compares to away score

### Auth
Username/password auth with bcrypt hashing. Sessions stored as JWT in httpOnly cookie (30-day expiry). Admin users have `isAdmin: true` flag (set via Prisma Studio).

### API Routes
- `/api/auth/*` - login, register, logout, me
- `/api/game/*` - today's game, submit pick, results
- `/api/admin/game` - manual game entry/score update (admin only)
- `/api/cron/*` - automated game fetch and result updates
