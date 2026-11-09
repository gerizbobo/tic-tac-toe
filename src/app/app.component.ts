import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Tournament } from './models/player.model';
import { GameState } from './models/game.model';
import { TournamentService } from './services/tournament.service';
import { GameService } from './services/game.service';
import { LoggerService } from './services/logger.service';
import { PlayerSetupComponent } from './components/player-setup/player-setup.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { TournamentResultsComponent } from './components/tournament-results/tournament-results.component';

/**
 * AppComponent
 * Main component that orchestrates the entire tournament application
 * 
 * Manages:
 * - Transition between different screens (setup, game, results)
 * - Tournament state
 * - Game state
 * - Communication between services and components
 */
@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        PlayerSetupComponent,
        GameBoardComponent,
        ScoreboardComponent,
        TournamentResultsComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public tournament$!: Observable<Tournament | null>;
  public gameState$!: Observable<GameState>;
  public currentTournament: Tournament | null = null;
  public currentGameState: GameState | null = null;

  // State flags to determine which screen to display
  public showSetup: boolean = true;
  public showGame: boolean = false;
  public showResults: boolean = false;

  constructor(
    private tournamentService: TournamentService,
    private gameService: GameService,
    private logger: LoggerService
  ) { }

  /**
   * Initialize the application
   * Subscribe to tournament and game state
   * Set up screen transitions
   */
  ngOnInit(): void {
    this.tournament$ = this.tournamentService.tournament$;
    this.gameState$ = this.gameService.gameState$;

    // Subscribe to tournament state changes
    this.tournament$.subscribe(tournament => {
      this.currentTournament = tournament;
      this.updateScreenDisplay();
    });

    // Subscribe to game state changes
    this.gameState$.subscribe(gameState => {
      this.currentGameState = gameState;
      this.handleGameStateChange();
    });
  }

  /**
   * Update which screen to display based on tournament state
   * 
   * Screen logic:
   * - No tournament: Show setup screen
   * - Tournament active: Show game board
   * - Tournament completed: Show results
   */
  private updateScreenDisplay(): void {
    if (!this.currentTournament) {
      this.showSetup = true;
      this.showGame = false;
      this.showResults = false;
    } else if (this.currentTournament.isCompleted) {
      this.showSetup = false;
      this.showGame = false;
      this.showResults = true;
    } else {
      this.showSetup = false;
      this.showGame = true;
      this.showResults = false;
    }
  }

  /**
   * Handle game state changes
   * Update tournament when a game ends
   */
  private handleGameStateChange(): void {
    if (!this.currentGameState || !this.currentTournament) {
      return;
    }

    // If game just ended, record the result
    if (this.currentGameState.isGameOver) {
      this.recordGameResult();
    }
  }

  /**
   * Record the result of the current game in the tournament
   * This is called automatically when a game ends
   */
  private recordGameResult(): void {
    if (!this.currentGameState || !this.currentTournament) {
      return;
    }

    // Determine winner
    let winner = null;
    if (this.currentGameState.winner) {
      if (this.currentGameState.winner === 'X') {
        winner = this.currentTournament.player1.symbol === 'X'
          ? this.currentTournament.player1
          : this.currentTournament.player2;
      } else {
        winner = this.currentTournament.player1.symbol === 'O'
          ? this.currentTournament.player1
          : this.currentTournament.player2;
      }
    }

    // Record result only once
    const lastGameInHistory = this.currentTournament.gameHistory[
      this.currentTournament.gameHistory.length - 1
    ];

    if (!lastGameInHistory || lastGameInHistory.gameNumber !== this.currentTournament.currentGameNumber) {
      this.tournamentService.recordGameResult(winner);
    }
  }

  /**
   * Get the current screen display state
   * Used for debugging/development
   */
  public getScreenState(): string {
    if (this.showSetup) return 'SETUP';
    if (this.showGame) return 'GAME';
    if (this.showResults) return 'RESULTS';
    return 'UNKNOWN';
  }

  /**
   * Handle game finished event from GameBoardComponent
   * Called when all tournament games are completed
   */
  public onGameFinished(): void {
    this.updateScreenDisplay();
  }
}
