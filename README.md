# Poker Trainer

A Texas Hold'em poker training application that helps players build intuition by guessing hand probabilities and comparing them to calculated win odds.

## Features

- **Interactive Training**: Guess win probabilities for each player at different stages (pre-flop, flop, turn, river)
- **Real Probability Calculation**: Accurate hand equity calculations using Monte Carlo simulation
- **Score Tracking**: Track your accuracy across sessions
- **Google OAuth & Email/Password**: Secure authentication with multiple options
- **Visual Interface**: Zynga-like design with smooth animations and intuitive controls

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js with Google OAuth + Credentials

## Setup Instructions

### 1. Install Dependencies

```bash
cd poker-trainer
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string (from Neon)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `NEXTAUTH_URL`: http://localhost:3000 (for development)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

### 3. Initialize Database

```bash
# Run the schema to set up tables
psql $DATABASE_URL -f lib/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
poker-trainer/
├── app/
│   ├── api/              # API routes for auth, games, rounds
│   ├── game/             # Game pages
│   ├── login/            # Auth pages
│   ├── dashboard/        # User dashboard
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components
├── lib/
│   ├── auth.ts          # Password hashing utilities
│   ├── auth-config.ts   # NextAuth configuration
│   ├── db.ts            # Database connection
│   ├── poker-evaluator.ts # Hand evaluation logic
│   └── schema.sql       # Database schema
├── public/              # Static assets
└── package.json
```

## Game Flow

1. **Setup**: User selects number of players (2-9)
2. **Deal**: System deals hole cards to each player
3. **Guess Phase**: Player guesses win probability for each player (must sum to 100%)
4. **Reveal**: Show actual probabilities calculated from poker math
5. **Progress**: Move through flop → turn → river with same routine
6. **Score**: Player is scored based on accuracy of guesses

## Database Schema

### Users Table
- id, email, password_hash, name, provider, provider_id

### Game Sessions Table
- Tracks overall game sessions with scores

### Game Rounds Table
- Individual rounds (pre-flop, flop, turn, river)
- Stores player guesses and actual probabilities
- Calculates round scores

## Development

### Key Poker Logic

The `poker-evaluator.ts` module handles:
- Hand ranking (high card to royal flush)
- Hand comparison
- Equity calculation via Monte Carlo simulation (10,000 iterations)

### Adding Features

- New API routes in `app/api/`
- New pages in `app/`
- New components in `components/`

## Authentication

Supports two auth methods:
1. **Email/Password**: Custom credentials provider with bcrypt hashing
2. **Google OAuth**: Seamless one-click signin

## Next Steps

After setup, consider implementing:
- [ ] Real-time multiplayer (WebSockets)
- [ ] Leaderboards
- [ ] Hand replays and analysis
- [ ] Improved hand evaluator performance
- [ ] Mobile app version
- [ ] Advanced filtering options (positions, hand types)

## License

MIT
