/**
 * Player Model
 * Defines types and interfaces for players and tournament state
 */

/**
 * Represents a single player in the tournament
 */
export interface Player {
  id: 1 | 2;
  name: string;
  symbol: 'X' | 'O';
  wins: number;
}

/**
 * Represents a game result (win/loss/draw)
 */
export interface GameResult {
  winner: Player | null;
  isDraw: boolean;
  gameNumber: number;
  timestamp: Date;
}

/**
 * Represents the complete tournament state
 */
export interface Tournament {
  player1: Player;
  player2: Player;
  totalGames: number;
  currentGameNumber: number;
  draws: number;
  isCompleted: boolean;
  winner: Player | null;
  gameHistory: GameResult[];
}
