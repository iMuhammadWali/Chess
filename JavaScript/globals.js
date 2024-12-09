// export const initialGameBoard = [
//     ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"], 
//     ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
//     ["", "", "", "", "", "", "", ""],
//     ["", "", "", "", "", "", "", ""],
//     ["", "", "", "", "", "", "", ""],
//     ["", "", "", "", "", "", "", ""],
//     ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
//     ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
// ];
export const initialGameBoard = [
    ["wq",        "",     "",         "",         "",     "",     "",         ""], 
    ["",      "",     "",       "",         "",     "",     "",         ""],
    ["",        "",     "",         "",         "",     "",     "bp",       "bk"],
    ["",        "",     "",         "",         "wq",   "",     "",       ""],
    ["",        "",     "wb",       "",         "",     "",     "",         ""],
    ["",        "",     "",       "",           "wp",   "wp",   "",       ""],
    ["",        "",     "",         "",         "",     "",     "",     "wp"],
    ["",        "",     "wk",       "",         "",     "",     "",   ""]
];

export let gameBoard = initialGameBoard.map(row => [...row]);
// export let gameBoard = [...initialGameBoard];
export function ResetGameBoard() {
    // Reset gameBoard to a deep copy of initialGameBoard
    gameBoard = initialGameBoard.map(row => [...row]);
}

export const board = document.querySelector('.chessBoard');
export const pawnBox = document.querySelector('.pawn-promotion');
export const boardDimension = 8;

export const threatBoard = [];

export const whitePieces = [];
export const blackPieces = [];

export let whiteCheckGivingPieces = [];
export let blackCheckGivingPieces = [];

export const bishopMoves = [
    { row: 1, col: 1 },
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
];
export const rookMoves = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
];
export const knightMoves = [
    { row: 2, col: 1 },
    { row: 1, col: 2 },
    { row: -1, col: 2 },
    { row: -2, col: 1 },
    { row: -2, col: -1 },
    { row: -1, col: -2 },
    { row: 1, col: -2 },
    { row: 2, col: -1 }
];
export const kingMoves = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 1, col: 1 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: -1, col: -1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 }
];
export function ResetChess() {
    Chess.isBlack = false;
    Chess.selectedPiece = '';
    Chess.isPieceSelected = false;
    Chess.prevRow = 10;
    Chess.prevCol = 10;
    Chess.isWhiteKingInCheck = false;
    Chess.isBlackKingInCheck = false;
    Chess.hasWhiteKingMoved = false;
    Chess.hasBlackKingMoved = false;
    Chess.isCheckmate = false;
    Chess.isStalemate = false;
    whiteCheckGivingPieces = [];
    blackCheckGivingPieces = [];
}
export const Chess = {
    isBlack: false,
    selectedPiece: '',
    isPieceSelected: false,
    prevRow: 10,
    prevCol: 10,
    isWhiteKingInCheck: false,
    isBlackKingInCheck: false,
    hasWhiteKingMoved: false,
    hasBlackKingMoved: false,
    isCheckmate: false,
    isStalemate: false
}
export let lastMoves = [];
// Moved from Green to Green #B9CA43
// Moved from White = #F5F682