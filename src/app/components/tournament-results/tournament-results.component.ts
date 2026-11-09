import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Tournament } from '../../models/player.model';
import { TournamentService } from '../../services/tournament.service';
import { GameService } from '../../services/game.service';

/**
 * TournamentResultsComponent
 * Displays the final tournament results and allows starting a new tournament
 * 
 * Features:
 * - Show final tournament winner or draw
 * - Display final scores for both players
 * - Show game history
 * - Provide option to start a new tournament
 * - Display tournament statistics
 */
@Component({
    selector: 'app-tournament-results',
    imports: [CommonModule],
    templateUrl: './tournament-results.component.html',
    styleUrls: ['./tournament-results.component.css']
})
export class TournamentResultsComponent implements OnInit {

  public tournament$!: Observable<Tournament | null>;
  public showFullResults = false;

  constructor(
    private tournamentService: TournamentService,
    private gameService: GameService
  ) { }

  /**
   * Initialize the component
   * Subscribe to tournament state observable
   */
  ngOnInit(): void {
    this.tournament$ = this.tournamentService.tournament$;
  }

  /**
   * Determine if the tournament ended in a draw
   * 
   * @param tournament - The tournament to check
   * @returns true if tournament is a draw, false if there's a winner
   */
  public isTournamentDraw(tournament: Tournament | null): boolean {
    if (!tournament || !tournament.isCompleted) {
      return false;
    }

    return tournament.winner === null;
  }

  /**
   * Start a new tournament by resetting the services
   * Clears the current tournament state
   */
  public startNewTournament(): void {
    this.tournamentService.resetTournament();
    this.gameService.resetGame();
  }

  /**
   * Get a formatted result string for a game
   * Example: "Player 1 wins" or "Draw"
   * 
   * @param tournament - The tournament containing game history
   * @param gameIndex - The index of the game in history
   * @returns Formatted result string
   */
  public getGameResult(tournament: Tournament | null, gameIndex: number): string {
    if (!tournament || !tournament.gameHistory[gameIndex]) {
      return '';
    }

    const gameResult = tournament.gameHistory[gameIndex];

    if (gameResult.isDraw) {
      return 'Draw';
    }

    return `${gameResult.winner?.name} wins`;
  }

  /**
   * Get the final tournament message
   * 
   * @param tournament - The tournament
   * @returns Message string
   */
  public getFinalMessage(tournament: Tournament | null): string {
    if (!tournament || !tournament.isCompleted) {
      return '';
    }

    if (tournament.winner === null) {
      return "Tournament is a Draw!";
    }

    return `${tournament.winner.name} wins the tournament!`;
  }

  /**
   * Get win percentage for a player
   * 
   * @param tournament - The tournament
   * @param playerId - The player ID (1 or 2)
   * @returns Win percentage as a string (e.g., "66%")
   */
  public getWinPercentage(tournament: Tournament | null, playerId: number): string {
    if (!tournament || tournament.totalGames === 0) {
      return '0%';
    }

    const wins = playerId === 1 ? tournament.player1.wins : tournament.player2.wins;
    const percentage = Math.round((wins / tournament.totalGames) * 100);

    return `${percentage}%`;
  }
}
