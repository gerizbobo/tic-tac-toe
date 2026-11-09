import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TournamentService } from '../../services/tournament.service';
import { GameService } from '../../services/game.service';


@Component({
    selector: 'app-player-setup',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './player-setup.component.html',
    styleUrls: ['./player-setup.component.css']
})
export class PlayerSetupComponent implements OnInit {

  public playerSetupForm!: FormGroup;
  public showErrors: boolean = false;
  public availableFormats = [
    { value: 1, label: 'Best of 1 (1 game)' },
    { value: 3, label: 'Best of 3 (3 games)' },
    { value: 5, label: 'Best of 5 (5 games)' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private tournamentService: TournamentService,
    private gameService: GameService
  ) { }


  ngOnInit(): void {
    this.initializePlayerSetupForm();
  }


  private initializePlayerSetupForm(): void {
    this.playerSetupForm = this.formBuilder.group({
      player1Name: ['', [Validators.required, this.trimmedMinLengthValidator]],
      player1Symbol: ['X', Validators.required],
      player2Name: ['', [Validators.required, this.trimmedMinLengthValidator]],
      tournamentFormat: [3, Validators.required]
    }, { validators: this.differentNamesValidator });
  }


  private trimmedMinLengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value ?? '';
    return value.length === 0 || value.trim().length >= 2 ? null : { minlength: true };
  }


  private differentNamesValidator(formGroup: FormGroup) {
    const player1Name = formGroup.get('player1Name');
    const player2Name = formGroup.get('player2Name');

    if (player1Name && player2Name) {
      const names1 = player1Name.value?.trim().toLowerCase();
      const names2 = player2Name.value?.trim().toLowerCase();

      // Check if names are different
      if (names1 && names2 && names1 === names2) {
        return { sameNames: true };
      }
    }

    return null;
  }

  public getPlayer2Symbol(): 'X' | 'O' {
    const player1Symbol = this.playerSetupForm.get('player1Symbol')?.value;
    return player1Symbol === 'X' ? 'O' : 'X';
  }


  public startTournament(): void {
    if (this.playerSetupForm.invalid) {
      this.showErrors = true;
      return;
    }

    const player1Name = this.playerSetupForm.get('player1Name')?.value.trim();
    const player1Symbol = this.playerSetupForm.get('player1Symbol')?.value;
    const player2Name = this.playerSetupForm.get('player2Name')?.value.trim();
    const tournamentFormat = this.playerSetupForm.get('tournamentFormat')?.value;

    this.tournamentService.initializeTournament(
      player1Name,
      player1Symbol,
      player2Name,
      tournamentFormat
    );

    // Initialize the first game
    const startingPlayer = this.tournamentService.getNextGameStartingPlayer();
    this.gameService.initializeNewGame(startingPlayer);
  }

  
  public hasError(fieldName: string, errorType: string): boolean {
    const field = this.playerSetupForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.showErrors));
  }


  public hasSameNamesError(): boolean {
    return !!(this.playerSetupForm.hasError('sameNames') && (this.playerSetupForm.dirty || this.playerSetupForm.touched || this.showErrors));
  }


  public isStartButtonDisabled(): boolean {
    return this.playerSetupForm.invalid;
  }
}
