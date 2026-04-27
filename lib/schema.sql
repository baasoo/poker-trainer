-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  num_players INTEGER NOT NULL DEFAULT 2,
  total_score FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game rounds table (tracks each street: pre-flop, flop, turn, river)
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  street VARCHAR(20) NOT NULL, -- 'pre-flop', 'flop', 'turn', 'river'
  round_number INTEGER NOT NULL,

  -- Hole cards (stored as JSON array for each player)
  hole_cards JSONB NOT NULL,

  -- Community cards (flop, turn, river)
  community_cards JSONB,

  -- Player guesses (JSON: {player_id: percentage})
  player_guesses JSONB NOT NULL,

  -- Actual probabilities (JSON: {player_id: percentage})
  actual_probabilities JSONB NOT NULL,

  -- Round score for user
  round_score FLOAT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Player results tracking (final hand rankings for a round)
CREATE TABLE IF NOT EXISTS player_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL,
  hand_ranking VARCHAR(50),
  win_probability FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User statistics
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_games_played INTEGER DEFAULT 0,
  total_rounds_played INTEGER DEFAULT 0,
  total_score FLOAT DEFAULT 0,
  average_accuracy FLOAT DEFAULT 0,
  best_round_score FLOAT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_rounds_session_id ON game_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_street ON game_rounds(street);
CREATE INDEX IF NOT EXISTS idx_player_results_round_id ON player_results(round_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
