import {
    Chess, gameBoard, boardDimension, threatBoard, whitePieces, blackPieces,
    bishopMoves, rookMoves, knightMoves, kingMoves, blackCheckGivingPieces, whiteCheckGivingPieces,
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
const DisplayPawnMovingOptions = (currRow, currCol, isCountingMoves = false, isMakingMovesArray = false) => {

    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let moves = [];
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
                if (isMakingMovesArray) {
                    moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow + 2, toCol: currCol });
                }
                else if (!isCountingMoves) gameBoard[currRow + 2][currCol] = "validMove";
                else return 1;
            }
        }
        if (gameBoard[currRow + 1][currCol] === "" &&
            (isKingInCheck ? CanPreventCheck(currRow + 1, currCol) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 1, currCol) : true)) {
            if (isMakingMovesArray) {
                if (currRow === 0) {
                    moves.push({ piece: "bq", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol });
                    moves.push({ piece: "br", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol });
                    moves.push({ piece: "bb", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol });
                    moves.push({ piece: "bn", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol });
                }
                else 
                moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol });
            }
            else if (!isCountingMoves) gameBoard[currRow + 1][currCol] = 'validMove';
            else return 1;
        }
        if (currCol < boardDimension - 1 && gameBoard[currRow + 1][currCol + 1].includes('w') &&
            (isKingInCheck ? CanPreventCheck(currRow + 1, currCol + 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 1, currCol + 1) : true)) {

            if (isMakingMovesArray) {
                if (currRow === 0) {
                    moves.push({ piece: "bq", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol +1 });
                    moves.push({ piece: "br", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol 
                    + 1});
                    moves.push({ piece: "bb", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol 
                    + 1});
                    moves.push({ piece: "bn", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol
                    + 1});
                }
                else 
                moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol + 1 });
            } else if (!isCountingMoves)
                gameBoard[currRow + 1][currCol + 1] = `capture:${gameBoard[currRow + 1][currCol + 1]}`;
            else return 1;
        }
        if (currCol - 1 > 0 && gameBoard[currRow + 1][currCol - 1].includes('w') &&
            (isKingInCheck ? CanPreventCheck(currRow + 1, currCol - 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow + 1, currCol - 1) : true)) {
            if (isMakingMovesArray) {
                if (currRow === 0) {
                    moves.push({ piece: "bq", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol -1 });
                    moves.push({ piece: "br", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol -1});
                    moves.push({ piece: "bb", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol -1});
                    moves.push({ piece: "bn", fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol -1 });
                }
                else 
                moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow + 1, toCol: currCol - 1 });
            }
            else if (!isCountingMoves)
                gameBoard[currRow + 1][currCol - 1] = `capture:${gameBoard[currRow + 1][currCol - 1]}`;
            else return 1;
        }
    } else {
        if (currRow == 6) {
            if (gameBoard[currRow - 2][currCol] == "" && gameBoard[currRow - 1][currCol] === "" &&
                (isKingInCheck ? CanPreventCheck(currRow - 2, currCol) : true) &&
                (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 2, currCol) : true)) {
                if (isMakingMovesArray) {
                    moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow - 2, toCol: currCol });
                }
                else if (!isCountingMoves) gameBoard[currRow - 2][currCol] = "validMove";
                else return 1;
            }
        }
        if (gameBoard[currRow - 1][currCol] == "" &&
            (isKingInCheck ? CanPreventCheck(currRow - 1, currCol) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 1, currCol) : true)) {
            if (isMakingMovesArray) {
                if (currRow === 0) {
                    moves.push({ piece: "wq", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol });
                    moves.push({ piece: "wr", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol });
                    moves.push({ piece: "wb", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol });
                    moves.push({ piece: "wn", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol });
                }
                else {
                    moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol });
                }
            }
            else if (!isCountingMoves) gameBoard[currRow - 1][currCol] = "validMove";
            else return 1;
        }
        if (currCol + 1 < boardDimension && gameBoard[currRow - 1][currCol + 1].includes('b') &&
            (isKingInCheck ? CanPreventCheck(currRow - 1, currCol + 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 1, currCol + 1) : true)) {
            if (isMakingMovesArray) {
                if (currRow === 0) {
                    moves.push({ piece: "wq", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol + 1 });
                    moves.push({ piece: "wr", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol + 1 });
                    moves.push({ piece: "wb", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol + 1 });
                    moves.push({ piece: "wn", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol + 1 });
                }
                else {
                    moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol + 1 });
                }
            }
            else if (!isCountingMoves)
                gameBoard[currRow - 1][currCol + 1] = `capture:${gameBoard[currRow - 1][currCol + 1]}`;
            else return 1;
        }
        if (currCol - 1 > 0 && gameBoard[currRow - 1][currCol - 1].includes('b') &&
            (isKingInCheck ? CanPreventCheck(currRow - 1, currCol - 1) : true) &&
            (pawn.isPinned ? CanMoveInThePinnedPath(pawn, currRow - 1, currCol - 1) : true)) {
            if (isMakingMovesArray) {
                if (currRow === 0) {
                    moves.push({ piece: "wq", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol - 1 });
                    moves.push({ piece: "wr", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol - 1 });
                    moves.push({ piece: "wb", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol - 1 });
                    moves.push({ piece: "wn", fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol - 1 });
                }
                else {
                    moves.push({ piece: pawn.type, fromRow: currRow, fromCol: currCol, toRow: currRow - 1, toCol: currCol - 1 });
                }
            }
            else if (!isCountingMoves)
                gameBoard[currRow - 1][currCol - 1] = `capture:${gameBoard[currRow - 1][currCol - 1]}`;
            else return 1;
        }
    }

    if (isMakingMovesArray) return moves;
    if (isCountingMoves) return 0;
}
// Used only for Bishop and Rook because only both of them can move in the pinned path
const DisplayPieceMoves = (piece, moves, currRow, currCol, isCountingMoves, opponent, isMakingMovesArray = false) => {
    let movesToReturn = [];

    for (let move of moves) {
        let row = move.row;
        let col = move.col;

        for (let i = currRow + row, j = currCol + col;
            i >= 0 && i < boardDimension && j < boardDimension && j >= 0;) {

            if (IsMoveValid(piece, i, j)) {
                if (isMakingMovesArray) {
                    //MoveThePiece(selectedPiece, prevRow, prevCol, currRow, currCol);
                    movesToReturn.push({ piece: piece.type, fromRow: currRow, fromCol: currCol, toRow: i, toCol: j });
                }
                else if (!isCountingMoves) gameBoard[i][j] = 'validMove';
                else return 1;
            } else if (gameBoard[i][j] !== '') {
                if (IsCaptureValid(piece, i, j, opponent)) {
                    if (isMakingMovesArray) {
                        movesToReturn.push({ piece: piece.type, fromRow: currRow, fromCol: currCol, toRow: i, toCol: j });
                    }
                    else if (!isCountingMoves) gameBoard[i][j] = `capture:${gameBoard[i][j]}`;
                    else return 1;
                }
                break;
            }
            i += move.row;
            j += move.col;
        }
    }
    if (isMakingMovesArray) return movesToReturn;
    if (isCountingMoves) return 0;
};
const DisplayBishopMovingOptions = (currRow, currCol, isCountingMoves = false, isMakingMovesArray = false) => {
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let bishop = GetPieceAtPosition(pieces, currRow, currCol);
    if (!bishop) return;

    let opponent = Chess.isBlack ? 'w' : 'b';
    return DisplayPieceMoves(bishop, bishopMoves, currRow, currCol, isCountingMoves, opponent, isMakingMovesArray);
};
const DisplayRookMovingOptions = (currRow, currCol, isCountingMoves = false, isMakingMovesArray = false) => {
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let rook = GetPieceAtPosition(pieces, currRow, currCol);
    if (!rook) return;

    let opponent = Chess.isBlack ? 'w' : 'b';
    return DisplayPieceMoves(rook, rookMoves, currRow, currCol, isCountingMoves, opponent, isMakingMovesArray);
};
const DisplayQueenMovingOptions = (currRow, currCol, isCountingMoves = false, isMakingMovesArray = false) => {
    if (isCountingMoves) {
        let moveCount = DisplayRookMovingOptions(currRow, currCol, true);
        if (!(moveCount > 0))
            moveCount += DisplayBishopMovingOptions(currRow, currCol, true);
        return moveCount;
    }
    else {
        if (isMakingMovesArray) {
            let moves = [];
            moves = DisplayRookMovingOptions(currRow, currCol, false, true);
            moves = moves.concat(DisplayBishopMovingOptions(currRow, currCol, false, true));
            return moves;
        }
        DisplayRookMovingOptions(currRow, currCol);
        DisplayBishopMovingOptions(currRow, currCol);
    }
}
const DisplayKnightMovingOptions = (currRow, currCol, isCountingMoves = false, isMakingMovesArray = false) => {
    let moves = [];
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
                if (isMakingMovesArray) {
                    moves.push({ piece: knight.type, fromRow: currRow, fromCol: currCol, toRow: row, toCol: col });
                }
                else if (!isCountingMoves) gameBoard[row][col] = 'validMove';
                else return 1;
            }
            else if (gameBoard[row][col][0] === opponent &&
                (IsKingInCheck() ? CanPreventCheck(row, col) : true)) {
                if (isMakingMovesArray) {
                    moves.push({ piece: knight.type, fromRow: currRow, fromCol: currCol, toRow: row, toCol: col });
                }
                else if (!isCountingMoves) gameBoard[row][col] = `capture:${gameBoard[row][col]}`;
                else return 1;
            }
        }
    }
    if (isMakingMovesArray) return moves;
    if (isCountingMoves) return 0;
}
const DisplayKingMovingOptions = (currRow, currCol, isCountingMoves = false, isMakingMovesArray = false) => {
    let opponent = Chess.isBlack ? 'w' : 'b';
    let self = Chess.isBlack ? 'b' : 'w';
    let moves = [];
    let piece = self + 'k';
    //Since the King cannot be pinned, I am not finding it in self pieces 
    for (let move of kingMoves) {
        let row = currRow + move.row;
        let col = currCol + move.col;

        if (row >= 0 && row < boardDimension && col >= 0 && col < boardDimension) {
            if (gameBoard[row][col] === '' && IsSquareSafeForKing(row, col, self)) {
                if (isMakingMovesArray) {
                    moves.push({ piece: piece, fromRow: currRow, fromCol: currCol, toRow: row, toCol: col });
                }
                else if (!isCountingMoves) gameBoard[row][col] = 'validMove';
                else if (isCountingMoves) return 1;
            }
            else if (gameBoard[row][col][0] === opponent && IsSquareSafeForKing(row, col)) {
                if (isMakingMovesArray) {
                    moves.push({ piece: piece, fromRow: currRow, fromCol: currCol, toRow: row, toCol: col });
                }
                else if (!isCountingMoves) gameBoard[row][col] = `capture:${gameBoard[row][col]}`;
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
                        if (gameBoard[currRow][rookSquare].startsWith(self)
                            && gameBoard[currRow][rookSquare].endsWith('r')) {

                            if (gameBoard[currRow][currCol + direction * 2] === '')
                                if (isMakingMovesArray) {
                                    moves.push({ piece: piece, fromRow: currRow, fromCol: currCol, toRow: currRow, toCol: currCol + direction * 2 });
                                }
                                else gameBoard[currRow][currCol + direction * 2] = 'validMove';
                        }
                    }
                }
            }
        }
    }
    if (isMakingMovesArray) return moves;
    if (isCountingMoves) return 0;
}
//-----[The sole object through which all of the functions can accessed, Used like an unordered map]---------//
export const moveDisplayingFunctions = {

    'n': DisplayKnightMovingOptions,
    'p': DisplayPawnMovingOptions,
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

        if (checkGivingPieces.length > 1) { //If there any pieces threatening the king, only let the king move.
            if (piece[1] === 'k')
                moveDisplayingFunctions[piece[1]](currRow, currCol);

            console.log('check giving pieces are: ', checkGivingPieces);
        }
        else // Any piece can move.
            moveDisplayingFunctions[piece[1]](currRow, currCol);
    }
    Chess.isPieceSelected = true;
    Chess.prevRow = currRow;
    Chess.prevCol = currCol;
}
// This function was created to show the moves played in the game on the screen like chess.com.
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
export function GenerateMovesFromCurrentPosition() {

    let moves = [];
    let allMoves = [];
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    for (let piece of pieces) {
        moves = moveDisplayingFunctions[piece.type[1]](piece.row, piece.col, false, true);
        allMoves = allMoves.concat(moves);
    }
    return allMoves;
}