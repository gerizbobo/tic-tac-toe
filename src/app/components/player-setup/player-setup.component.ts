import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TournamentService } from '../../services/tournament.service';
import { GameService } from '../../services/game.service';

/**
 * PlayerSetupComponent
 * Handles the initial configuration screen where players enter their information
 * 
 * Features:
 * - Player name input with validation
 * - Different name validation (players can't have the same name)
 * - Symbol selection (X or O)
 * - Tournament format selection (Best of 1, 3, or 5)
 * - Reactive Forms with FormBuilder for robust validation
 */
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

  /**
   * Initialize the form with all necessary validators
   * Called on component initialization
   */
  ngOnInit(): void {
    this.initializePlayerSetupForm();
  }

  /**
   * Creates and configures the reactive form for player setup
   * Includes custom validators for different player names
   */
  private initializePlayerSetupForm(): void {
    this.playerSetupForm = this.formBuilder.group({
      player1Name: ['', [Validators.required, this.trimmedMinLengthValidator]],
      player1Symbol: ['X', Validators.required],
      player2Name: ['', [Validators.required, this.trimmedMinLengthValidator]],
      tournamentFormat: [3, Validators.required]
    }, { validators: this.differentNamesValidator });
  }

  /**
   * Like Validators.minLength(2), but whitespace-only names are rejected too
   */
  private trimmedMinLengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value ?? '';
    return value.length === 0 || value.trim().length >= 2 ? null : { minlength: true };
  }

  /**
   * Custom validator to ensure both players have different names
   * This is a form-level validator, not a field-level validator
   * 
   * @param formGroup - The entire form group to validate
   * @returns Validation error object or null if valid
   */
  private differentNamesValidator(formGroup: FormGroup) {
    const player1Name = formGroup.get('player1Name');
    const player2Name = formGroup.get('player2Name');

    // Only validate if both names are present
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

  /**
   * Get the player 2 symbol
   * Automatically opposite of player 1's selection
   * If player1 has X, player2 gets O, and vice versa
   */
  public getPlayer2Symbol(): 'X' | 'O' {
    const player1Symbol = this.playerSetupForm.get('player1Symbol')?.value;
    return player1Symbol === 'X' ? 'O' : 'X';
  }

  /**
   * Handles form submission
   * Validates the form and starts the tournament if valid
   */
  public startTournament(): void {
    // Mark all fields as touched to show validation errors
    if (this.playerSetupForm.invalid) {
      this.showErrors = true;
      return;
    }

    // Extract form values
    const player1Name = this.playerSetupForm.get('player1Name')?.value.trim();
    const player1Symbol = this.playerSetupForm.get('player1Symbol')?.value;
    const player2Name = this.playerSetupForm.get('player2Name')?.value.trim();
    const tournamentFormat = this.playerSetupForm.get('tournamentFormat')?.value;

    // Initialize tournament in tournament service
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

  /**
   * Check if a specific form field has an error
   * Useful for displaying error messages in the template
   * 
   * @param fieldName - The name of the form field to check
   * @param errorType - The type of error to check for (e.g., 'required', 'minlength')
   */
  public hasError(fieldName: string, errorType: string): boolean {
    const field = this.playerSetupForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched || this.showErrors));
  }

  /**
   * Check if the form has the 'sameNames' error at the form level
   * This error occurs when both players enter the same name
   */
  public hasSameNamesError(): boolean {
    return !!(this.playerSetupForm.hasError('sameNames') && (this.playerSetupForm.dirty || this.playerSetupForm.touched || this.showErrors));
  }

  /**
   * Check if the start tournament button should be disabled
   * Button is disabled if form is invalid or no changes have been made
   */
  public isStartButtonDisabled(): boolean {
    return this.playerSetupForm.invalid;
  }
}
