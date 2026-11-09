import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tournament, Player, GameResult } from '../models/player.model';
import { LoggerService } from './logger.service';

/**
 * TournamentService
 * Manages tournament logic, scoring, and player rotation
 * 
 * Responsibilities:
 * - Initialize tournament with player setup and format
 * - Track tournament progress
 * - Update scores after each game
 * - Rotate starting player for fairness
 * - Determine tournament winner
 * - Manage tournament state through RxJS Observables
 */
@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  private tournamentSubject = new BehaviorSubject<Tournament | null>(null);
  public tournament$: Observable<Tournament | null> = this.tournamentSubject.asObservable();

  constructor(private logger: LoggerService) { }

  /**
   * Initializes a new tournament
   * Sets up the tournament with two players, format, and initial state
   * 
   * @param player1Name - Name of the first player
   * @param player1Symbol - Symbol for player 1 ('X' or 'O')
   * @param player2Name - Name of the second player
   * @param tournamentFormat - Number of games: 1, 3, or 5
   */
  public initializeTournament(
    player1Name: string,
    player1Symbol: 'X' | 'O',
    player2Name: string,
    tournamentFormat: 1 | 3 | 5
  ): void {
    const player2Symbol = player1Symbol === 'X' ? 'O' : 'X';

    const player1: Player = {
      id: 1,
      name: player1Name,
      symbol: player1Symbol,
      wins: 0
    };

    const player2: Player = {
      id: 2,
      name: player2Name,
      symbol: player2Symbol,
      wins: 0
    };

    const tournament: Tournament = {
      player1: player1,
      player2: player2,
      totalGames: tournamentFormat,
      currentGameNumber: 1,
      draws: 0,
      isCompleted: false,
      winner: null,
      gameHistory: []
    };

    this.tournamentSubject.next(tournament);
    
    // Log tournament initialization
    this.logger.logTournamentStart(player1Name, player1Symbol, player2Name, tournamentFormat);
  }

  /**
   * Gets the current tournament state value
   */
  public getCurrentTournament(): Tournament | null {
    return this.tournamentSubject.getValue();
  }

  /**
   * Records the result of a game
   * Updates scores and checks if tournament is complete
   * 
   * @param winner - The winning player or null for a draw
   */
  public recordGameResult(winner: Player | null): void {
    const tournament = this.tournamentSubject.getValue();
    
    if (!tournament) {
      return;
    }

    // Update scores
    if (winner) {
      if (winner.id === tournament.player1.id) {
        tournament.player1.wins++;
      } else {
        tournament.player2.wins++;
      }
    } else {
      tournament.draws++;
    }

    // Add to game history
    const gameResult: GameResult = {
      winner: winner,
      isDraw: !winner,
      gameNumber: tournament.currentGameNumber,
      timestamp: new Date()
    };
    tournament.gameHistory.push(gameResult);

    // Check if tournament is complete
    const totalWinsSoFar = tournament.player1.wins + tournament.player2.wins + tournament.draws;
    if (totalWinsSoFar === tournament.totalGames) {
      tournament.isCompleted = true;
      tournament.winner = this.determineTournamentWinner(tournament);
      
      // Log tournament completion
      this.logger.logTournamentEnd(
        tournament.winner?.name || null,
        tournament.player1.wins,
        tournament.player2.wins,
        tournament.draws
      );
    }

    // Log game result
    if (winner) {
      this.logger.logGameResult(gameResult.gameNumber, 'win', winner.name);
    } else {
      this.logger.logGameResult(gameResult.gameNumber, 'draw');
    }

    this.tournamentSubject.next(tournament);
  }

  /**
   * Determines the overall tournament winner
   * Compares total wins of both players
   * 
   * @param tournament - The current tournament
   * @returns The winning player or null for a draw
   */
  private determineTournamentWinner(tournament: Tournament): Player | null {
    if (tournament.player1.wins > tournament.player2.wins) {
      return tournament.player1;
    } else if (tournament.player2.wins > tournament.player1.wins) {
      return tournament.player2;
    }
    return null; // Tournament is a draw
  }

  /**
   * Gets which player should start the next game
   * Alternates starting player for fairness
   * In a Best of N series, typically:
   * - Game 1: Player 1
   * - Game 2: Player 2
   * - Game 3: Player 1
   * - etc.
   * 
   * @returns The player ('X' or 'O') who should start the next game
   */
  public getNextGameStartingPlayer(): 'X' | 'O' {
    const tournament = this.tournamentSubject.getValue();
    
    if (!tournament) {
      return 'X';
    }

    // Alternate the starting player
    // If current game number is odd, player1 starts; if even, player2 starts
    if (tournament.currentGameNumber % 2 === 1) {
      return tournament.player1.symbol;
    } else {
      return tournament.player2.symbol;
    }
  }

  /**
   * Advances the game counter when the next game starts
   */
  public advanceToNextGame(): void {
    const tournament = this.tournamentSubject.getValue();

    if (!tournament || tournament.isCompleted) {
      return;
    }

    tournament.currentGameNumber++;
    this.tournamentSubject.next(tournament);
  }

  /**
   * Resets the entire tournament for a new tournament
   */
  public resetTournament(): void {
    this.tournamentSubject.next(null);
  }

  /**
   * Update the tournament state
   * Used when extending tournament or modifying tournament state
   * 
   * @param tournament - The updated tournament object
   */
  public updateTournament(tournament: Tournament): void {
    this.tournamentSubject.next(tournament);
  }
}
