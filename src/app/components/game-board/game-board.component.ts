import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { GameService } from '../../services/game.service';
import { TournamentService } from '../../services/tournament.service';
import { GameState } from '../../models/game.model';
import { Tournament, Player } from '../../models/player.model';

/**
 * GameBoardComponent
 * Renders the 3x3 Tic Tac Toe game board and handles player interactions
 * 
 * Features:
 * - Display the game board
 * - Handle cell clicks
 * - Display current player's turn
 * - Display game result (winner or draw)
 * - Highlight winning cells (if applicable)
 * - Prevent moves after game is over
 * - Integration with GameService and TournamentService
 */
@Component({
    selector: 'app-game-board',
    imports: [CommonModule],
    templateUrl: './game-board.component.html',
    styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {

  public gameState$!: Observable<GameState>;
  public tournament$!: Observable<Tournament | null>;
  public currentGameState: GameState | null = null;
  public currentTournament: Tournament | null = null;

  @Output() gameFinished = new EventEmitter<void>();

  constructor(
    private gameService: GameService,
    private tournamentService: TournamentService
  ) { }

  /**
   * Initialize the component
   * Subscribe to game state and tournament state observables
   */
  ngOnInit(): void {
    this.gameState$ = this.gameService.gameState$;
    this.tournament$ = this.tournamentService.tournament$;

    // Subscribe to game state changes
    this.gameState$.subscribe(state => {
      this.currentGameState = state;
    });

    // Subscribe to tournament state changes
    this.tournament$.subscribe(tournament => {
      this.currentTournament = tournament;
    });
  }

  /**
   * Handle a cell click on the game board
   * Attempts to make a move at the clicked cell index
   * 
   * @param cellIndex - The index of the clicked cell (0-8)
   */
  public onCellClick(cellIndex: number): void {
    if (!this.currentGameState || this.currentGameState.isGameOver) {
      return;
    }

    this.gameService.makeMove(cellIndex);
  }

  /**
   * Proceed to the next game after current game ends
   * Resets the board and updates tournament with new starting player
   */
  public proceedToNextGame(): void {
    if (!this.currentTournament || this.currentTournament.isCompleted) {
      return;
    }

    this.tournamentService.advanceToNextGame();

    // Get the starting player for the next game
    const nextStartingPlayer = this.tournamentService.getNextGameStartingPlayer();

    // Reset the game board
    this.gameService.initializeNewGame(nextStartingPlayer);
  }

  /**
   * Finish tournament and show results
   * Called when all games are completed
   */
  public finishTournament(): void {
    this.gameFinished.emit();
  }

  /**
   * Extend the tournament by one more game (for draws)
   * Increments total games and resets for the additional game
   */
  public extendTournament(): void {
    if (!this.currentTournament) {
      return;
    }

    // Extend tournament by 1 game
    this.currentTournament.totalGames += 1;
    this.currentTournament.isCompleted = false;
    this.currentTournament.currentGameNumber += 1;

    // Get starting player for the next game
    const nextStartingPlayer = this.tournamentService.getNextGameStartingPlayer();

    // Reset the game board
    this.gameService.initializeNewGame(nextStartingPlayer);

    // Update tournament state
    this.tournamentService.updateTournament(this.currentTournament);
  }

  /**
   * Get the player object for a given symbol
   * 
   * @param symbol - 'X' or 'O'
   * @returns The Player object matching that symbol
   */
  public getPlayerBySymbol(symbol: 'X' | 'O'): Player | null {
    if (!this.currentTournament) {
      return null;
    }

    if (this.currentTournament.player1.symbol === symbol) {
      return this.currentTournament.player1;
    } else if (this.currentTournament.player2.symbol === symbol) {
      return this.currentTournament.player2;
    }

    return null;
  }

  /**
   * Get the winner player object
   * 
   * @returns The Player object who won, or null if no winner yet
   */
  public getWinner(): Player | null {
    if (!this.currentGameState || !this.currentGameState.winner) {
      return null;
    }

    return this.getPlayerBySymbol(this.currentGameState.winner);
  }

  /**
   * Get CSS class for a cell based on its content
   * 
   * @param cellIndex - The index of the cell
   * @returns CSS class name
   */
  public getCellClass(cellIndex: number): string {
    if (!this.currentGameState) {
      return '';
    }

    const cellContent = this.currentGameState.board[cellIndex];
    
    if (cellContent === 'X') {
      return 'cell-x';
    } else if (cellContent === 'O') {
      return 'cell-o';
    }

    return '';
  }

  /**
   * Check if a cell is disabled
   * A cell is disabled if it's already occupied or the game is over
   * 
   * @param cellIndex - The index of the cell
   * @returns true if the cell should be disabled, false otherwise
   */
  public isCellDisabled(cellIndex: number): boolean {
    if (!this.currentGameState) {
      return false;
    }

    // Cell is disabled if already occupied
    if (this.currentGameState.board[cellIndex] !== null) {
      return true;
    }

    // Cell is disabled if game is over
    if (this.currentGameState.isGameOver) {
      return true;
    }

    return false;
  }

  /**
   * Get the status message to display
   * Shows whose turn it is, or the result if game is over
   * 
   * @returns Status message string
   */
  public getStatusMessage(): string {
    if (!this.currentGameState || !this.currentTournament) {
      return '';
    }

    if (this.currentGameState.isGameOver) {
      if (this.currentGameState.isDraw) {
        return "It's a Draw!";
      } else {
        const winner = this.getWinner();
        return `${winner?.name} wins!`;
      }
    }

    const currentPlayer = this.getPlayerBySymbol(this.currentGameState.currentPlayer);
    return `${currentPlayer?.name}'s turn (${this.currentGameState.currentPlayer})`;
  }

  /**
   * Check if the game is currently over
   * 
   * @returns true if game is over, false otherwise
   */
  public isGameOver(): boolean {
    return this.currentGameState?.isGameOver || false;
  }

  /**
   * Check if the tournament is completed
   * 
   * @returns true if all games are finished, false otherwise
   */
  public isTournamentComplete(): boolean {
    return this.currentTournament?.isCompleted || false;
  }

  /**
   * Check if there are more games to play
   * 
   * @returns true if more games remain, false otherwise
   */
  public hasMoreGames(): boolean {
    if (!this.currentTournament) {
      return false;
    }

    return this.currentTournament.currentGameNumber < this.currentTournament.totalGames;
  }
  /**
   * Check if this is a tournament draw
   * Draw occurs when both players have equal wins
   * 
   * @returns true if tournament is drawn, false otherwise
   */
  public isTournamentDraw(): boolean {
    if (!this.currentTournament || !this.currentTournament.isCompleted) {
      return false;
    }

    return this.currentTournament.winner === null;
  }

  /**
   * Check if current game is the final game
   * 
   * @returns true if this is the last game, false otherwise
   */
  public isFinalGame(): boolean {
    if (!this.currentTournament) {
      return false;
    }

    return this.currentTournament.currentGameNumber === this.currentTournament.totalGames;
  }
}
