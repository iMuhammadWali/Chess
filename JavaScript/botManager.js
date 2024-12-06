import { boardDimension, Chess } from "./globals.js";
import { GenerateMovesFromCurrentPosition } from "./movesManager.js";
import { MoveThePiece } from "./piecesManager.js";
import { gameBoard } from "./globals.js";
import { blackPieces, whitePieces } from "./globals.js";
import { AddNewThreats, InitializeThreatBoard, ResetCurrentPlayerThreats } from "./threatsManager.js";
import { threatBoard } from "./globals.js";
import { RemoveCapturedPieceFromPiecesArray } from './piecesManager.js';

import { GetAllPiecePositions, UpdateBoard } from './boardManager.js';
import { IsGameOver } from "./chessManager.js";

// I do believe that all the problems are fixed. However, If they are not, I will not run away from them and will fix them for sure.
async function MiniMax(depth, isMaximizingPlayer, alpha = -Infinity, beta = Infinity) {
    if (IsGameOver()){
        if (Chess.isBlack){
            console.log('White wins');
            return -Infinity;
        }
        else {
            console.log('White wins');
            return Infinity;
        }
    }
    if (depth == 0) {
        return EvaluateBoard();
    }
    let allMoves = GenerateMovesFromCurrentPosition();
    //console.log(allMoves);
    let bestEval = null;
    for (let move of allMoves) {
        const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
        const prevChessObject = JSON.parse(JSON.stringify(Chess));

        if (gameBoard[move.toRow][move.toCol] !== "") {
            if (gameBoard[move.toRow][move.toCol] === "bk"){
                return -Infinity;
            }
            if (gameBoard[move.toRow][move.toCol] === "wk"){
                return Infinity;
            }
            RemoveCapturedPieceFromPiecesArray(move.toRow, move.toCol);
        }
        
        await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol, true);
        console.log(move);
        
        
        Chess.isBlack = !Chess.isBlack;
        if (isMaximizingPlayer) bestEval = await MiniMax(depth - 1, !isMaximizingPlayer, alpha, -Infinity);
        else bestEval = await MiniMax(depth - 1, !isMaximizingPlayer, Infinity, beta);
        if (bestEval == Infinity || bestEval == -Infinity) console.log('the move is', move);
        Chess.isBlack = !Chess.isBlack;

        // Undo the changes.
        for (let i = 0; i < clonedBoard.length; i++) {
            for (let j = 0; j < clonedBoard[i].length; j++) {
                gameBoard[i][j] = clonedBoard[i][j];
            }
        }
        Object.assign(Chess, prevChessObject);
        GetAllPiecePositions();
        AddNewThreats('w');
        AddNewThreats('b');

        if (isMaximizingPlayer) {
            bestEval = Math.max(bestEval, bestEval);
            alpha = Math.max(alpha, bestEval);
        }
        else {
            bestEval = Math.min(bestEval, bestEval);
            beta = Math.min(beta, bestEval);
        }
        if (beta <= alpha) {
            break;
        }
    }
    return bestEval;
}
function EvaluateBoard() {
    // I need to take the postiion of the peices into account as well.

    let whiteScore = 0;
    let blackScore = 0;
    
    for (let i = 0; i < boardDimension; ++i) {
        for (let j = 0; j < boardDimension; ++j) {
            let score = 0;
            if (gameBoard[i][j] !== "") {
                let pieceType = gameBoard[i][j][1];
                if (pieceType === 'p') blackScore+= 1;
                else if (pieceType === 'r') blackScore+= 5;
                else if (pieceType === 'n') blackScore+= 3;
                else if (pieceType === 'b') blackScore+= 3;
                else if (pieceType === 'q') blackScore+= 9;
                else if (pieceType === 'k') blackScore+= 100;
            }
            if (gameBoard[i][j].startsWith('b')) {
                blackScore+= score;
            }
            else whiteScore+=score;
        }
    }
    return blackScore - whiteScore;
}
export default async function PlayTheBotMove() {

    let allMoves = GenerateMovesFromCurrentPosition();
    let alpha = -Infinity;
    let beta = Infinity;
    let currBestMove = {};
    let currEval = -100;
    let bestEval = -Infinity;
    for (let move of allMoves) {
        const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
        const prevChessObject = JSON.parse(JSON.stringify(Chess));
        await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol, true);

        Chess.isBlack = !Chess.isBlack;
        currEval = await MiniMax(3, false, alpha, beta);

        Chess.isBlack = !Chess.isBlack;

        for (let i = 0; i < clonedBoard.length; i++) {
            for (let j = 0; j < clonedBoard[i].length; j++) {
                gameBoard[i][j] = clonedBoard[i][j];
            }
        }
        Object.assign(Chess, prevChessObject);
        GetAllPiecePositions();
        AddNewThreats('w');
        AddNewThreats('b');
        console.log('CurrEval',currEval);
        console.log('bestEval',bestEval);

        if (currEval >= bestEval) {
            console.log('CurrEval',currEval);
            bestEval = currEval;
            currBestMove = JSON.parse(JSON.stringify(move));
        }
    }
    let prevRow = currBestMove.fromRow;
    let prevCol = currBestMove.fromCol;
    console.log(currBestMove);

    if (gameBoard[currBestMove.toRow][currBestMove.toCol] !== "") {
        RemoveCapturedPieceFromPiecesArray(currBestMove.toRow, currBestMove.toCol);
    }
    await MoveThePiece(currBestMove.piece, prevRow, prevCol, currBestMove.toRow, currBestMove.toCol, false, true);
    Chess.isBlack = !Chess.isBlack;
}