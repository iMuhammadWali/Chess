import {
    board, Chess, gameBoard, whitePieces, blackPieces,
    whiteCheckGivingPieces, blackCheckGivingPieces, ResetGameBoard, SetGameBoard
} from "./globals.js";
import { RemovePreviousMovingOptions, SelectAndDisplayMoves, moveDisplayingFunctions } from "./movesManager.js";
import { GetPuzzle, correctPuzzleMoves } from "./puzzleManager.js";
import { DrawGameBoard, UpdateBoard, GetAllPiecePositions, DrawPawnPromotionBox } from "./boardManager.js"
import { MoveThePiece } from "./piecesManager.js"
import { InitializeThreatBoard } from "./threatsManager.js"

const GameStates = {
    isMainMenu: true,
    isLocalGame: false,
    isPuzzleGame: false
}

const menuButtonSound = new Audio("/assets/highlight.ogg");
const backgroundMusic = new Audio("/assets/backgroundMusic.ogg");
const localPlayButton = document.getElementById('local-play');
const resumeButton = document.getElementById('resume');
const backButton = document.querySelector('.back-button');
const soundOnButton = document.querySelector('.sound-on');
const soundOffButton = document.querySelector('.sound-off');
console.log(backButton);
const puzzleButton = document.getElementById('puzzle');
const game = document.querySelector('.game');
const gameMenu = document.querySelector('.game-menu');

export const PlayedMoves = {
    fullMoveCount: 1,
    halfMoveCount: 0,
    fullMoves: ''
}
function IsGameOver() {

    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let RemainingMoveCount = 0;
    let isKingInCheck = Chess.isBlack ? Chess.isBlackKingInCheck : Chess.isWhiteKingInCheck;
    let checkGivingPieces = Chess.isBlack ? whiteCheckGivingPieces : blackCheckGivingPieces;

    for (let i = 0; i < pieces.length; i++) {
        let row = pieces[i].row;
        let col = pieces[i].col;

        let piece = gameBoard[row][col];
        console.log(piece, 'checking for remaining moves');
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
            console.log("There are moves left");
            return false;
        }
    }
    if (isKingInCheck) {
        Chess.isCheckmate = true;
    }
    else {
        Chess.isStalemate = true;
    }
    console.log("Game Over!");
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
async function HandleClickEvent(event) {

    const target = event.target.closest('div');
    let currRow = parseInt(target.dataset.row);
    let currCol = parseInt(target.dataset.col);

    console.log(`Clicked at row: ${currRow} and col: ${currCol}`);

    let piece = gameBoard[currRow][currCol];

    if (piece !== '' && piece !== 'validMove' && !piece.includes('capture')) {
        SelectAndDisplayMoves(piece, currRow, currCol);
    }
    else if (Chess.isPieceSelected && (piece.includes('validMove') || piece.includes('capture'))) {
        await MoveThePiece(Chess.selectedPiece, Chess.prevRow, Chess.prevCol, currRow, currCol);

        // if (GameStates.isLocalGame) {
        //     // Chess.isBlack = !Chess.isBlack;
        // } else {
        //     if (IsMoveCorrect()) {
        //         console.log("A Correct Move is Played"); //Convert it to Div
        //     }
        //     // Chess.isBlack = !Chess.isBlack;
        // }
        Chess.isBlack = !Chess.isBlack;
        if (IsGameOver()) {
            // if (Chess.isCheckmate) Edit and display the checkmate div
            // else Stalemate
            alert('Game is Over');
            console.log("CheckMate");
        };
        // Chess.isBlack = !Chess.isBlack;
    }
    UpdateBoard();
}
function RetriveGamePositionFromLocalStorage() {

    let gameBoardJSON = localStorage.getItem('gameBoard');
    SetGameBoard(JSON.parse(gameBoardJSON));
}
function DisplayMenu() {
    game.style.display = 'none';
    gameMenu.style.display = 'flex';
}
function StartLocalGame() {

    menuButtonSound.play();
    game.style.display = 'flex';
    gameMenu.style.display = 'none';
    GameStates.isLocalGame = true;

    board.addEventListener('click', HandleClickEvent);

    setTimeout(() => {
        DrawGameBoard();
    }, 50);
    InitializeThreatBoard();
    GetAllPiecePositions();
}
async function StartPuzzle() {

    menuButtonSound.play();
    GameStates.isPuzzleGame = true;
    game.style.display = 'flex';
    gameMenu.style.display = 'none';
    board.addEventListener('click', HandleClickEvent);

    InitializeThreatBoard();
    await GetPuzzle();
    DrawGameBoard();
    UpdateBoard();
}
function StartGame() {

    backgroundMusic.play();
    backgroundMusic.addEventListener('ended', function () {
        backgroundMusic.play();
    });

    // GameStates.isMainMenu = true;

    DisplayMenu();
    backButton.addEventListener('click', () => {
        localStorage.setItem('gameBoard', JSON.stringify(gameBoard));
        ResetGameBoard();
        menuButtonSound.play();
        DisplayMenu();
    });

    soundOnButton.addEventListener('click', () => {
        soundOnButton.style.display = 'none';
        soundOffButton.style.display = 'block';
        backgroundMusic.pause();
    })
    soundOffButton.addEventListener('click', () => {

        soundOffButton.style.display = 'none';
        soundOnButton.style.display = 'block';
        backgroundMusic.play();
    })

    localPlayButton.addEventListener('click', StartLocalGame);
    puzzleButton.addEventListener('click', StartPuzzle);
    resumeButton.addEventListener('click', () => {
        RetriveGamePositionFromLocalStorage();
        RemovePreviousMovingOptions();
        StartLocalGame();
    })
}

document.addEventListener("DOMContentLoaded", () => {
    StartGame();
});