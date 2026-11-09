# Tic Tac Toe Tournament Application

A professional, production-ready Angular 18+ Tic Tac Toe Tournament application built with TypeScript, Reactive Forms, and RxJS.

## Features

✨ **Core Features**
- 🎮 Interactive Tic Tac Toe game board with 3x3 grid
- 👥 Two-player tournament with configurable format (Best of 1, 3, or 5)
- 📊 Real-time scoreboard with player stats and progress tracking
- 🏆 Tournament results with game history
- 🔄 Auto-rotating starting player for fairness
- 📱 Fully responsive design (mobile, tablet, desktop)
- ♿ Accessible UI with proper ARIA labels

📊 **Logging & Monitoring**
- 📝 Comprehensive logging service with multiple log levels
- 💾 LocalStorage persistence of logs
- 📥 Export logs as JSON or CSV
- 🔍 Browser console output with color-coded messages
- 📊 Log filtering and summary reports

🏗️ **Architecture**
- 🔗 RxJS Observables for state management
- 📝 Reactive Forms with custom validators
- 🎯 Service-oriented architecture
- 🧪 Testable components with dependency injection
- 📦 Standalone Angular components

🐳 **Deployment**
- 🐳 Docker support with docker-compose
- 🚀 Multi-stage build for optimized production images
- 🔧 Environment configuration support

## Project Structure

```
tic-tac-toe-ui/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── player-setup/         # Player configuration screen
│   │   │   ├── game-board/           # Game board and moves
│   │   │   ├── scoreboard/           # Tournament progress display
│   │   │   └── tournament-results/   # Final results screen
│   │   ├── services/
│   │   │   ├── game.service.ts       # Game logic & state
│   │   │   ├── tournament.service.ts # Tournament management
│   │   │   └── logger.service.ts     # Logging functionality
│   │   ├── models/
│   │   │   ├── game.model.ts         # Game type definitions
│   │   │   └── player.model.ts       # Player & tournament types
│   │   └── app.component.ts          # Main orchestrator
│   └── styles.css                     # Global styles
├── Dockerfile                         # Container image definition
├── docker-compose.yml                 # Multi-container setup
├── angular.json                       # Angular configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies
└── README.md                          # This file
```

## Quick Start

### Prerequisites
- Node.js 22+ or v23.11.0 (LTS)
- npm 10.9.2+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone or navigate to the project
cd tic-tac-toe-ui

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
```

## Running with Docker

### Using Docker Compose

```bash
# Start the application with Docker Compose
docker-compose up --build

# Access the application at http://localhost:4200

# Stop the application
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t tic-tac-toe-tournament .

# Run the container
docker run -p 4200:4200 tic-tac-toe-tournament

# Access at http://localhost:4200
```

## Available Commands

```bash
# Development
npm start                 # Start dev server with live reload
npm run build            # Build for production
npm run serve:prod       # Serve production build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Testing
npm test                 # Run unit tests
npm run e2e              # Run end-to-end tests
```

## Application Usage

### 1. Player Setup Screen
- Enter names for both players (minimum 2 characters)
- Select starting symbol (X or O) for player 1
- Player 2 symbol is auto-assigned as the opposite
- Choose tournament format:
  - **Single Game (1)**: Play one game
  - **Best of 3**: First to win 2 games
  - **Best of 5**: First to win 3 games

### 2. Game Board Screen
- Click empty cells to make moves
- Current player symbol and turn displayed at top
- Real-time scoreboard shows:
  - Player names and symbols
  - Current game number
  - Win counts
  - Draw count
  - Progress bar
- Winning patterns detected automatically
- Draw detection when all cells filled

### 3. Tournament Results Screen
- Final tournament winner or draw declaration
- Final scores and win percentages
- Game history with all results
- Option to play another tournament

## Logging & Debugging

### Accessing Logs

Logs are automatically collected and can be accessed via browser console:

```javascript
// In browser console (F12 → Console tab)

// Get the logger service
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;

// View logs
logger.getLogs();

// Get logs by level
logger.getLogsByLevel(LogLevel.ERROR);

// Export logs
const json = logger.exportAsJSON();
const csv = logger.exportAsCSV();

// Download logs as file
logger.downloadLogs('json');
logger.downloadLogs('csv');

// Print summary
logger.printSummary();

// Clear logs
logger.clearLogs();
```

### Log Levels

- **DEBUG** (0): Detailed information for debugging
- **INFO** (1): General informational messages
- **WARN** (2): Warning messages for potential issues
- **ERROR** (3): Error messages for failures

### Logged Events

The application logs the following events:

```
Tournament Started: Initial tournament setup
Game Started: Beginning of each game
Move Made: Each player move with cell index
Game Result: Win/loss/draw for each game
Tournament Ended: Final tournament winner
```

### Log Output Examples

```
[10:15:30] INFO Tournament Started {player1: {name: "Alice", symbol: "X"}, player2: {name: "Bob", symbol: "O"}, totalGames: 3, format: "Best of 3"}
[10:15:35] INFO Game 1 Started {gameNumber: 1, startingPlayer: "X"}
[10:15:40] DEBUG Player X moved to cell 4 {player: "Player X", symbol: "X", cellIndex: 4}
[10:15:50] INFO Game 1 Result: Alice Wins {gameNumber: 1, result: "win", winner: "Alice"}
[10:16:30] INFO Tournament Ended: Alice Wins {result: "win", winner: "Alice", player1Wins: 2, player2Wins: 0, draws: 0}
```

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Copy the example
cp .env.example .env

# Edit .env with your settings
# Available options:
# - NODE_ENV: development or production
# - PORT: Application port (default 4200)
# - LOG_LEVEL: DEBUG, INFO, WARN, ERROR
# - ENABLE_CONSOLE_LOGS: true or false
# - ENABLE_LOCAL_STORAGE_LOGS: true or false
```

## Architecture & Design Patterns

### Services Architecture

**GameService**
- Manages single Tic Tac Toe game logic
- Tracks board state via RxJS BehaviorSubject
- Handles move validation and win detection
- Broadcasts game state changes

**TournamentService**
- Orchestrates tournament progression
- Updates scoring after each game
- Rotates starting player
- Determines tournament winner
- Persists tournament state

**LoggerService**
- Centralized logging with multiple outputs
- Console, localStorage, and in-memory storage
- Exportable logs (JSON/CSV)
- Color-coded console output
- Log level filtering

### State Management

Uses RxJS Observables for reactive data flow:

```typescript
// Tournament state
tournament$: Observable<Tournament | null>

// Game state
gameState$: Observable<GameState>
```

Components subscribe to these observables using the `async` pipe for automatic updates.

### Reactive Forms

Player setup form uses Reactive Forms with:
- FormBuilder for form creation
- Validators for field-level validation
- Custom validators for form-level rules (different names)
- Automatic type safety with TypeScript

## Performance Optimizations

- ✅ Tree-shaking for unused code removal
- ✅ Lazy loading ready (standalone components)
- ✅ OnPush change detection strategy
- ✅ Optimized CSS with minimal specificity
- ✅ Responsive images and media queries
- ✅ Minified production builds (99.38 KB transfer size)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design Breakpoints

- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px - 1199px (optimized grid)
- **Mobile**: Below 768px (stacked layout)
- **Small Mobile**: Below 480px (minimized spacing)

## RxJS Concepts Used

### Observables
- BehaviorSubject for current value access
- Observable for component subscriptions

### Operators
- `asObservable()` for exposing only the observable interface
- `async` pipe for automatic subscription/unsubscription

### Subscription Management
- OnDestroy lifecycle hook for cleanup
- Async pipe for automatic unsubscribe

## TypeScript Features

- ✅ Strict mode enabled
- ✅ ES2022 target compilation
- ✅ Strong type inference
- ✅ Interface definitions for all models
- ✅ Proper null/undefined handling

## Development Workflow

### Git Workflow

Before committing:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: add feature description"

# Push to remote
git push origin main
```

### Code Style

The project uses:
- ESLint for code quality
- TypeScript strict mode
- Prettier for formatting
- Angular style guide conventions

## Production Deployment

### Build Production Version

```bash
npm run build
# Output: dist/tic-tac-toe-ui/
```

### Docker Production Deployment

```bash
# Build production image
docker build -t tic-tac-toe:latest .

# Run production container
docker run -p 80:4200 tic-tac-toe:latest
```

### Deployment Checklist

- ✅ Run production build
- ✅ Test all features
- ✅ Verify logging works
- ✅ Check responsive design
- ✅ Test on target browsers
- ✅ Verify docker container runs
- ✅ Check security headers
- ✅ Validate accessibility

## Troubleshooting

### Common Issues

**Port 4200 already in use**
```bash
# Use different port
ng serve --port 4300
```

**Dependencies not installing**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules

# Reinstall
npm install
```

**Logs not appearing**
```javascript
// In browser console:
// Check if logging is enabled
ng.probe(document.querySelector('app-root')).componentInstance.logger.getLogs()
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Feedback

For issues, questions, or suggestions:
- 📧 Email: [contact@example.com]
- 💬 Open an issue on GitHub
- 🐛 Report bugs with logs and steps to reproduce

## Changelog

### v1.0.0 - Initial Release
- ✅ Complete Tic Tac Toe game implementation
- ✅ Tournament scoring system
- ✅ Comprehensive logging service
- ✅ Docker containerization
- ✅ Responsive design
- ✅ Production-ready build

---

**Happy Gaming!** 🎮 Good luck in your tournaments!
