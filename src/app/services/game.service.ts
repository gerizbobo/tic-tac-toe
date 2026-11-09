import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, BoardCell, WINNING_COMBINATIONS } from '../models/game.model';
import { LoggerService } from './logger.service';

/**
 * GameService
 * Manages the game logic for a single Tic Tac Toe game
 * 
 * Responsibilities:
 * - Initialize game board
 * - Handle player moves
 * - Detect winners
 * - Detect draws
 * - Manage game state through RxJS Observables
 */
@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  private gameStateSubject = new BehaviorSubject<GameState>(this.createInitialGameState());
  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  constructor(private logger: LoggerService) { }

  /**
   * Creates the initial game state
   * Called at game start, always starts with X
   */
  private createInitialGameState(): GameState {
    return {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isDraw: false,
      isGameOver: false,
      moveCount: 0
    };
  }

  /**
   * Initializes a new game
   * Sets the starting player (X or O)
   */
  public initializeNewGame(startingPlayer: 'X' | 'O' = 'X'): void {
    const newState = this.createInitialGameState();
    newState.currentPlayer = startingPlayer;
    this.gameStateSubject.next(newState);
  }

  /**
   * Gets the current game state value (synchronous access)
   */
  public getCurrentGameState(): GameState {
    return this.gameStateSubject.getValue();
  }

  /**
   * Handles a player's move
   * Validates the move, updates the board, checks for win/draw, switches player
   * 
   * @param cellIndex - The index of the cell (0-8) where the player wants to play
   * @returns true if the move was valid and executed, false otherwise
   */
  public makeMove(cellIndex: number): boolean {
    const currentState = this.gameStateSubject.getValue();

    // Validation: Check if game is already over
    if (currentState.isGameOver) {
      return false;
    }

    // Validation: Check if cell index is valid
    if (cellIndex < 0 || cellIndex > 8) {
      return false;
    }

    // Validation: Check if cell is already occupied
    if (currentState.board[cellIndex] !== null) {
      return false;
    }

    // Create a copy of the board and place the current player's symbol
    const newBoard = [...currentState.board];
    newBoard[cellIndex] = currentState.currentPlayer;

    // Check for a winner
    const winner = this.checkForWinner(newBoard);
    
    // Check for a draw
    const moveCount = currentState.moveCount + 1;
    const isDraw = moveCount === 9 && !winner;

    // Determine the next player
    const nextPlayer = currentState.currentPlayer === 'X' ? 'O' : 'X';

    // Create the new game state
    const newGameState: GameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winner,
      isDraw: isDraw,
      isGameOver: winner !== null || isDraw,
      moveCount: moveCount
    };

    this.gameStateSubject.next(newGameState);
    
    // Log the move
    this.logger.logMove(`Player ${currentState.currentPlayer}`, currentState.currentPlayer, cellIndex);
    
    return true;
  }

  /**
   * Checks if there's a winner on the board
   * Returns 'X', 'O', or null if no winner
   * 
   * @param board - The current board state
   * @returns 'X' | 'O' | null
   */
  private checkForWinner(board: BoardCell[]): 'X' | 'O' | null {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      
      // Check if all three cells in the combination have the same symbol (and it's not null)
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as 'X' | 'O';
      }
    }
    return null;
  }

  /**
   * Resets the game board for a new game
   * Keeps the current game state but clears the board
   */
  public resetGame(): void {
    this.gameStateSubject.next(this.createInitialGameState());
  }

  /**
   * Gets the current game state as a value (not observable)
   * Useful for getting state synchronously when needed
   */
  public getGameState(): GameState {
    return this.gameStateSubject.getValue();
  }
}
