export interface GameSession {
  id: string;
  user_id: string;
  num_players: number;
  total_score: number;
  created_at: string;
}

export interface GameRound {
  id: string;
  session_id: string;
  street: "pre-flop" | "flop" | "turn" | "river";
  round_number: number;
  hole_cards: Card[][];
  community_cards: Card[];
  player_guesses: number[];
  actual_probabilities: number[];
  round_score: number;
  created_at: string;
}

export interface PlayerResult {
  id: string;
  round_id: string;
  player_number: number;
  hand_ranking: string;
  win_probability: number;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_games_played: number;
  total_rounds_played: number;
  total_score: number;
  average_accuracy: number;
  best_round_score: number;
  updated_at: string;
}

export interface Card {
  code: string;
  value: string;
  suit: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
