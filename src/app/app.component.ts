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


  public showSetup: boolean = true;
  public showGame: boolean = false;
  public showResults: boolean = false;

  constructor(
    private tournamentService: TournamentService,
    private gameService: GameService,
    private logger: LoggerService
  ) { }

 
  ngOnInit(): void {
    this.tournament$ = this.tournamentService.tournament$;
    this.gameState$ = this.gameService.gameState$;


    this.tournament$.subscribe(tournament => {
      this.currentTournament = tournament;
      this.updateScreenDisplay();
    });


    this.gameState$.subscribe(gameState => {
      this.currentGameState = gameState;
      this.handleGameStateChange();
    });
  }


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


  private handleGameStateChange(): void {
    if (!this.currentGameState || !this.currentTournament) {
      return;
    }


    if (this.currentGameState.isGameOver) {
      this.recordGameResult();
    }
  }


  private recordGameResult(): void {
    if (!this.currentGameState || !this.currentTournament) {
      return;
    }

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

    const lastGameInHistory = this.currentTournament.gameHistory[
      this.currentTournament.gameHistory.length - 1
    ];

    if (!lastGameInHistory || lastGameInHistory.gameNumber !== this.currentTournament.currentGameNumber) {
      this.tournamentService.recordGameResult(winner);
    }
  }

  public getScreenState(): string {
    if (this.showSetup) return 'SETUP';
    if (this.showGame) return 'GAME';
    if (this.showResults) return 'RESULTS';
    return 'UNKNOWN';
  }


  public onGameFinished(): void {
    this.updateScreenDisplay();
  }
}
