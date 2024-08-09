import {
    Chess, gameBoard, boardDimension, threatBoard, whitePieces, blackPieces,
    bishopMoves, rookMoves, knightMoves, kingMoves, blackCheckGivingPieces, whiteCheckGivingPieces, lastMove
} from "./globals.js";
import { PlayedMoves } from "./chessManager.js";
//----------------------------[Helper Functions for Displaying a move]---------------------------------------//
const IsSquareSafeForKing = (currRow, currCol) => {
    if (Chess.isBlack && threatBoard[currRow][currCol].white) {
        return false;
    }
    else if (!Chess.isBlack && threatBoard[currRow][currCol].black)
        return false;

    return true;
}
const CanPreventCheck = (currRow, currCol) => {
    if (Chess.isBlack) {
        return (threatBoard[currRow][currCol].whiteCheck);
    }
    else if (!Chess.isBlack) {
        return (threatBoard[currRow][currCol].blackCheck);
    }
}
const GetPieceAtPosition = (pieces, currRow, currCol) => {
    return pieces.find(piece => piece.row === currRow && piece.col === currCol);
}
const IsKingInCheck = () => {
    return (Chess.isBlackKingInCheck || Chess.isWhiteKingInCheck);
}
const IsMoveValid = (piece, i, j) => {
    return gameBoard[i][j] === '' &&
        (IsKingInCheck() ? CanPreventCheck(i, j) : true) &&
        (piece.isPinned ? CanMoveInThePinnedPath(piece, i, j) : true);
}
const IsCaptureValid = (piece, i, j, opponent) => {
    return gameBoard[i][j][0] === opponent &&
        (IsKingInCheck() ? CanPreventCheck(i, j) : true) &&
        (piece.isPinned ? CanMoveInThePinnedPath(piece, i, j) : true);
}
const CanMoveInThePinnedPath = (piece, currRow, currCol) => {
    for (let move of piece.pinPath) {
        if (move.row === currRow && move.col === currCol) return true;
    }
    return false;
}
//----------------------------[Actual Functions for Displaying a move]---------------------------------------//
//Although this function can be written in a lot better and concise way, I am not changing it because this is what i initially thought off
const DisplayPawnMovingOptions = (currRow, currCol, isCountingMoves = false) => {

    let pieces = Chess.isBlack ? blackPieces : whitePieces;

    let pawn = pieces.find(piece => piece.row === currRow && piece.col === currCol);

    let isKingInCheck = false;
    if (Chess.isBlackKingInCheck || Chess.isWhiteKingInCheck) {
        isKingInCheck = true;
    }

    if (Chess.isBlack) {
        if (currRow == 1) {
            if (gameBoard[currRow + 2][currCol] === "" && gameBoard[currRow + 1][currCol] === "" &&
                (isKingInCheck ? CanPreventCheck(currRow + 2, currCol) : true) &&
                (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 2, currCol) : true)) {

                if (!isCountingMoves) gameBoard[currRow + 2][currCol] = "validMove";
                else return 1;
            }
        }
        if (gameBoard[currRow + 1][currCol] === "" &&
            (isKingInCheck ? CanPreventCheck(currRow + 1, currCol) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 1, currCol) : true)) {

            if (!isCountingMoves) gameBoard[currRow + 1][currCol] = 'validMove';
            else return 1;
        }
        if (currCol < boardDimension - 1 && gameBoard[currRow + 1][currCol + 1].includes('w') &&
            (isKingInCheck ? CanPreventCheck(currRow + 1, currCol + 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 1, currCol + 1) : true)) {

            if (!isCountingMoves)
                gameBoard[currRow + 1][currCol + 1] = `capture:${gameBoard[currRow + 1][currCol + 1]}`;
            else return 1;
        }
        if (currCol - 1 > 0 && gameBoard[currRow + 1][currCol - 1].includes('w') &&
            (isKingInCheck ? CanPreventCheck(currRow + 1, currCol - 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 1, currCol - 1) : true)) {

            if (!isCountingMoves)
                gameBoard[currRow + 1][currCol - 1] = `capture:${gameBoard[currRow + 1][currCol - 1]}`;
            else return 1;
        }
    } else if (!Chess.isBlack) {

        if (currRow == 6) {
            if (gameBoard[currRow - 2][currCol] == "" && gameBoard[currRow - 1][currCol] === "" &&
                (isKingInCheck ? CanPreventCheck(currRow - 2, currCol) : true) &&
                (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 2, currCol) : true)) {

                if (!isCountingMoves) gameBoard[currRow - 2][currCol] = "validMove";
                else return 1;
            }
        }
        if (gameBoard[currRow - 1][currCol] == "" &&
            (isKingInCheck ? CanPreventCheck(currRow - 1, currCol) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 1, currCol) : true)) {

            if (!isCountingMoves) gameBoard[currRow - 1][currCol] = "validMove";
            else return 1;
        }
        if (currCol + 1 < boardDimension && gameBoard[currRow - 1][currCol + 1].includes('b') &&
            (isKingInCheck ? CanPreventCheck(currRow - 1, currCol + 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 1, currCol + 1) : true)) {
            if (!isCountingMoves)
                gameBoard[currRow - 1][currCol + 1] = `capture:${gameBoard[currRow - 1][currCol + 1]}`;
            else return 1;
        }
        if (currCol - 1 > 0 && gameBoard[currRow - 1][currCol - 1].includes('b') &&
            (isKingInCheck ? CanPreventCheck(currRow - 1, currCol - 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 1, currCol - 1) : true)) {
            if (!isCountingMoves)
                gameBoard[currRow - 1][currCol - 1] = `capture:${gameBoard[currRow - 1][currCol - 1]}`;
            else return 1;
        }
    }
    if (isCountingMoves) return 0;
}
// Used only for Bishop and Rook because only both of them can move in the pinned path
const DisplayPieceMoves = (piece, moves, currRow, currCol, isCountingMoves, opponent) => {
    for (let move of moves) {
        let row = move.row;
        let col = move.col;

        for (let i = currRow + row, j = currCol + col;
            i >= 0 && i < boardDimension && j < boardDimension && j >= 0;) {

            if (IsMoveValid(piece, i, j)) {
                if (!isCountingMoves) gameBoard[i][j] = 'validMove';
                else return 1;
            } else if (gameBoard[i][j] !== '') {
                if (IsCaptureValid(piece, i, j, opponent)) {
                    if (!isCountingMoves) gameBoard[i][j] = `capture:${gameBoard[i][j]}`;
                    else return 1;
                }
                break;
            }
            i += move.row;
            j += move.col;
        }
    }
    if (isCountingMoves) return 0;
};
const DisplayBishopMovingOptions = (currRow, currCol, isCountingMoves = false) => {
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let bishop = GetPieceAtPosition(pieces, currRow, currCol);
    if (!bishop) return;

    let opponent = Chess.isBlack ? 'w' : 'b';
    return DisplayPieceMoves(bishop, bishopMoves, currRow, currCol, isCountingMoves, opponent);
};
const DisplayRookMovingOptions = (currRow, currCol, isCountingMoves = false) => {
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let rook = GetPieceAtPosition(pieces, currRow, currCol);
    if (!rook) return;

    let opponent = Chess.isBlack ? 'w' : 'b';
    return DisplayPieceMoves(rook, rookMoves, currRow, currCol, isCountingMoves, opponent);
};
const DisplayQueenMovingOptions = (currRow, currCol, isCountingMoves = false) => {

    if (isCountingMoves) {
        let moveCount = DisplayRookMovingOptions(currRow, currCol, true);
        console.log("Move count is:", moveCount);
        if (!(moveCount > 0))
            moveCount += DisplayBishopMovingOptions(currRow, currCol, true);
        return moveCount;
    }
    else {
        DisplayRookMovingOptions(currRow, currCol);
        DisplayBishopMovingOptions(currRow, currCol);
    }
}
const DisplayKnightMovingOptions = (currRow, currCol, isCountingMoves = false) => {

    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let knight = pieces.find(piece => piece.row === currRow && piece.col === currCol);
    if (knight.isPinned) return;

    const opponent = Chess.isBlack ? 'w' : 'b';

    for (let move of knightMoves) {
        let row = currRow + move.row;
        let col = currCol + move.col;

        if (row >= 0 && row < boardDimension && col >= 0 && col < boardDimension) {
            if (gameBoard[row][col] === '' &&
                (IsKingInCheck() ? CanPreventCheck(row, col) : true)) {

                if (!isCountingMoves) gameBoard[row][col] = 'validMove';
                else return 1;
            }
            else if (gameBoard[row][col][0] === opponent &&
                (IsKingInCheck() ? CanPreventCheck(row, col) : true)) {

                if (!isCountingMoves) gameBoard[row][col] = `capture:${gameBoard[row][col]}`;
                else return 1;
            }
        }
    }
    if (isCountingMoves) return 0;
}
const DisplayKingMovingOptions = (currRow, currCol, isCountingMoves = false) => {
    let opponent = Chess.isBlack ? 'w' : 'b';
    let self = Chess.isBlack ? 'b' : 'w';

    //Since the King cannot be pinned, I am not finding it in self pieces 
    for (let move of kingMoves) {
        let row = currRow + move.row;
        let col = currCol + move.col;

        if (row >= 0 && row < boardDimension && col >= 0 && col < boardDimension) {
            if (gameBoard[row][col] === '' && IsSquareSafeForKing(row, col, self)) {
                if (!isCountingMoves) gameBoard[row][col] = 'validMove';
                else if (isCountingMoves) return 1;
            }
            else if (gameBoard[row][col][0] === opponent && IsSquareSafeForKing(row, col)) {
                if (!isCountingMoves) gameBoard[row][col] = `capture:${gameBoard[row][col]}`;
                else if (isCountingMoves) return 1;
            }
        }
    }

    const CheckForTwoSquares = (direction) => {
        let count = 0;
        for (let i = 1; i <= 2; i++) {
            let newCol = currCol + (i * direction);
            // console.log(newCol, ": is the new col to check.\nIs it safe? ", IsSquareSafeForKing(currRow, newCol, self), "Is it empty? ", (gameBoard[currRow][newCol] === ''));
            if (newCol < 0 || newCol >= boardDimension) {
                return false; // Out of board boundaries
            }
            if ((gameBoard[currRow][newCol] === '' || gameBoard[currRow][newCol] === 'validMove')
                && IsSquareSafeForKing(currRow, newCol, self)) {
                count++;
            }
        }
        // console.log(count,': is the count');
        return (count === 2);
    }

    if (!IsKingInCheck() && !isCountingMoves) {
        if (Chess.isBlack && !Chess.hasBlackKingMoved || !Chess.isBlack && !Chess.hasWhiteKingMoved) {
            // check for two squares left and two right
            const directions = [-1, 1]; //-1 means left and 1 means right
            for (let direction of directions) {
                if (CheckForTwoSquares(direction)) {
                    let rookSquare = currCol + direction * (direction === -1 ? 4 : 3);

                    if (rookSquare >= 0 &&
                        rookSquare < boardDimension) {
                        // console.log(rookSquare, "is the rook Square under limits");
                        if (gameBoard[currRow][rookSquare].startsWith(self)
                            && gameBoard[currRow][rookSquare].endsWith('r')) {

                            if (gameBoard[currRow][currCol + direction * 2] === '')
                                gameBoard[currRow][currCol + direction * 2] = 'validMove';
                            // else if (isCountingMoves) return 1;
                        }
                    }
                }
            }
        }
    }
    if (isCountingMoves) return 0;
}
//-----[The sole object through which all of the functions can accessed, Used like an unordered map]---------//
export const moveDisplayingFunctions = {

    'p': DisplayPawnMovingOptions,
    'n': DisplayKnightMovingOptions,
    'r': DisplayRookMovingOptions,
    'b': DisplayBishopMovingOptions,
    'q': DisplayQueenMovingOptions,
    'k': DisplayKingMovingOptions
};
export function RemovePreviousMovingOptions() {
    for (let i = 0; i < boardDimension; i++) {
        for (let j = 0; j < boardDimension; j++) {
            if (gameBoard[i][j] === "validMove")
                gameBoard[i][j] = '';
            else if (gameBoard[i][j].includes('capture'))
                gameBoard[i][j] = gameBoard[i][j].split(':')[1];
        }
    }
}
export function RemovePreviousMoveColors() {
    if (lastMove.currRow === 10) return;

    let i = lastMove.currRow; let j = lastMove.currCol;
    console.log('before', i, j);
    let block = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
    block.style.backgroundColor = ((i + j) % 2 === 1) ? '#779656' : '#EFEED4';
    i = lastMove.prevRow; j = lastMove.prevCol;
    console.log('after', i, j);
    block = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
    block.style.backgroundColor = ((i + j) % 2 === 1) ? '#779656' : '#EFEED4';
}
export function SelectAndDisplayMoves(piece, currRow, currCol) {

    RemovePreviousMovingOptions();

    if (piece.startsWith('w') && !Chess.isBlack || piece.startsWith('b') && Chess.isBlack) {

        Chess.selectedPiece = piece;

        let checkGivingPieces = Chess.isBlack ? whiteCheckGivingPieces : blackCheckGivingPieces;

        if (checkGivingPieces.length > 1) {
            if (piece[1] === 'k')
                moveDisplayingFunctions[piece[1]](currRow, currCol);

            console.log('check giving pieces are: ', checkGivingPieces);
        }
        else
            moveDisplayingFunctions[piece[1]](currRow, currCol);
    }
    Chess.isPieceSelected = true;
    Chess.prevRow = currRow;
    Chess.prevCol = currCol;
}
export function UpdateMoveString(isCapturing, selectedPiece, currRow, currCol, boardDimension) {
    let captureSymbol = isCapturing ? 'x' : '';
    let checkSymbol = (Chess.isBlackKingInCheck || Chess.isWhiteKingInCheck) ? '+' : '';
    let move = '';

    if (PlayedMoves.halfMoveCount % 2 === 1) {
        move = PlayedMoves.fullMoveCount + '.' + ' ' + selectedPiece[1].toUpperCase() + captureSymbol + String.fromCharCode('a'.charCodeAt(0) + currCol) + (boardDimension - currRow) + checkSymbol;
    } else {
        move = selectedPiece[1].toUpperCase() + captureSymbol + String.fromCharCode('a'.charCodeAt(0) + currCol) + (boardDimension - currRow) + checkSymbol;
    }
    return move + " ";
}