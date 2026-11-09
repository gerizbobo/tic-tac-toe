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


  public onCellClick(cellIndex: number): void {
    if (!this.currentGameState || this.currentGameState.isGameOver) {
      return;
    }

    this.gameService.makeMove(cellIndex);
  }


  public proceedToNextGame(): void {
    if (!this.currentTournament || this.currentTournament.isCompleted) {
      return;
    }

    this.tournamentService.advanceToNextGame();


    const nextStartingPlayer = this.tournamentService.getNextGameStartingPlayer();

    // Reset the game board
    this.gameService.initializeNewGame(nextStartingPlayer);
  }


  public finishTournament(): void {
    this.gameFinished.emit();
  }


  public extendTournament(): void {
    if (!this.currentTournament) {
      return;
    }

    this.currentTournament.totalGames += 1;
    this.currentTournament.isCompleted = false;
    this.currentTournament.currentGameNumber += 1;

    const nextStartingPlayer = this.tournamentService.getNextGameStartingPlayer();


    this.gameService.initializeNewGame(nextStartingPlayer);


    this.tournamentService.updateTournament(this.currentTournament);
  }


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


  public getWinner(): Player | null {
    if (!this.currentGameState || !this.currentGameState.winner) {
      return null;
    }

    return this.getPlayerBySymbol(this.currentGameState.winner);
  }


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

 
  public isCellDisabled(cellIndex: number): boolean {
    if (!this.currentGameState) {
      return false;
    }

    if (this.currentGameState.board[cellIndex] !== null) {
      return true;
    }

    if (this.currentGameState.isGameOver) {
      return true;
    }

    return false;
  }


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


  public isGameOver(): boolean {
    return this.currentGameState?.isGameOver || false;
  }


  public isTournamentComplete(): boolean {
    return this.currentTournament?.isCompleted || false;
  }


  public hasMoreGames(): boolean {
    if (!this.currentTournament) {
      return false;
    }

    return this.currentTournament.currentGameNumber < this.currentTournament.totalGames;
  }

  public isTournamentDraw(): boolean {
    if (!this.currentTournament || !this.currentTournament.isCompleted) {
      return false;
    }

    return this.currentTournament.winner === null;
  }


  public isFinalGame(): boolean {
    if (!this.currentTournament) {
      return false;
    }

    return this.currentTournament.currentGameNumber === this.currentTournament.totalGames;
  }
}
