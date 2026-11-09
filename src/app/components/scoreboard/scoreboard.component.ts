import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Tournament } from '../../models/player.model';
import { TournamentService } from '../../services/tournament.service';

@Component({
    selector: 'app-scoreboard',
    imports: [CommonModule],
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {

  public tournament$!: Observable<Tournament | null>;

  constructor(private tournamentService: TournamentService) { }


  ngOnInit(): void {
    this.tournament$ = this.tournamentService.tournament$;
  }


  public getProgressPercentage(tournament: Tournament | null): number {
    if (!tournament) {
      return 0;
    }

    return tournament.gameHistory.length / tournament.totalGames * 100;
  }


  public getGameCounterText(tournament: Tournament | null): string {
    if (!tournament) {
      return '';
    }

    return `Game ${tournament.currentGameNumber} of ${tournament.totalGames}`;
  }


  public getPlayerCardClass(playerId: number): string {
    return playerId === 1 ? 'player-card player-1' : 'player-card player-2';
  }
}
