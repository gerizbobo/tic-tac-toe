export type BoardCell = 'X' | 'O' | null;

export interface GameState {
  board: BoardCell[];
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | null;
  isDraw: boolean;
  isGameOver: boolean;
  moveCount: number;
}

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6]  // diagonal top-right to bottom-left
];
