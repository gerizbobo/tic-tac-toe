import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, BoardCell, WINNING_COMBINATIONS } from '../models/game.model';
import { LoggerService } from './logger.service';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  private gameStateSubject = new BehaviorSubject<GameState>(this.createInitialGameState());
  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  constructor(private logger: LoggerService) { }

 
  private createInitialGameState(): GameState {
    return {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isDraw: false,
      isGameOver: false,
      moveCount: 0
    };
  }


  public initializeNewGame(startingPlayer: 'X' | 'O' = 'X'): void {
    const newState = this.createInitialGameState();
    newState.currentPlayer = startingPlayer;
    this.gameStateSubject.next(newState);
  }


  public getCurrentGameState(): GameState {
    return this.gameStateSubject.getValue();
  }

  public makeMove(cellIndex: number): boolean {
    const currentState = this.gameStateSubject.getValue();


    if (currentState.isGameOver) {
      return false;
    }

    if (cellIndex < 0 || cellIndex > 8) {
      return false;
    }

    if (currentState.board[cellIndex] !== null) {
      return false;
    }

    const newBoard = [...currentState.board];
    newBoard[cellIndex] = currentState.currentPlayer;


    const winner = this.checkForWinner(newBoard);
    

    const moveCount = currentState.moveCount + 1;
    const isDraw = moveCount === 9 && !winner;


    const nextPlayer = currentState.currentPlayer === 'X' ? 'O' : 'X';

    const newGameState: GameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winner,
      isDraw: isDraw,
      isGameOver: winner !== null || isDraw,
      moveCount: moveCount
    };

    this.gameStateSubject.next(newGameState);
    
    // Log the move
    this.logger.logMove(`Player ${currentState.currentPlayer}`, currentState.currentPlayer, cellIndex);
    
    return true;
  }


  private checkForWinner(board: BoardCell[]): 'X' | 'O' | null {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as 'X' | 'O';
      }
    }
    return null;
  }


  public resetGame(): void {
    this.gameStateSubject.next(this.createInitialGameState());
  }


  public getGameState(): GameState {
    return this.gameStateSubject.getValue();
  }
}
