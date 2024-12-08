import { boardDimension, Chess, whitePieces, blackPieces } from "./globals.js";
import { GenerateMovesFromCurrentPosition, moveDisplayingFunctions } from "./movesManager.js";
import { MoveThePiece } from "./piecesManager.js";
import { gameBoard } from "./globals.js";
import { AddNewThreats } from "./threatsManager.js";

import { GetAllPiecePositions } from './boardManager.js';
import { IsGameOver } from "./chessManager.js";

// I do believe that all the problems are fixed. However, If they are not, I will not run away from them and will fix them for sure.
async function MiniMax(depth, isMaximizingPlayer, alpha = -Infinity, beta = Infinity) {
    if (IsGameOver()) {
        if (Chess.isBlack) {
            return -Infinity;
        }
        else {
            return Infinity;
        }
    }
    if (depth == 0) {
        const evalValue = EvaluateBoard();
        // console.log('gameBoard', gameBoard);
        return evalValue;
    }
    let allMoves = GenerateMovesFromCurrentPosition();
    //console.log(allMoves);
    let bestEval = isMaximizingPlayer ? -Infinity : Infinity;

    for (let move of allMoves) {
        const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
        const prevChessObject = JSON.parse(JSON.stringify(Chess));

        await MoveThePiece(move.piece,  move.fromRow, move.fromCol, move.toRow, move.toCol, true);

        Chess.isBlack = !Chess.isBlack;
        const currEval = await MiniMax(depth - 1, !isMaximizingPlayer, alpha, beta);

        Chess.isBlack = !Chess.isBlack;

        // Undo the changes.
        for (let i = 0; i < clonedBoard.length; i++) {
            for (let j = 0; j < clonedBoard[i].length; j++) {
                gameBoard[i][j] = clonedBoard[i][j];
            }
        }
        Object.assign(Chess, prevChessObject);
        GetAllPiecePositions();
        AddNewThreats(Chess.isBlack ? 'b' : 'w');
        Chess.isBlack = !Chess.isBlack;
        AddNewThreats(Chess.isBlack ? 'b' : 'w');
        Chess.isBlack = !Chess.isBlack;

        if (isMaximizingPlayer) {
            bestEval = Math.max(bestEval, currEval);
            alpha = Math.max(alpha, bestEval);
        }
        else {
            bestEval = Math.min(bestEval, currEval);
            beta = Math.min(beta, bestEval);
        }
        if (beta <= alpha) {
            break;
        }
    }
    return bestEval;
}
function EvaluateBoard() {
    const pieceValues = {
        p: 1,
        n: 3,
        b: 3.3,
        r: 5,
        q: 9,
        k: 1000
    };

    const positionalValues = {
        p: [ 
            [0, 0, 0, 0, 0, 0, 0, 0],
            [5, 5, 5, 5, 5, 5, 5, 5],
            [1, 1, 2, 3, 3, 2, 1, 1],
            [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
            [0, 0, 0, 2, 2, 0, 0, 0],
            [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
            [0.5, 1, 1, -2, -2, 1, 1, 0.5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        n: [ 
            [-5, -4, -3, -3, -3, -3, -4, -5],
            [-4, -2, 0, 0, 0, 0, -2, -4],
            [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
            [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
            [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
            [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
            [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
            [-5, -4, -3, -3, -3, -3, -4, -5]
        ],
        b: [ 
            [-2, -1, -1, -1, -1, -1, -1, -2],
            [-1, 0, 0, 0, 0, 0, 0, -1],
            [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
            [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
            [-1, 0, 1, 1, 1, 1, 0, -1],
            [-1, 1, 1, 1, 1, 1, 1, -1],
            [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
            [-2, -1, -1, -1, -1, -1, -1, -2]
        ],
        r: [ 
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0.5, 1, 1, 1, 1, 1, 1, 0.5],
            [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
            [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
            [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
            [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
            [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
            [0, 0, 0, 0.5, 0.5, 0, 0, 0]
        ],
        q: [
            [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
            [-1, 0, 0, 0, 0, 0, 0, -1],
            [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
            [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
            [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
            [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
            [-1, 0, 0.5, 0, 0, 0, 0, -1],
            [-2, -1, -1, -0.5, -0.5, -1, -1, -2]
        ],
        k: [
            [2, 3, 1, 0, 0, 1, 3, 2],
            [2, 2, 0, 0, 0, 0, 2, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [2, 2, 0, 0, 0, 0, 2, 2],
            [2, 3, 1, 0, 0, 1, 3, 2]
        ]
    };
    const boardSize = boardDimension;
    let whiteScore = 0;
    let blackScore = 0;

    for (let i = 0; i < boardSize; ++i) {
        for (let j = 0; j < boardSize; ++j) {
            const square = gameBoard[i][j];
            if (square !== "") {
                const pieceType = square[1].toLowerCase();
                const isBlack = square.startsWith('b');
                const baseValue = pieceValues[pieceType] || 0;
                const positionalValue = 
                    positionalValues[pieceType]?.[isBlack ? 7 - i : i]?.[j] || 0;
                const score = baseValue + positionalValue;

                if (isBlack) blackScore += score;
                else whiteScore += score;
            }
        }
    }
    let remainingMoveCount = 0;
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    for (let piece of pieces) {
        const row = piece.row;
        const col = piece.col;
        const pieceType = gameBoard[row][col][1];
        remainingMoveCount += moveDisplayingFunctions[pieceType](row, col, true);
    }
    const mobilityBonus = 0.1 *(remainingMoveCount || 1);
    if (Chess.isBlack) {
        blackScore += mobilityBonus;
    } else {
        whiteScore += mobilityBonus;
    }
    return blackScore - whiteScore;
}

export default async function PlayTheBotMove() {

    let allMoves = GenerateMovesFromCurrentPosition();
    let alpha = -Infinity;
    let beta = Infinity;
    let bestMove = {};
    let bestEval = -Infinity;
    for (let move of allMoves) {
        const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
        const prevChessObject = JSON.parse(JSON.stringify(Chess));
        await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol, true);

        Chess.isBlack = !Chess.isBlack;
        const currEval = await MiniMax(3, false, alpha, beta);

        Chess.isBlack = !Chess.isBlack;

        for (let i = 0; i < clonedBoard.length; i++) {
            for (let j = 0; j < clonedBoard[i].length; j++) {
                gameBoard[i][j] = clonedBoard[i][j];
            }
        }
        Object.assign(Chess, prevChessObject);
        GetAllPiecePositions();
        AddNewThreats(Chess.isBlack ? 'b' : 'w');
        Chess.isBlack = !Chess.isBlack;
        AddNewThreats(Chess.isBlack ? 'b' : 'w');
        Chess.isBlack = !Chess.isBlack;

        console.log('CurrEval', currEval);
        console.log('Best Eval', bestEval);
        if (currEval > bestEval) {
            console.log('CurrEval', currEval);
            bestEval = currEval;
            bestMove = move;
        }
    }
    console.log('Best Eval', bestEval);
    if (bestMove) {
        await MoveThePiece(
            bestMove.piece,
            bestMove.fromRow,
            bestMove.fromCol,
            bestMove.toRow,
            bestMove.toCol,
            false,
            true
        );
        Chess.isBlack = !Chess.isBlack;
    }
}