import { lastMoves } from "./globals";
import { MoveThePiece } from "./piecesManager";

const MiniMax = (row, col, depth, isMaximixingPlayer, alpha, beta) => {
    if (depth == 0){
        return evaluteBoard(row, col);
    }
    if (isMaximixingPlayer){

        let allMoves = GenerateMovesFromCurrentPosition();
        let bestMove = -Infinity;
        for (let move of allMoves){
            MoveThePiece(...move);
            bestMove = Math.max(bestMove, Minimax(move.row, move.col, depth - 1, !isMaximixingPlayer, alpha, beta));
            beta = bestMove;
            UndoMove(...lastMoves.pop());
            if (beta <= alpha) break;
        }
        return bestMove;
    }
    else {

        const moves = generateMovesFromCurrentPosition();
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