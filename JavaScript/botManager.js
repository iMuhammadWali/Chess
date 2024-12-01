import { Chess } from "./globals.js";
import { GenerateMovesFromCurrentPosition } from "./movesManager.js";
import { MoveThePiece } from "./piecesManager.js";
import { gameBoard } from "./globals.js";
import { blackPieces, whitePieces } from "./globals.js";
import { AddNewThreats, InitializeThreatBoard } from "./threatsManager.js";
import { threatBoard } from "./globals.js";
import { RemoveCapturedPieceFromPiecesArray } from './piecesManager.js';
async function MiniMax(depth, isMaximizingPlayer, alpha, beta) {
    if (depth == 0) {
        return EvaluateBoard();
    }

    let allMoves = GenerateMovesFromCurrentPosition();
    let pieces = Chess.isBlack ? blackPieces : whitePieces;

    if (isMaximizingPlayer) {
        let bestValue = -Infinity;
        for (let move of allMoves) {
            const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
            const clonedPieces = JSON.parse(JSON.stringify(pieces));
            const clonedThreatBoard = JSON.parse(JSON.stringify(threatBoard));
            const clonedChess = JSON.parse(JSON.stringify(Chess));

            await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol);
            Chess.isBlack = !Chess.isBlack;

            let currentValue = await MiniMax(depth - 1, false, alpha, beta);
            Chess.isBlack = !Chess.isBlack;

            Object.assign(pieces, clonedPieces);
            for (let i = 0; i < clonedBoard.length; i++) {
                for (let j = 0; j < clonedBoard[i].length; j++) {
                    gameBoard[i][j] = clonedBoard[i][j];
                }
            }
            for (let i = 0; i < clonedThreatBoard.length; i++) {
                for (let j = 0; j < clonedThreatBoard[i].length; j++) {
                    threatBoard[i][j] = clonedThreatBoard[i][j];
                }
            }
            Object.assign(Chess, clonedChess);
            bestValue = Math.max(bestValue, currentValue);
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) break;
        }
        return bestValue;
    } else {
        let worstValue = Infinity;
        for (let move of allMoves) {
            const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
            const clonedPieces = JSON.parse(JSON.stringify(pieces));
            const clonedThreatBoard = JSON.parse(JSON.stringify(threatBoard));
            const clonedChess = JSON.parse(JSON.stringify(Chess));
            await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol);
            Chess.isBlack = !Chess.isBlack;

            let currentValue = await MiniMax(depth - 1, true, alpha, beta);
            Chess.isBlack = !Chess.isBlack;

            Object.assign(pieces, clonedPieces);
            for (let i = 0; i < clonedBoard.length; i++) {
                for (let j = 0; j < clonedBoard[i].length; j++) {
                    gameBoard[i][j] = clonedBoard[i][j];
                }
            }
            for (let i = 0; i < clonedThreatBoard.length; i++) {
                for (let j = 0; j < clonedThreatBoard[i].length; j++) {
                    threatBoard[i][j] = clonedThreatBoard[i][j];
                }
            }
            Object.assign(Chess, clonedChess);
            worstValue = Math.min(worstValue, currentValue);
            beta = Math.min(beta, worstValue);
            if (beta <= alpha) break;
        }
        return worstValue;
    }
}

function EvaluateBoard() {

    // Count the number of pieces on the board
    let whitePieces = 0;
    let blackPieces = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (gameBoard[i][j] != "") {
                if (gameBoard[i][j].charAt(0) == "w") {
                    whitePieces++;
                }
                else {
                    blackPieces++;
                }
            }
        }
    }
    if (whitePieces == 0) return Infinity;
    if (blackPieces == 0) return -Infinity;
    return blackPieces - whitePieces;
}
export default async function PlayTheBotMove(){
    let allMoves = GenerateMovesFromCurrentPosition();
    let bestMove = {}
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let bestVal = -Infinity;
    for (let move of allMoves) {
        const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
        const clonedPieces = JSON.parse(JSON.stringify(pieces));
        const clonedThreatBoard = JSON.parse(JSON.stringify(threatBoard));
        const clonedChess = JSON.parse(JSON.stringify(Chess));
        await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol);
        let miniMax = await MiniMax(1, true, -Infinity, Infinity);

        Object.assign(pieces, clonedPieces);
        for (let i = 0; i < clonedBoard.length; i++) {
            for (let j = 0; j < clonedBoard[i].length; j++) {
                gameBoard[i][j] = clonedBoard[i][j];
            }
        }
        for (let i = 0; i < clonedThreatBoard.length; i++) {
            for (let j = 0; j < clonedThreatBoard[i].length; j++) {
                threatBoard[i][j] = clonedThreatBoard[i][j];
            }
        }
        Object.assign(Chess, clonedChess);
        if (miniMax > bestVal) {
            bestVal = miniMax;
            bestMove = move;
        }
    }
    console.log(pieces);
    if (gameBoard[bestMove.toRow][bestMove.toCol] !== '') {
        RemoveCapturedPieceFromPiecesArray(bestMove.toRow, bestMove.toCol);
    }
    await MoveThePiece(bestMove.piece, bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
    InitializeThreatBoard();
    AddNewThreats(Chess.isBlack ? 'b' : 'w');
    console.log(pieces);
    let opponentPieces = Chess.isBlack ? whitePieces : blackPieces;
    Chess.isBlack = !Chess.isBlack;
    console.log(opponentPieces, 'is the opponent pieces');
}