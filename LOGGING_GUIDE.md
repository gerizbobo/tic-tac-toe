# Logging Guide - Tic Tac Toe Tournament Application

Complete guide to accessing, viewing, and exporting logs from the application.

## Overview

The Tic Tac Toe Tournament application includes a comprehensive logging system that tracks:
- Tournament initialization
- Game starts and moves
- Game results (wins, draws)
- Tournament completion

Logs are stored in:
- **Browser Console** - Real-time, color-coded output
- **localStorage** - Persistent storage (last 100 logs)
- **Memory** - Current session logs (up to 1000 logs)

## Accessing Logs via Browser Console

### Step 1: Open Developer Tools

- **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
- **Mac**: Press `Cmd+Option+I`
- Click on the **Console** tab

### Step 2: View All Logs

```javascript
// In browser console, run:
ng.probe(document.querySelector('app-root')).componentInstance.logger.getLogs()
```

**Output Example:**
```
(5) [
  {timestamp: Mon Nov 04 2026 10:15:30 GMT+0200, level: 1, message: "Logger Service Initialized", data: undefined},
  {timestamp: Mon Nov 04 2026 10:15:35 GMT+0200, level: 1, message: "Tournament Started", data: {…}},
  {timestamp: Mon Nov 04 2026 10:15:40 GMT+0200, level: 0, message: "Player X moved to cell 4", data: {…}},
  {timestamp: Mon Nov 04 2026 10:15:50 GMT+0200, level: 1, message: "Game 1 Result: Alice Wins", data: {…}},
  {timestamp: Mon Nov 04 2026 10:16:00 GMT+0200, level: 1, message: "Tournament Ended: Alice Wins", data: {…}}
]
```

## Log Levels

| Level | Name  | Number | Use Case |
|-------|-------|--------|----------|
| DEBUG | 0     | 0      | Detailed move information |
| INFO  | 1     | 1      | Tournament/game events |
| WARN  | 2     | 2      | Warning messages |
| ERROR | 3     | 3      | Error conditions |

### View Logs by Level

```javascript
// Get ERROR logs only
const LogLevel = {DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3};
ng.probe(document.querySelector('app-root')).componentInstance.logger.getLogsByLevel(LogLevel.ERROR);

// Get INFO logs only
ng.probe(document.querySelector('app-root')).componentInstance.logger.getLogsByLevel(LogLevel.INFO);

// Get DEBUG logs only
ng.probe(document.querySelector('app-root')).componentInstance.logger.getLogsByLevel(LogLevel.DEBUG);
```

## Filtering Logs

### View Logs from Last 10 Minutes

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
const recentLogs = logger.getLogs().filter(log => log.timestamp > tenMinutesAgo);
console.table(recentLogs);
```

### Search Logs by Message

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const searchTerm = "wins"; // case-insensitive
const results = logger.getLogs().filter(log => 
  log.message.toLowerCase().includes(searchTerm.toLowerCase())
);
console.table(results);
```

### Search Logs by Player Name

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const playerName = "Alice";
const results = logger.getLogs().filter(log => 
  log.data && JSON.stringify(log.data).includes(playerName)
);
console.table(results);
```

## Exporting Logs

### Export as JSON

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const jsonData = logger.exportAsJSON();
console.log(jsonData);

// Or download directly
logger.downloadLogs('json');
```

**JSON Format:**
```json
[
  {
    "timestamp": "2026-11-04T10:15:30.123Z",
    "level": 1,
    "message": "Tournament Started",
    "data": {
      "player1": {"name": "Alice", "symbol": "X"},
      "player2": {"name": "Bob", "symbol": "O"},
      "totalGames": 3,
      "format": "Best of 3"
    }
  }
]
```

### Export as CSV

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const csvData = logger.exportAsCSV();
console.log(csvData);

// Or download directly
logger.downloadLogs('csv');
```

**CSV Format:**
```
"Timestamp","Level","Message","Data"
"2026-11-04T10:15:30.123Z","INFO","Tournament Started","{""player1"":{""name"":""Alice"",""symbol"":""X""}}"
"2026-11-04T10:15:40.456Z","DEBUG","Player X moved to cell 4","{""player"":""Player X"",""symbol"":""X"",""cellIndex"":4}"
```

## Download Logs as File

### Automatic Download (Recommended)

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;

// Download as JSON
logger.downloadLogs('json');

// Download as CSV
logger.downloadLogs('csv');
```

The file will be saved to your Downloads folder with timestamp:
- `tic-tac-toe-logs-1730703330123.json`
- `tic-tac-toe-logs-1730703330123.csv`

### Manual Copy-Paste Method

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;

// Copy to clipboard (JSON)
const json = logger.exportAsJSON();
copy(json);  // Paste to file

// Copy to clipboard (CSV)
const csv = logger.exportAsCSV();
copy(csv);   // Paste to file
```

## Viewing Log Summary

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
logger.printSummary();
```

**Output:**
```
Log Summary
┌─────────────────┬───────┐
│ (index)         │ Values│
├─────────────────┼───────┤
│ totalLogs       │ 42    │
│ debug           │ 20    │
│ info            │ 15    │
│ warn            │ 4     │
│ error           │ 3     │
│ timeRange       │       │
│   start         │ Date  │
│   end           │ Date  │
└─────────────────┴───────┘
```

## Clearing Logs

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
logger.clearLogs();
```

**⚠️ Warning**: This clears all logs from memory and localStorage.

## Monitoring During Gameplay

### Real-Time Console Output

The logger automatically outputs to the browser console as events happen:

```
[10:15:30] INFO Logger Service Initialized
[10:15:35] INFO Tournament Started {player1: {name: "Alice", symbol: "X"}, player2: {name: "Bob", symbol: "O"}, totalGames: 3, format: "Best of 3"}
[10:15:40] INFO Game 1 Started {gameNumber: 1, startingPlayer: "X"}
[10:15:45] DEBUG Player X moved to cell 4 {player: "Player X", symbol: "X", cellIndex: 4}
[10:15:50] DEBUG Player O moved to cell 0 {player: "Player O", symbol: "O", cellIndex: 0}
[10:16:00] INFO Game 1 Result: Alice Wins {gameNumber: 1, result: "win", winner: "Alice"}
[10:16:30] INFO Tournament Ended: Alice Wins {result: "win", winner: "Alice", player1Wins: 2, player2Wins: 0, draws: 0}
```

### Change Log Level (Runtime)

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const LogLevel = {DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3};

// Show only INFO and above (hide DEBUG)
logger.setLogLevel(LogLevel.INFO);

// Show only ERRORS
logger.setLogLevel(LogLevel.ERROR);

// Show all (including DEBUG)
logger.setLogLevel(LogLevel.DEBUG);
```

### Enable/Disable Console Output

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;

// Disable console output (logs still stored in memory/localStorage)
logger.setConsoleOutput(false);

// Re-enable console output
logger.setConsoleOutput(true);
```

### Enable/Disable localStorage Persistence

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;

// Disable localStorage persistence
logger.setLocalStorageEnabled(false);

// Enable localStorage persistence
logger.setLocalStorageEnabled(true);
```

## Analyzing Tournament Data

### Get Tournament Statistics

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const logs = logger.getLogs();

// Find tournament started event
const tournamentStarted = logs.find(log => log.message.includes('Tournament Started'));
console.log('Tournament Info:', tournamentStarted.data);

// Find all game results
const gameResults = logs.filter(log => log.message.includes('Game') && log.message.includes('Result'));
console.table(gameResults);

// Find tournament end
const tournamentEnd = logs.find(log => log.message.includes('Tournament Ended'));
console.log('Final Result:', tournamentEnd.data);
```

### Count Moves per Player

```javascript
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const logs = logger.getLogs();

const moves = logs.filter(log => log.message.includes('moved'));
const xMoves = moves.filter(log => log.data.symbol === 'X').length;
const oMoves = moves.filter(log => log.data.symbol === 'O').length;

console.log(`X moves: ${xMoves}, O moves: ${oMoves}`);
```

## Troubleshooting

### Logs Not Appearing

**Check 1:** Verify logger is initialized
```javascript
console.log(ng.probe(document.querySelector('app-root')).componentInstance.logger);
```

**Check 2:** Verify console output is enabled
```javascript
ng.probe(document.querySelector('app-root')).componentInstance.logger.setConsoleOutput(true);
```

**Check 3:** Check localStorage limits
```javascript
// View all localStorage
console.log(localStorage.getItem('tic-tac-toe-logs'));
```

### localStorage Full

```javascript
// Clear localStorage logs
localStorage.removeItem('tic-tac-toe-logs');

// Verify cleanup
console.log(localStorage.getItem('tic-tac-toe-logs'));
```

### Accessing Logger from Custom Code

```typescript
// In your component
import { LoggerService } from './services/logger.service';

export class MyComponent {
  constructor(private logger: LoggerService) {}

  logCustomEvent() {
    this.logger.logInfo('Custom event occurred', { customData: 'value' });
  }
}
```

## Log Storage Limits

- **In-Memory**: 1000 logs max (older logs discarded)
- **localStorage**: 100 logs max (keeps most recent)
- **Browser localStorage size limit**: ~5-10MB (depending on browser)

## Performance Considerations

- Logging is optimized for minimal performance impact
- Each log entry takes approximately 200-500 bytes
- 1000 logs ≈ 200-500 KB in memory
- Logs can be cleared to free memory if needed

## Best Practices

1. **Download Logs Regularly**: Don't rely on browser memory
   ```javascript
   logger.downloadLogs('json');
   ```

2. **Filter Before Export**: Export only relevant logs
   ```javascript
   const recent = logger.getLogs().filter(log => 
     new Date(log.timestamp) > new Date(Date.now() - 1000 * 60 * 60)
   );
   ```

3. **Monitor Error Logs**: Check for unexpected errors
   ```javascript
   logger.getLogsByLevel(LogLevel.ERROR);
   ```

4. **Clear Logs After Download**: Avoid accumulation
   ```javascript
   logger.downloadLogs('json');
   logger.clearLogs();
   ```

5. **Set Appropriate Log Level**: Balance detail with performance
   ```javascript
   logger.setLogLevel(LogLevel.INFO);  // Good for production
   logger.setLogLevel(LogLevel.DEBUG); // Good for development
   ```

## Integration with External Services

### Send Logs to Server

```javascript
// Example: POST logs to backend
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;
const logs = logger.exportAsJSON();

fetch('/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: logs
});
```

### Store Logs in File System

```javascript
// Node.js example
const fs = require('fs');
const logs = logger.exportAsJSON();
fs.writeFileSync('logs.json', logs);
```

## Command Reference

```javascript
// Get logger instance
const logger = ng.probe(document.querySelector('app-root')).componentInstance.logger;

// View
logger.getLogs()                          // All logs
logger.getLogsByLevel(LogLevel.ERROR)    // Filtered logs
logger.exportAsJSON()                    // JSON export
logger.exportAsCSV()                     // CSV export

// Download
logger.downloadLogs('json')              // Download as JSON
logger.downloadLogs('csv')               // Download as CSV

// Control
logger.logInfo(msg, data)                // Log info message
logger.logError(msg, error)              // Log error
logger.setLogLevel(LogLevel.DEBUG)       // Set min log level
logger.setConsoleOutput(true)            // Enable/disable console
logger.setLocalStorageEnabled(true)      // Enable/disable storage

// Analysis
logger.printSummary()                    // Print log statistics
logger.clearLogs()                       // Clear all logs
```

---

**Need more help?** Check the main [README.md](README.md) for application overview.
