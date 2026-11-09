import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Tournament } from '../../models/player.model';
import { TournamentService } from '../../services/tournament.service';

/**
 * ScoreboardComponent
 * Displays the tournament progress and current scores
 * 
 * Features:
 * - Show both player names and symbols
 * - Display win count for each player
 * - Show total draws
 * - Display current game number and total games
 * - Real-time updates using RxJS Observables
 */
@Component({
    selector: 'app-scoreboard',
    imports: [CommonModule],
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {

  public tournament$!: Observable<Tournament | null>;

  constructor(private tournamentService: TournamentService) { }

  /**
   * Initialize the component
   * Subscribe to tournament state observable
   */
  ngOnInit(): void {
    this.tournament$ = this.tournamentService.tournament$;
  }

  /**
   * Calculate the progress percentage for the progress bar
   * 
   * @param tournament - The current tournament
   * @returns Progress as a percentage (0-100)
   */
  public getProgressPercentage(tournament: Tournament | null): number {
    if (!tournament) {
      return 0;
    }

    return tournament.gameHistory.length / tournament.totalGames * 100;
  }

  /**
   * Get the game counter text
   * Example: "Game 2 of 5"
   * 
   * @param tournament - The current tournament
   * @returns Formatted game counter string
   */
  public getGameCounterText(tournament: Tournament | null): string {
    if (!tournament) {
      return '';
    }

    return `Game ${tournament.currentGameNumber} of ${tournament.totalGames}`;
  }

  /**
   * Get CSS class for the player card
   * Used for styling and visual distinction
   * 
   * @param playerId - The ID of the player (1 or 2)
   * @returns CSS class name
   */
  public getPlayerCardClass(playerId: number): string {
    return playerId === 1 ? 'player-card player-1' : 'player-card player-2';
  }
}
