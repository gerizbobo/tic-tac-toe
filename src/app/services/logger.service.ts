import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  stackTrace?: string;
}


@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  private logs: LogEntry[] = [];
  private currentLogLevel: LogLevel = LogLevel.DEBUG;
  private maxLogsInMemory: number = 1000;
  private storageKey = 'tic-tac-toe-logs';
  private enableConsoleOutput: boolean = true;
  private enableLocalStorage: boolean = true;

  constructor() {
    this.loadLogsFromStorage();
    this.logInfo('Logger Service Initialized');
  }

  public setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }


  public setConsoleOutput(enable: boolean): void {
    this.enableConsoleOutput = enable;
  }

  /**
   * Enable or disable localStorage persistence
   * 
   * @param enable - Whether to enable localStorage
   */
  public setLocalStorageEnabled(enable: boolean): void {
    this.enableLocalStorage = enable;
  }

  /**
   * Log a debug message
   * 
   * @param message - Message to log
   * @param data - Optional data to include
   */
  public logDebug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   * 
   * @param message - Message to log
   * @param data - Optional data to include
   */
  public logInfo(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   * 
   * @param message - Message to log
   * @param data - Optional data to include
   */
  public logWarn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   * 
   * @param message - Message to log
   * @param error - Optional error object or data
   */
  public logError(message: string, error?: any): void {
    const stackTrace = error?.stack || new Error().stack;
    this.log(LogLevel.ERROR, message, error, stackTrace);
  }

  /**
   * Log tournament initialization
   * 
   * @param player1Name - Player 1 name
   * @param player1Symbol - Player 1 symbol
   * @param player2Name - Player 2 name
   * @param totalGames - Total games in tournament
   */
  public logTournamentStart(
    player1Name: string,
    player1Symbol: string,
    player2Name: string,
    totalGames: number
  ): void {
    this.logInfo('Tournament Started', {
      player1: { name: player1Name, symbol: player1Symbol },
      player2: { name: player2Name, symbol: player1Symbol === 'X' ? 'O' : 'X' },
      totalGames: totalGames,
      format: `Best of ${totalGames}`
    });
  }

  /**
   * Log game initialization
   * 
   * @param gameNumber - The game number in the tournament
   * @param startingPlayer - The player starting this game
   */
  public logGameStart(gameNumber: number, startingPlayer: string): void {
    this.logInfo(`Game ${gameNumber} Started`, {
      gameNumber: gameNumber,
      startingPlayer: startingPlayer
    });
  }

  /**
   * Log a player move
   * 
   * @param playerName - Name of the player making the move
   * @param symbol - Symbol of the player (X or O)
   * @param cellIndex - Index of the cell where move was made (0-8)
   */
  public logMove(playerName: string, symbol: string, cellIndex: number): void {
    this.logDebug(`${playerName} (${symbol}) moved to cell ${cellIndex}`, {
      player: playerName,
      symbol: symbol,
      cellIndex: cellIndex
    });
  }

  /**
   * Log game result
   * 
   * @param gameNumber - The game number
   * @param result - 'win', 'draw', or player name
   * @param winner - Winner name if applicable
   */
  public logGameResult(gameNumber: number, result: string, winner?: string): void {
    if (result === 'draw') {
      this.logInfo(`Game ${gameNumber} Result: Draw`, { gameNumber, result });
    } else {
      this.logInfo(`Game ${gameNumber} Result: ${winner} Wins`, { gameNumber, result, winner });
    }
  }

  /**
   * Log tournament completion
   * 
   * @param winner - Tournament winner name, or null for draw
   * @param player1Wins - Player 1 wins count
   * @param player2Wins - Player 2 wins count
   * @param draws - Total draws count
   */
  public logTournamentEnd(
    winner: string | null,
    player1Wins: number,
    player2Wins: number,
    draws: number
  ): void {
    if (winner === null) {
      this.logInfo('Tournament Ended: Draw', {
        result: 'draw',
        player1Wins,
        player2Wins,
        draws
      });
    } else {
      this.logInfo(`Tournament Ended: ${winner} Wins`, {
        result: 'win',
        winner,
        player1Wins,
        player2Wins,
        draws
      });
    }
  }

  /**
   * Get all logs
   * 
   * @returns Array of all log entries
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   * 
   * @param level - The log level to filter by
   * @returns Array of log entries at the specified level
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
    this.clearStoredLogs();
    this.logInfo('Logs Cleared');
  }

  /**
   * Export logs as JSON
   * 
   * @returns JSON string of logs
   */
  public exportAsJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs as CSV
   * 
   * @returns CSV string of logs
   */
  public exportAsCSV(): string {
    const headers = ['Timestamp', 'Level', 'Message', 'Data'];
    const rows = this.logs.map(log => [
      log.timestamp.toISOString(),
      LogLevel[log.level],
      log.message,
      JSON.stringify(log.data || '')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Download logs as a file
   * 
   * @param format - 'json' or 'csv'
   */
  public downloadLogs(format: 'json' | 'csv' = 'json'): void {
    const content = format === 'json' ? this.exportAsJSON() : this.exportAsCSV();
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const extension = format === 'json' ? 'json' : 'csv';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tic-tac-toe-logs-${new Date().getTime()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);

    this.logInfo(`Logs downloaded as ${extension.toUpperCase()}`, { format, size: blob.size });
  }

  /**
   * Print summary of logs to console
   */
  public printSummary(): void {
    const summary = {
      totalLogs: this.logs.length,
      debug: this.logs.filter(l => l.level === LogLevel.DEBUG).length,
      info: this.logs.filter(l => l.level === LogLevel.INFO).length,
      warn: this.logs.filter(l => l.level === LogLevel.WARN).length,
      error: this.logs.filter(l => l.level === LogLevel.ERROR).length,
      timeRange: this.logs.length > 0 ? {
        start: this.logs[0].timestamp,
        end: this.logs[this.logs.length - 1].timestamp
      } : null
    };

    console.group('%cLog Summary', 'color: #667eea; font-weight: bold; font-size: 14px');
    console.table(summary);
    console.groupEnd();
  }

  /**
   * Internal logging method
   * 
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional data
   * @param stackTrace - Optional stack trace
   */
  private log(level: LogLevel, message: string, data?: any, stackTrace?: string): void {
    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      stackTrace
    };

    // Add to in-memory storage
    this.logs.push(entry);

    // Keep only recent logs if exceeding limit
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs = this.logs.slice(-this.maxLogsInMemory);
    }

    // Persist to localStorage
    if (this.enableLocalStorage) {
      this.persistLogsToStorage();
    }

    // Output to console if enabled and level is sufficient
    if (this.enableConsoleOutput && level >= this.currentLogLevel) {
      this.logToConsole(entry);
    }
  }

  /**
   * Output log entry to browser console with formatting
   * 
   * @param entry - Log entry to output
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const levelName = LogLevel[entry.level];
    const style = this.getConsoleStyle(entry.level);

    const prefix = `%c[${timestamp}] ${levelName}`;
    const args = [prefix, style, entry.message];

    if (entry.data) {
      args.push(entry.data);
    }

    if (entry.stackTrace) {
      args.push(entry.stackTrace);
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        break;
    }
  }

  /**
   * Get CSS style for console output based on log level
   * 
   * @param level - Log level
   * @returns CSS style string
   */
  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #999; font-weight: normal;';
      case LogLevel.INFO:
        return 'color: #667eea; font-weight: bold;';
      case LogLevel.WARN:
        return 'color: #f0a500; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #f5576c; font-weight: bold;';
      default:
        return 'color: #333;';
    }
  }

  /**
   * Persist logs to localStorage
   */
  private persistLogsToStorage(): void {
    try {
      const logsToStore = this.logs.slice(-100); // Store last 100 logs
      localStorage.setItem(this.storageKey, JSON.stringify(logsToStore));
    } catch (e) {
      console.error('Failed to persist logs to localStorage', e);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        this.logs = parsed.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (e) {
      console.error('Failed to load logs from localStorage', e);
    }
  }

  /**
   * Clear logs from localStorage
   */
  private clearStoredLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.error('Failed to clear stored logs', e);
    }
  }
}
