import {
    board, Chess, gameBoard, whitePieces, blackPieces,
    whiteCheckGivingPieces, blackCheckGivingPieces, ResetGameBoard,
    ResetChess,
    boardDimension,
    threatBoard,
    lastMoves
} from "./globals.js";
import { GenerateMovesFromCurrentPosition, RemovePreviousMovingOptions, SelectAndDisplayMoves, moveDisplayingFunctions } from "./movesManager.js";
import { EmptyGameBoard, GetPuzzle, ParseFEN, correctPuzzleMoves } from "./puzzleManager.js";
import { DrawGameBoard, UpdateBoard, GetAllPiecePositions, DrawPawnPromotionBox } from "./boardManager.js"
import { MoveThePiece, UndoTheMove } from "./piecesManager.js"
import { AddNewThreats, InitializeThreatBoard } from "./threatsManager.js"
import  PlayTheBotMove from "./botManager.js";

// 1 - Menu
// 2 - Local Game
// 3 - Resume Game
// 4 - Puzzle
// 5 - Bot

let GameStates = 1;

const menuButtonSound = new Audio("/assets/highlight.ogg");
const backgroundMusic = new Audio("/assets/backgroundMusic.ogg");
const localPlayButton = document.getElementById('local-play');
const resumeButton = document.getElementById('resume');
const puzzleButton = document.getElementById('puzzle');
const botButton = document.getElementById('bot');

const backButton = document.querySelector('.back-button');
const soundOnButton = document.querySelector('.sound-on');
const soundOffButton = document.querySelector('.sound-off');
const game = document.querySelector('.game');
const gameMenu = document.querySelector('.game-menu');
const turnText = document.querySelector('.turn');
export const PlayedMoves = {
    fullMoveCount: 1,
    halfMoveCount: 0,
    fullMoves: ''
}
export function IsGameOver() {
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let RemainingMoveCount = 0;
    let isKingInCheck = Chess.isBlack ? Chess.isBlackKingInCheck : Chess.isWhiteKingInCheck;
    let checkGivingPieces = Chess.isBlack ? whiteCheckGivingPieces : blackCheckGivingPieces;

    for (let i = 0; i < pieces.length; i++) {
        let row = pieces[i].row;
        let col = pieces[i].col;

        let piece = gameBoard[row][col];
        //console.log(piece, 'checking for remaining moves');
        if (checkGivingPieces.length > 1) {
            //Check for only King moves
            if (piece[1] === 'k')
                RemainingMoveCount = moveDisplayingFunctions[piece[1]](row, col, true);
            //else if any other piece, do nothing

        } else { //If Check giving pieces are less than 2, then check for all pieces' movements
            RemainingMoveCount = moveDisplayingFunctions[piece[1]](row, col, true);
        }
        if (RemainingMoveCount > 0) {
            //There are moves left and hence it is not checkmate
            return false;
        }
    }
    if (isKingInCheck) {
        Chess.isCheckmate = true;
    }
    else {
        Chess.isStalemate = true;
    }
    return true;
}
function IsMoveCorrect() {
    return (correctPuzzleMoves.startsWith(PlayedMoves.fullMoves.trim()))
}
function PlayPuzzleMove() {
    //Find the piece in the gameBoard
    //Find the nextRow and nextCol
    //Find if if that piece can move to that place
    //If it can, move it there
}
export function DrawTurnName() {
    if (Chess.isBlack) {

        turnText.textContent = "Black's Turn";
        turnText.style.color = 'black';
    }
    else {
        turnText.style.color = 'white';
        turnText.textContent = "White's Turn";
    }
}
async function sleep() {
    return new Promise(resolve => setTimeout(resolve, 10));
}

async function PlayNextMoves(depth = 2) {
    if (depth === 0) return;

    let allMoves = GenerateMovesFromCurrentPosition();
    for (let move of allMoves) {
        const clonedBoard = JSON.parse(JSON.stringify(gameBoard));
        //const clonedPieces = JSON.parse(JSON.stringify(pieces));

        await MoveThePiece(move.piece, move.fromRow, move.fromCol, move.toRow, move.toCol);
        console.log(move);

        Chess.isBlack = !Chess.isBlack; 
        UpdateBoard(); 
        await PlayNextMoves(depth - 1);
        Chess.isBlack = !Chess.isBlack; 

        await sleep();

        for (let i = 0; i < clonedBoard.length; i++) {
            for (let j = 0; j < clonedBoard[i].length; j++) {
                gameBoard[i][j] = clonedBoard[i][j];
            }
        }
        GetAllPiecePositions();
        AddNewThreats('w');
        AddNewThreats('b');

        UpdateBoard();
        await sleep();
    }
}

async function HandleClickEvent(event) {

    const target = event.target.closest('div');
    let currRow = parseInt(target.dataset.row);
    let currCol = parseInt(target.dataset.col);

    let piece = gameBoard[currRow][currCol];

    if (piece !== '' && piece !== 'validMove' && !piece.includes('capture')) {
        SelectAndDisplayMoves(piece, currRow, currCol);
    }
    else if (Chess.isPieceSelected && (piece.includes('validMove') || piece.includes('capture'))) {

        await MoveThePiece(Chess.selectedPiece, Chess.prevRow, Chess.prevCol, currRow, currCol);
        Chess.isBlack = !Chess.isBlack;
        if (IsGameOver()) {
            alert('Game is Over');
            // return;
        };
        if (GameStates === 5){
            UpdateBoard();
            await sleep();
            await PlayTheBotMove();
            DrawTurnName();
        }
        else if (GameStates === 4) {
            // This is the puzzle mode
        }
    }
    UpdateBoard();
}
function RetriveGamePositionFromLocalStorage() {
    let FEN_JSON = localStorage.getItem('FEN');
    if (!FEN_JSON) {
        ResetGameBoard();
        return;
    }
    ParseFEN(FEN_JSON);
    console.log(gameBoard);
}
function DisplayMenu() {
    game.style.display = 'none';
    gameMenu.style.display = 'flex';
}
function InitGame() {
    DrawTurnName();
    menuButtonSound.play();
    game.style.display = 'flex';
    gameMenu.style.display = 'none';
    backgroundMusic.addEventListener('ended', function () {
        backgroundMusic.play();
    });
    board.addEventListener('click', HandleClickEvent);
}
function MakeFen() {
    let fen = '';

    for (let rank = 0; rank < boardDimension; rank++) {
        let emptySquares = 0;

        for (let file = 0; file < boardDimension; file++) {
            const piece = gameBoard[rank][file];

            if (piece === '') {
                emptySquares++;
            }
            else {
                if (emptySquares > 0) {
                    fen += emptySquares;
                    emptySquares = 0;
                }
                fen += (piece[0] === 'w' ? piece[1].toUpperCase() : piece[1].toLowerCase());
            }
        }
        if (emptySquares > 0) {
            fen += emptySquares;
        }
        if (rank < 7) {
            fen += '/';
        }
    }
    fen += ` ${Chess.isBlack ? 'b' : 'w'}`;

    return fen;
}
function StartLocalGame() {
    InitGame();
    if (GameStates!==3) {
        ResetChess();
        ResetGameBoard();
        InitializeThreatBoard();
    }

    setTimeout(() => {
        DrawGameBoard();
    }, 50);

    GetAllPiecePositions();
}
async function StartPuzzle() {
    InitGame();
    GameStates = 4;

    InitializeThreatBoard();
    await GetPuzzle();
    AddOpponentThreatsOnTheCurrentBoard();
    DrawGameBoard();
    UpdateBoard();
    DrawTurnName();
    console.log(gameBoard);
}
const AddOpponentThreatsOnTheCurrentBoard = () => {
    Chess.isBlack = !Chess.isBlack;
    let opponent = Chess.isBlack ? 'b' : 'w';
    AddNewThreats(opponent);
    Chess.isBlack = !Chess.isBlack;
    AddNewThreats(Chess.isBlack ? 'b' : 'w');
}
function ResumeGame() {
    GameStates = 3;
    RemovePreviousMovingOptions();
    EmptyGameBoard();
    InitializeThreatBoard();
    
    RetriveGamePositionFromLocalStorage();

    GetAllPiecePositions();
    AddOpponentThreatsOnTheCurrentBoard();
    StartLocalGame();
}
function StartGame() {
    GameStates = 1;
    DisplayMenu();
    backButton.addEventListener('click', () => {
        SaveGameInLocalStorage();
        menuButtonSound.play();
        backgroundMusic.pause();
        DisplayMenu();
        ResetChess();
    });
    soundOnButton.addEventListener('click', () => {
        soundOnButton.style.display = 'none';
        soundOffButton.style.display = 'block';
        backgroundMusic.pause();
    });
    soundOffButton.addEventListener('click', () => {
        soundOffButton.style.display = 'none';
        soundOnButton.style.display = 'block';
        backgroundMusic.play();
    });
    localPlayButton.addEventListener('click', () => {
        GameStates = 2;
        StartLocalGame();
    });
    puzzleButton.addEventListener('click', StartPuzzle);
    resumeButton.addEventListener('click', ResumeGame);
    botButton.addEventListener('click', () => {
        GameStates = 5;
        StartLocalGame();
    });
}
function SaveGameInLocalStorage() {
    console.log(gameBoard);
    RemovePreviousMovingOptions();
    let FEN = MakeFen();
    console.log(FEN);
    localStorage.setItem('FEN', JSON.stringify(FEN));
}
window.addEventListener('beforeunload', () => {
        SaveGameInLocalStorage();
    }
);
document.addEventListener("DOMContentLoaded", StartGame());