import { lastMoves } from "./globals";
import { MoveThePiece } from "./piecesManager";

const MiniMax = (row, col, depth, isMaximixingPlayer, alpha, beta) => {
    if (depth == 0){
        return evaluteBoard(row, col);
    }
    if (isMaximixingPlayer){
        // possibleMovesFromCurrentPosition

        // The only thing left is this part.....GenerateMovesFromCurrentPosition
        // Pass a bool to the MoveThePiece() function.

        let allMoves = GenerateMovesFromCurrentPosition();
        let bestMove = -Infinity;
        for (let move of allMoves){
            MoveThePiece(...move);
            //bestMove = Math.max(bestMove, Minimax(move.row, move.col, depth - 1, !isMaximixingPlayer, alpha, beta));
            //beta = bestMove;
            UndoMove(...lastMoves.pop());
            if (beta <= alpha) break;
        }
        return bestMove;
    }
    else {
        // possibleMovesFromCurrentPosition
        // Each move should have selectedPiece, prevRow, prevCol, currRow, currCol to make the move. 
        // I dont need to update the fullMoves string while simulating.
        // I have to make a reverse of the move after simulating it and that is the exact opposite of the MoveThePiece
        // Also, I dont need to make the done Moves array because at any point, I have the move played.
        
        // The problem is that the generateMoves will give valid moves only when the threat board and stuff is working correctly. I also need to reverse the castle as well.
        // So,
        // The easiest thing is use the system stack create a new 2D array each time of the board and call the functions that are done when the resume game is called instead of all the complicated stuff


        const moves = generateMovesFromCurrentPosition(GetPieceAtPosition(Chess.pieces, row, col), row, col);
        let worstMove = +Infinity;
        for (let move of moves){
            MoveThePiece(move);
            worstMove = Math.min(worstMove, Minimax(move.row, move.col, depth - 1, !isMaximixingPlayer, alpha, beta));
            alpha = worstMove;
            UndoMove(move);
            if (beta >= alpha) break;
        }
        return worstMove;
    }
}
// Move is an object containing 
// 1 - Can be played by. (piece) 
// 2 - Row of that piece.
// 2 - Col of that piece.