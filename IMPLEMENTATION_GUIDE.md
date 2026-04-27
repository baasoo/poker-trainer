# Poker Trainer - Complete Implementation Guide

## Overview

The Poker Trainer is a fully functional Texas Hold'em probability training application built with Next.js, React, TypeScript, and PostgreSQL. The app teaches players to estimate hand probabilities by comparing their guesses to calculated win odds.

## Architecture

### Frontend (React + Next.js)

#### Pages
- **`/`** - Home/intro page with game overview
- **`/login`** - Authentication page (email/password + Google OAuth)
- **`/dashboard`** - User statistics and game history
- **`/game/new`** - Game setup (select number of players: 2-9)
- **`/game/[id]`** - Main game interface with real-time card play

#### Components
- **`CardDisplay.tsx`** - Renders individual poker cards with suits and values
- **`GameTable.tsx`** - Displays the poker table with players arranged in a circle
- **`ProbabilityInput.tsx`** - Slider and input for probability guesses (auto-adjusts to 100%)
- **`ProbabilityPhase.tsx`** - Game phase where player enters probability guesses
- **`ResultsPhase.tsx`** - Shows comparison between guesses and actual probabilities
- **`AuthForm.tsx`** - Email/password signup and login form
- **`GoogleSignInButton.tsx`** - Google OAuth button integration

### Backend (Next.js API Routes)

#### Authentication Routes
- **`/api/auth/[...nextauth]`** - NextAuth.js handler (main auth endpoint)
- **`/api/auth/signup`** - User registration with email/password
- **`/api/auth/login`** - Login endpoint (delegates to NextAuth)
- **`/api/auth/logout`** - Logout endpoint
- **`/api/auth/me`** - Get current authenticated user

#### Game Routes
- **`/api/games`** - Create new game session
- **`/api/games/[sessionId]`** - Get game details, update game score
- **`/api/games/[sessionId]/round`** - Submit guesses, calculate probabilities

#### Stats Routes
- **`/api/stats`** - Fetch user statistics

### Core Libraries

#### `lib/poker-evaluator.ts`
Handles all poker hand logic:
- Hand evaluation (rank hands from high card to royal flush)
- Hand comparison (determine winner)
- Equity calculation using Monte Carlo simulation (10,000 iterations)
- Best 5-card hand selection from 7 cards

#### `lib/auth.ts`
Password utilities:
- `hashPassword()` - bcrypt hashing for password storage
- `verifyPassword()` - Compare plain text password with hash

#### `lib/auth-config.ts`
NextAuth.js configuration:
- Credentials provider (email/password)
- Google OAuth provider
- JWT session strategy
- Callback handlers for signin/signup
- User session enrichment

#### `lib/db.ts`
Database connection management:
- Neon PostgreSQL pool connection
- Singleton pattern for reusable connection

## Game Flow

### 1. Game Setup
```
User logs in → Clicks "Start Training" → Selects 2-9 players → Game created
```

### 2. Card Dealing (Pre-flop)
```
- Deck of Cards API creates shuffled deck
- 2 hole cards dealt to each player
- User sees their 2 cards
- Other players' cards hidden (marked with "?")
```

### 3. Probability Guess Phase
```
- User enters win probability for each player
- Inputs auto-adjust to ensure total = 100%
- User clicks "Submit & Reveal Probabilities"
```

### 4. Results Display
```
- Actual probabilities calculated using Monte Carlo simulation
- Shows comparison: Your Guess vs Actual Probability
- Displays accuracy score (0-100 based on difference)
- Provides feedback tip
```

### 5. Progression to Next Street
```
- Flop: 3 community cards revealed
- Turn: 1 more community card
- River: Final community card
- Same guess/reveal cycle at each street
```

### 6. Game Complete
```
- Final score calculated as average of all round scores
- Score saved to database
- User stats updated
- Option to return to dashboard or start new game
```

## Database Schema

### Users Table
Stores player profiles with OAuth support:
- `id` (UUID) - Primary key
- `email` (VARCHAR, unique) - Login identifier
- `password_hash` (VARCHAR) - Bcrypt hash for email/password auth
- `name` (VARCHAR) - Display name
- `provider` (VARCHAR) - 'credentials' or 'google'
- `provider_id` (VARCHAR) - Google account ID if OAuth
- `created_at` (TIMESTAMP) - Account creation time

### Game Sessions Table
Tracks individual training sessions:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to users table
- `num_players` (INT) - Number of players (2-9)
- `total_score` (FLOAT) - Final session score
- `created_at` (TIMESTAMP) - When game started

### Game Rounds Table
Stores each street's data (pre-flop, flop, turn, river):
- `id` (UUID) - Primary key
- `session_id` (UUID) - Reference to game session
- `street` (VARCHAR) - 'pre-flop', 'flop', 'turn', 'river'
- `round_number` (INT) - Which street number
- `hole_cards` (JSONB) - All players' hole cards (2 per player)
- `community_cards` (JSONB) - Flop (3), turn (4), river (5) cards
- `player_guesses` (JSONB) - Array of user's probability guesses
- `actual_probabilities` (JSONB) - Calculated accurate probabilities
- `round_score` (FLOAT) - Score for this street

### User Stats Table
Aggregated player statistics:
- `id` (UUID) - Primary key
- `user_id` (UUID, unique) - Reference to users table
- `total_games_played` (INT) - Count of completed games
- `total_score` (FLOAT) - Sum of all game scores
- `average_accuracy` (FLOAT) - Average accuracy percentage
- `best_round_score` (FLOAT) - Highest single-game score

## Key Features Explained

### Auto-Adjusting Probabilities
When the user adjusts one probability:
1. Calculate the difference from 100%
2. If user changed Player 1 (you), distribute difference equally among other players
3. If user changed another player, adjust Player 1 to maintain 100% total
4. All values constrained to [0, 100]

### Probability Calculation
Monte Carlo simulation approach:
```
1. Get all cards already revealed (hole + community)
2. For 10,000 iterations:
   a. Randomly draw remaining cards needed
   b. Evaluate best 5-card hand for each player
   c. Determine winner
   d. Increment winner's count
3. Probability = (winner_count / 10,000) * 100
```

### Score Calculation
Based on accuracy of guesses:
```
For each player:
  difference = |guess - actual|
  player_accuracy = max(0, 100 - difference)
round_score = average of all player accuracies
```

## Authentication Flow

### Email/Password
1. User submits email + password on signup
2. Password hashed with bcryptjs (10 salt rounds)
3. User created in database with hashed password
4. NextAuth Credentials provider verifies on login:
   - Query user by email
   - Compare provided password with stored hash
   - Create JWT token if valid

### Google OAuth
1. User clicks "Continue with Google"
2. Redirected to Google login
3. After consent, callback receives user profile
4. Check if user exists by email:
   - If exists: update provider info
   - If not exists: create new user
5. Create JWT session with user data

### Session Management
- JWT tokens valid for 7 days
- Sessions stored in HTTP-only cookies
- SameSite "lax" prevents CSRF attacks
- Token refreshed on each request

## Styling & Design

### Color Scheme
- `poker-green` (#0B5E2E) - Table color
- `poker-dark` (#1a1a2e) - Dark backgrounds
- `poker-gold` (#d4af37) - Accent/highlights
- White cards with red/black suits

### Components
- Tailwind CSS for responsive design
- Gradient buttons with hover effects (Zynga-style)
- Rounded corners and shadows for depth
- Animations: fadeIn, slideUp for card reveals

## Integrations

### Deck of Cards API
Used to deal realistic cards:
```
1. Create shuffled deck: GET /api/deck/new/shuffle
2. Draw cards: GET /api/deck/{deckId}/draw?count=N
3. Returns card objects with code, value, suit, image
```

Response format:
```json
{
  "code": "2C",
  "value": "2",
  "suit": "CLUBS",
  "images": { ... }
}
```

## Development

### Installing Dependencies
```bash
npm install
```

Dependencies:
- `next` - React framework
- `react` & `react-dom` - UI library
- `next-auth` - Authentication
- `@neondatabase/serverless` - PostgreSQL client
- `bcryptjs` - Password hashing
- `tailwindcss` - Styling
- TypeScript for type safety

### Running Locally
```bash
npm run dev
```
Server runs on http://localhost:3000

### Building for Production
```bash
npm run build
npm run start
```

## Error Handling

### Game Creation Errors
- Invalid number of players (outside 2-9 range)
- Database connection failures
- Deck of Cards API failures

### Game Play Errors
- Probability submission with invalid total
- Card dealing failures
- Calculation timeouts

## Performance Considerations

### Monte Carlo Simulation
10,000 iterations takes ~100-200ms:
- Fast enough for real-time calculation
- Accurate to within 1-2% of exact equity
- Could optimize with:
  - Pre-calculated tables for common hands
  - Web workers for background calculation
  - Caching results for repeated combos

### Database Queries
All queries use prepared statements to prevent SQL injection.
Indexes on frequently queried columns:
- `users(email)` - Fast auth lookups
- `game_sessions(user_id)` - User game history
- `game_rounds(session_id)` - Round lookups

## Security

### Authentication
- Passwords hashed with bcryptjs (industry standard)
- JWT tokens signed with NEXTAUTH_SECRET
- HttpOnly cookies prevent XSS access
- SameSite=lax prevents CSRF

### Data Protection
- SQL prepared statements prevent injection
- User can only access their own game data
- OAuth tokens never stored in database

### Environment Variables
- Secrets kept in .env.local (not committed)
- Different secrets for dev/prod
- NEXTAUTH_SECRET should be cryptographically random

## Deployment

### Prerequisites
- Node.js 18+ hosting (Vercel, Heroku, etc.)
- PostgreSQL database (Neon recommended)
- Google OAuth credentials

### Environment Variables (Production)
```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<random-secret>
NODE_ENV=production
```

### Deploy Steps
1. Push code to GitHub
2. Connect to Vercel/hosting platform
3. Add environment variables
4. Deploy
5. Run database migrations if needed

## Future Enhancements

1. **Multiplayer** - Real-time games with other users via WebSockets
2. **Leaderboards** - Global rankings by accuracy and score
3. **Hand Replays** - Review past games and decisions
4. **Difficulty Levels** - Tutorial mode, intermediate, advanced
5. **Mobile App** - Native iOS/Android versions
6. **Analytics** - Detailed statistics and progress tracking
7. **Achievements** - Badges for milestones
8. **Social** - Share results, challenge friends
9. **Hand Analysis** - AI-powered feedback on decisions
10. **Practice Modes** - Specific hand types, positions, etc.
