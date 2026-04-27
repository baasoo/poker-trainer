# Poker Trainer - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd poker-trainer
npm install
```

### 2. Set Up Environment Variables

Copy the example and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with:
```
DATABASE_URL=postgresql://user:password@host/dbname
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=development
```

### 3. Set Up Database

Run the schema to create tables:
```bash
psql $DATABASE_URL -f lib/schema.sql
```

Or if using connection string with special characters:
```bash
psql "postgresql://user:password@host/dbname" -f lib/schema.sql
```

### 4. Run Dev Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## First Game Walkthrough

1. **Sign Up**
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Sign Up"

2. **Start Training**
   - Click "Start Training Session"
   - Select 4 players
   - Click "Start Game"

3. **Pre-Flop Phase**
   - You see your 2 hole cards
   - Other players' cards are hidden (?)
   - Use the sliders to guess win probability for each player
   - Probabilities must sum to 100% (auto-adjusts)
   - Click "Submit & Reveal Probabilities"

4. **See Results**
   - Compare your guess vs actual probability
   - See accuracy score (0-100)
   - Read the tip
   - Click "Continue to Next Street"

5. **Flop Phase**
   - 3 community cards revealed
   - Guess probabilities again
   - Repeat reveal/continue

6. **Turn Phase**
   - 1 more community card revealed
   - Guess and reveal
   - Continue

7. **River Phase**
   - Final community card revealed
   - Last round of guesses
   - Click "See Final Results"

8. **Game Complete**
   - View final score
   - Click "Back to Dashboard" to see stats

## Understanding Probability Guesses

### Pre-Flop
Only hole cards are known. Equity depends on:
- Your hole card strength (AA, KK better than 72)
- Number of opponents (more opponents = lower equity)
- Position (later positions better)

### Post-Flop (Flop, Turn, River)
Community cards provide more information:
- Your hand strength (made hand, draw, etc.)
- Outs and completion chances
- Opponent range

### Tips for Better Guesses
1. Start conservatively (20% for medium hands)
2. Adjust based on how many cards came out
3. Hands improve as more community cards are revealed
4. More opponents = lower equity per player

## What Happens Behind the Scenes

1. **Card Dealing** - Deck of Cards API shuffles and deals random cards
2. **Probability Calculation** - 10,000 Monte Carlo simulations evaluate all possible outcomes
3. **Scoring** - Your accuracy measured against calculated probabilities
4. **Persistence** - Scores saved to database automatically

## Keyboard Shortcuts

- `Enter` - Submit probability guesses or continue to next phase
- `Escape` - (Planned) quit game

## Common Issues

### "Database connection failed"
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Run: `psql $DATABASE_URL -c "SELECT 1"`

### "Google sign-in not working"
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify `http://localhost:3000/api/auth/callback/google` in Google Console
- Clear browser cookies

### "Cards not dealing"
- Check network tab - Deck of Cards API should work
- Internet connection required
- API is free and has good uptime

### "Probabilities won't sum to 100%"
- Try adjusting values manually
- Sliders auto-adjust but numbers input directly
- Clear and re-enter if stuck

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Heroku

```bash
# Create app
heroku create poker-trainer

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set env vars
heroku config:set NEXTAUTH_SECRET=...
heroku config:set GOOGLE_CLIENT_ID=...

# Deploy
git push heroku main
```

### AWS/GCP/Azure
- Use managed PostgreSQL service
- Deploy Next.js to compute service
- Set environment variables
- Configure Google OAuth redirect URIs

## Next Steps

- **Challenge Yourself**: Play multiple games to improve accuracy
- **Track Progress**: Check dashboard for improvement trends
- **Learn Poker**: Research hand rankings and odds
- **Read Code**: Check `IMPLEMENTATION_GUIDE.md` for architecture details

## Documentation

- `README.md` - Full project documentation
- `AUTH_JS_SETUP.md` - Authentication setup details
- `IMPLEMENTATION_GUIDE.md` - Complete technical architecture
- `CLAUDE.md` - Developer notes and project structure

## Support

If you encounter issues:

1. Check environment variables are set correctly
2. Verify database schema is created
3. Clear browser cache and cookies
4. Check browser console for errors (F12)
5. Review logs in terminal

Enjoy the poker trainer! 🎰
