# Sports Picks

A daily sports betting game (picks against the spread) for your friend group, with a persistent leaderboard.

## Features

- Daily game selection with sport priority (NFL > NBA > NHL > MLB)
- Magic link authentication (no passwords)
- Pick against the spread
- Automatic results calculation
- Persistent leaderboard
- Admin panel for manual game entry

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your API keys:
   - `JWT_SECRET` - Generate a secure random string
   - `RESEND_API_KEY` - Get from [Resend](https://resend.com)
   - `ODDS_API_KEY` - Get from [The Odds API](https://the-odds-api.com)

3. **Initialize the database**
   ```bash
   npx prisma migrate dev
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Making a User Admin

To make a user an admin, run:
```bash
npx prisma studio
```
Then find the user in the User table and set `isAdmin` to `true`.

## Development Mode

In development mode, magic links are logged to the console instead of being emailed. The link is also displayed on the login page for convenience.

## Cron Jobs

Two cron endpoints are available for automatic game/results updates:

- `GET /api/cron/fetch-games` - Fetches and selects daily game
- `GET /api/cron/update-results` - Updates game results and calculates picks

You can secure these with a `CRON_SECRET` environment variable and pass it as a Bearer token.

## Tech Stack

- Next.js 14 (App Router)
- SQLite with Prisma ORM
- Magic link auth via Resend
- The Odds API for sports data
- Tailwind CSS
