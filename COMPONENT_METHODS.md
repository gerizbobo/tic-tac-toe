# Tic Tac Toe Tournament - Component Architecture & Method Documentation

## Project Overview
A professional Angular 18+ Tic Tac Toe Tournament application with clean code principles, reactive forms, RxJS state management, and responsive UI.

---

## Architecture Summary

### Component Hierarchy
```
AppComponent (Main Orchestrator)
├── PlayerSetupComponent (Initial Configuration)
├── GameBoardComponent (Game Rendering & Interaction)
│   ├── Uses: GameService
│   └── Uses: TournamentService
├── ScoreboardComponent (Tournament Progress)
│   └── Uses: TournamentService
└── TournamentResultsComponent (Final Results)
    ├── Uses: TournamentService
    └── Uses: GameService
```

### State Management Flow
```
TournamentService (Tournament State)
     ↓
GameService (Game State)
     ↓
Components (UI Rendering)
     ↓
User Interactions (Reactive Forms & Events)
```

---

## Services

### GameService
**Manages single game logic and state**

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `initializeNewGame()` | `(startingPlayer: 'X' \| 'O') => void` | Creates fresh game board with specified starting player | void |
| `makeMove()` | `(cellIndex: number) => boolean` | Processes player move, validates, checks win/draw | boolean |
| `checkForWinner()` | `(board: BoardCell[]) => 'X' \| 'O' \| null` | Detects if board has winning combination | 'X' \| 'O' \| null |
| `resetGame()` | `() => void` | Clears board for next game | void |
| `getGameState()` | `() => GameState` | Returns current game state value | GameState |
| `getCurrentGameState()` | `() => GameState` | Synchronous getter for game state | GameState |

#### Observable Stream
- `gameState$: Observable<GameState>` - Real-time game state updates

#### GameState Interface
```typescript
interface GameState {
  board: BoardCell[];           // 9-cell array
  currentPlayer: 'X' | 'O';     // Whose turn
  winner: 'X' | 'O' | null;     // Game winner
  isDraw: boolean;               // Draw flag
  isGameOver: boolean;           // Game finished
  moveCount: number;             // Moves played
}
```

---

### TournamentService
**Manages tournament progression, scoring, and player rotation**

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `initializeTournament()` | `(name1: string, sym1: 'X'\|'O', name2: string, format: 1\|3\|5) => void` | Sets up tournament with players and format | void |
| `recordGameResult()` | `(winner: Player \| null) => void` | Updates scores, progresses tournament | void |
| `getNextGameStartingPlayer()` | `() => 'X' \| 'O'` | Alternates starting player | 'X' \| 'O' |
| `determineTournamentWinner()` | `(tournament: Tournament) => Player \| null` | Compares total wins, declares winner | Player \| null |
| `resetTournament()` | `() => void` | Clears all tournament data | void |
| `getCurrentTournament()` | `() => Tournament \| null` | Gets current tournament state | Tournament \| null |

#### Observable Stream
- `tournament$: Observable<Tournament | null>` - Tournament state updates

#### Tournament Interface
```typescript
interface Tournament {
  player1: Player;              // Player 1 data
  player2: Player;              // Player 2 data
  totalGames: number;           // 1, 3, or 5
  currentGameNumber: number;    // Which game (1-N)
  draws: number;                // Total draws
  isCompleted: boolean;         // Tournament finished
  winner: Player | null;        // Overall winner
  gameHistory: GameResult[];    // Past game results
}
```

---

## Components

### PlayerSetupComponent
**Initial configuration screen with Reactive Forms validation**

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `initializePlayerSetupForm()` | `() => void` | Creates FormGroup with validators | void |
| `differentNamesValidator()` | `(fg: FormGroup) => ValidationErrors \| null` | Custom validator: names must differ | ValidationErrors \| null |
| `startTournament()` | `() => void` | Validates form, initializes tournament & game | void |
| `getPlayer2Symbol()` | `() => 'X' \| 'O'` | Returns opposite of player1's symbol | 'X' \| 'O' |
| `hasError()` | `(fieldName: string, errorType: string) => boolean` | Checks field error for template display | boolean |
| `hasSameNamesError()` | `() => boolean` | Checks form-level same names error | boolean |
| `isStartButtonDisabled()` | `() => boolean` | Button disabled state | boolean |

#### Form Structure
```typescript
FormGroup {
  player1Name:      ['', [required, minLength(2)]],
  player1Symbol:    ['X', required],
  player2Name:      ['', [required, minLength(2)]],
  tournamentFormat: [3, required]
}
// + Custom validator: differentNamesValidator
```

---

### GameBoardComponent
**3x3 game board rendering and interaction**

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `onCellClick()` | `(cellIndex: number) => void` | Handles player cell click, calls GameService.makeMove() | void |
| `proceedToNextGame()` | `() => void` | Resets board for next tournament game | void |
| `finishTournament()` | `() => void` | Emits gameFinished event | void |
| `getPlayerBySymbol()` | `(symbol: 'X' \| 'O') => Player \| null` | Gets player object for symbol | Player \| null |
| `getWinner()` | `() => Player \| null` | Gets winner player object | Player \| null |
| `getCellClass()` | `(cellIndex: number) => string` | Returns CSS class for cell content | string |
| `isCellDisabled()` | `(cellIndex: number) => boolean` | Determines if cell is clickable | boolean |
| `getStatusMessage()` | `() => string` | Returns turn or result message | string |
| `isGameOver()` | `() => boolean` | Game finished state | boolean |
| `isTournamentComplete()` | `() => boolean` | All games finished | boolean |
| `hasMoreGames()` | `() => boolean` | More games remain | boolean |

#### Template Variables
- `gameState$: Observable<GameState>` - Current game state
- `tournament$: Observable<Tournament | null>` - Tournament data
- `currentGameState: GameState` - Cached state value
- `currentTournament: Tournament | null` - Cached tournament value

#### Event Emitters
- `@Output() gameFinished = new EventEmitter<void>()` - Emitted when tournament complete

---

### ScoreboardComponent
**Tournament progress display and player statistics**

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `getProgressPercentage()` | `(tournament: Tournament \| null) => number` | Calculates progress bar width (0-100) | number |
| `getGameCounterText()` | `(tournament: Tournament \| null) => string` | Formats "Game X of N" string | string |
| `getPlayerCardClass()` | `(playerId: number) => string` | Returns CSS class for player card styling | string |

#### Display Elements
- Player 1 & 2 names and symbols
- Win counts
- Total draws
- Game progress bar
- Format display (Best of N)

---

### TournamentResultsComponent
**Final tournament results and statistics**

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `isTournamentDraw()` | `(tournament: Tournament \| null) => boolean` | Checks if tournament ended in draw | boolean |
| `startNewTournament()` | `() => void` | Resets services for new tournament | void |
| `getGameResult()` | `(tournament: Tournament \| null, index: number) => string` | Formats game result text | string |
| `getFinalMessage()` | `(tournament: Tournament \| null) => string` | Winner or draw announcement | string |
| `getWinPercentage()` | `(tournament: Tournament \| null, playerId: number) => string` | Calculates win % for player | string |

#### Displays
- Tournament winner (or draw)
- Final scores and percentages
- Complete game history
- Play again button

---

## AppComponent (Main Orchestrator)

#### Key Methods

| Method | Signature | Purpose | Returns |
|--------|-----------|---------|---------|
| `updateScreenDisplay()` | `() => void` | Routes to correct screen based on tournament state | void |
| `handleGameStateChange()` | `() => void` | Detects game end, records result | void |
| `recordGameResult()` | `() => void` | Processes game completion | void |
| `onGameFinished()` | `() => void` | Event handler for tournament completion | void |
| `getScreenState()` | `() => string` | Returns current screen ('SETUP'\|'GAME'\|'RESULTS') | string |

#### Screen Display State Flags
- `showSetup: boolean` - Display player configuration
- `showGame: boolean` - Display active game
- `showResults: boolean` - Display final results

#### State Subscriptions
- `tournament$: Observable<Tournament | null>` - Tracks tournament
- `gameState$: Observable<GameState>` - Tracks game state

#### Screen Routing Logic
```
No Tournament → Show Setup
Tournament Active → Show Game + Scoreboard
Tournament Completed → Show Results
```

---

## Models / Interfaces

### Player Model
```typescript
interface Player {
  id: number;              // 1 or 2
  name: string;            // Player name
  symbol: 'X' | 'O';       // Selected symbol
  wins: number;            // Total wins
}
```

### GameState Model
```typescript
interface GameState {
  board: BoardCell[];           // Array of 9 cells
  currentPlayer: 'X' | 'O';     // Current turn
  winner: 'X' | 'O' | null;     // Winner symbol
  isDraw: boolean;               // Draw flag
  isGameOver: boolean;           // Finished
  moveCount: number;             // Total moves
}
```

### GameResult Model
```typescript
interface GameResult {
  winner: Player | null;    // Winner or null
  isDraw: boolean;          // Draw flag
  gameNumber: number;       // Game number
  timestamp: Date;          // When played
}
```

### Tournament Model
```typescript
interface Tournament {
  player1: Player;          // First player
  player2: Player;          // Second player
  totalGames: number;       // 1, 3, or 5
  currentGameNumber: number;// 1 to totalGames
  draws: number;            // Total draws
  isCompleted: boolean;     // All played
  winner: Player | null;    // Overall winner
  gameHistory: GameResult[];// All results
}
```

---

## Key Algorithms & Logic

### Winner Detection Algorithm
```typescript
// Checks all 8 winning combinations
WINNING_COMBINATIONS = [
  [0,1,2], [3,4,5], [6,7,8],  // rows
  [0,3,6], [1,4,7], [2,5,8],  // columns
  [0,4,8], [2,4,6]            // diagonals
]

For each combination [a,b,c]:
  If board[a] === board[b] === board[c] AND not null:
    Return winner (X or O)
Return null if no winner found
```

### Player Rotation Logic
```typescript
// Alternates starting player for fairness
If currentGameNumber is ODD (1, 3, 5...):
  Player 1 starts
Else (2, 4, 6...):
  Player 2 starts
```

### Tournament Completion
```typescript
After each game:
  Update winner's win count OR increment draws
  If total games played === totalGames:
    Tournament is complete
    Compare player1.wins vs player2.wins
    Declare winner or draw

When "Play Next Game" is clicked:
  Increment currentGameNumber (advanceToNextGame)
```

---

## Reactive Forms Integration

### FormBuilder Usage
```typescript
FormGroup created with FormBuilder
├── Field validators (required, minLength)
└── Form-level validator (differentNamesValidator)

Validation state drives:
├── Error message display
└── Button enabled/disabled state
```

### Error Handling Pattern
```typescript
hasError(fieldName, errorType) {
  const field = formGroup.get(fieldName)
  return field?.hasError(errorType) && 
         (field.dirty || field.touched || showErrors)
}
```

---

## RxJS Concepts Used

1. **BehaviorSubject**: Stores and broadcasts current state
   - `gameStateSubject` - Latest game state
   - `tournamentSubject` - Latest tournament state

2. **Observable**: Read-only view of state changes
   - `gameState$` - Game state stream
   - `tournament$` - Tournament state stream

3. **Subscription Pattern**: Components subscribe to streams
   - Unsubscribe automatically via async pipe
   - Manual subscriptions in component init

4. **State Updates**: Services use `.next()` to emit new state
   - Triggers all subscriptions
   - Components re-render

---

## File Structure
```
src/app/
├── app.component.ts          # Main orchestrator
├── app.component.html        # Main template
├── app.component.css         # Main styles
├── services/
│   ├── game.service.ts       # Game logic
│   └── tournament.service.ts # Tournament logic
├── components/
│   ├── player-setup/         # Setup screen
│   ├── game-board/           # Game rendering
│   ├── scoreboard/           # Progress display
│   └── tournament-results/   # Results screen
└── models/
    ├── game.model.ts         # Game interfaces
    └── player.model.ts       # Player/Tournament interfaces
```

---

## Summary

This implementation demonstrates:
- ✅ Clean component architecture
- ✅ Separation of concerns (Services vs Components)
- ✅ Reactive Forms with custom validators
- ✅ RxJS observables for state management
- ✅ Professional UI with responsive design
- ✅ Readable method names and documentation
- ✅ Tournament logic with player rotation
- ✅ Win detection algorithm
- ✅ Easy to understand and present
