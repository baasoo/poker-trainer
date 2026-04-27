# Poker Trainer

Texas Hold'em poker training application for building hand probability intuition.

## Project Overview

A full-stack web app where players guess win probabilities for each player based on cards shown, then compare to calculated odds. Players receive scores based on accuracy and track improvement over time.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL (Neon)
- NextAuth.js (Google OAuth + Email/Password)

## Key Components

### Frontend Pages
- `/` - Home/intro
- `/login` - Auth page (signup/signin)
- `/dashboard` - User stats and history
- `/game/new` - Game setup (select num players)
- `/game/[id]` - Main game interface (in development)

### API Routes
- `/api/auth/*` - NextAuth handlers
- `/api/games` - Create game session
- `/api/games/[sessionId]/round` - Submit round guesses and get results

### Core Libraries
- `lib/poker-evaluator.ts` - Hand evaluation and equity calculation
- `lib/auth.ts` - Password hashing
- `lib/auth-config.ts` - NextAuth configuration
- `lib/db.ts` - Database connection

## Database Schema

- `users` - Player profiles
- `game_sessions` - Game instances
- `game_rounds` - Individual rounds with guesses/actual probabilities
- `player_results` - Hand rankings per round
- `user_stats` - Aggregated player statistics

## Current Status

### Complete ✅
- Project scaffolding and structure
- Auth system (email/password + Google OAuth)
- Database schema with all tables
- Poker hand evaluator with Monte Carlo equity calculation
- Login/signup pages with form validation
- Game setup flow (player selection)
- API routes:
  - Game creation and retrieval
  - Round submission with probability calculation
  - User statistics tracking
- Complete game interface:
  - Card display component
  - Game table layout with player positions
  - Probability input phase with auto-adjustment
  - Results display with accuracy scoring
  - Street progression (pre-flop → flop → turn → river)
- Deck of Cards API integration
- Score calculation and storage
- Dashboard with live stats
- CSS animations and Zynga-like styling
- TypeScript types and interfaces
- Documentation (README, AUTH_JS_SETUP, CLAUDE.md)

### TODO (Future Enhancements)
- [ ] Game history/replay feature
- [ ] Global leaderboards
- [ ] Hand replay and analysis
- [ ] Advanced statistics dashboard
- [ ] Mobile app optimization
- [ ] Real-time multiplayer support (WebSockets)
- [ ] Hand difficulty levels
- [ ] Achievement system
- [ ] Social sharing
- [ ] Performance optimizations (caching, worker threads)

## Development Notes

### Poker Evaluator Performance
The hand evaluator uses Monte Carlo simulation (10,000 iterations) for equity calculation. For production, consider:
- Pre-calculated lookup tables for common scenarios
- Caching results for repeated hand combinations
- Web workers for background calculation

### Authentication
Follows Ideas App pattern:
- Credentials provider with bcrypt hashing
- Google OAuth with email account linking
- JWT session strategy (7-day max age)

### Styling
Uses Tailwind CSS 4 with custom poker theme:
- `poker-green`: #0B5E2E (table color)
- `poker-dark`: #1a1a2e (dark background)
- `poker-gold`: #d4af37 (highlights)

## Environment Variables Required

```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
NODE_ENV=development
```

## Running Locally

```bash
npm install
npm run dev
```

Server runs on http://localhost:3000

## Key Learnings from Ideas App

- Use Neon for serverless PostgreSQL
- NextAuth for scalable auth
- API routes pattern for server logic
- Tailwind for rapid styling
- UUID primary keys throughout
- JSON columns for flexible data storage
