//Import the Global Variables
import { Chess, gameBoard, boardDimension, threatBoard, whitePieces, blackPieces, blackCheckGivingPieces, whiteCheckGivingPieces, bishopMoves, rookMoves, knightMoves, kingMoves } from "./globals.js";

const MarkThreat = (currRow, currCol, self) => {
    if (self === 'w') {
        threatBoard[currRow][currCol].white = true;
    } else if (self === 'b') {
        threatBoard[currRow][currCol].black = true;
    }
}
const PinPiece = (piece) => {
    piece.isPinned = true;
}
const HandleOpponentKingInPath = (i, j, row, col, currRow, currCol, self) => {
    PutKingInCheck(self, currRow, currCol);

    let checkGivingPieces = Chess.isBlack ? blackCheckGivingPieces : whiteCheckGivingPieces;
    checkGivingPieces.push(gameBoard[currRow][currCol]);
    //Put the king in check first

    //Mark the square behind the king as a threat so it cannot move there
    if (i + row >= 0 && i + row < boardDimension && j + col < boardDimension && j + col >= 0) {
        MarkThreat(i + row, j + col, self);
    }
    //Retrack the path so that if a piece can come in between it to prevent check
    for (let k = i - row, l = j - col; k !== currRow || l !== currCol; k -= row, l -= col) {
        AddCheckPathInThreatBoard(k, l)
        //console.log("black check is true at", k, l);
    }
}
const HandleNonEmptySquare = (i, j, row, col, currRow, currCol, self, opponent) => {

    //If it is player's own piece, mark as a threat so that King cannot kill it
    if (gameBoard[i][j].startsWith(self)) {
        MarkThreat(i, j, self);
        return;
    }
    //If it is an opponent's piece pin it if king is there behind it
    else if (gameBoard[i][j].startsWith(opponent) && !gameBoard[i][j].endsWith('k')) {

        //Loop behind the piece to Check for king in the same path
        for (let k = i + row, l = j + col; k >= 0 && k < boardDimension && l < boardDimension &&
            l >= 0; k += row, l += col) {

            if (gameBoard[k][l].endsWith('k') && gameBoard[k][l].startsWith(opponent)) {

                //Find the opponent Piece
                let pieces = Chess.isBlack ? whitePieces : blackPieces;
                let piece = pieces.find(piece => piece.row === i && piece.col === j);
                //console.log('pinning piece', piece, ' at  ', i, ' and col', j);
                PinPiece(piece, i, j);

                //Back track the pinning Path
                for (let x = k - row, y = l - col; x + row !== currRow || y + col !== currCol;) {
                    piece.pinPath.push({
                        row: x,
                        col: y
                    });
                    if (x + row !== currRow) x -= row;
                    if (y + col !== currCol) y -= col;
                }
                break;
            }
            //If it is not the opponents king, break the loop
            else if (gameBoard[k][l] !== '') break;
        }
    }
}
function AddCheckPathInThreatBoard(currRow, currCol) {
    if (Chess.isBlack)
        threatBoard[currRow][currCol].blackCheck = true;
    else
        threatBoard[currRow][currCol].whiteCheck = true;
}
const AddPawnThreats = (currRow, currCol, self, opponent) => {

    let isKingInCheck = false;
    const direction = Chess.isBlack ? + 1 : -1;

    if (currRow + direction >= 0 && currRow + direction < boardDimension) {

        if (currCol + 1 < boardDimension) {

            if (gameBoard[currRow + direction][currCol + 1] === '' ||
                gameBoard[currRow + direction][currCol + 1] === self)

                MarkThreat(currRow + direction, currCol + 1, self);

            else if (gameBoard[currRow + direction][currCol + 1][1] === 'k' &&
                gameBoard[currRow + direction][currCol + 1][0] === opponent) {
                PutKingInCheck(self, currRow, currCol);
                isKingInCheck = true;
            }
        }
        if (currCol - 1 >= 0) {

            if (gameBoard[currRow + direction][currCol - 1] === '' ||
                gameBoard[currRow + direction][currCol - 1] === self)

                MarkThreat(currRow + direction, currCol - 1, self);

            else if (gameBoard[currRow + direction][currCol - 1][1] === 'k' &&
                gameBoard[currRow + direction][currCol - 1][0] === opponent) {

                PutKingInCheck(self, currRow, currCol);
                isKingInCheck = true;
            }
        }
    }
    if (isKingInCheck) {

        if (Chess.isBlack) {
            threatBoard[currRow][currCol].blackCheck = true;
        } else if (!Chess.isBlack) {
            threatBoard[currRow][currCol].whiteCheck = true;
        }
    }
}
const PutKingInCheck = (self, currRow, currCol) => {
    if (self === 'w') Chess.isBlackKingInCheck = true
    else if (self === 'b') Chess.isWhiteKingInCheck = true;

    AddCheckPathInThreatBoard(currRow, currCol);
}
const AddPieceThreats = (moves, currRow, currCol, self, opponent) => {
    let doesKingGetInCheck = false;

    for (let move of moves) {

        let row = move.row;
        let col = move.col;

        for (let i = row + currRow, j = col + currCol;
            i >= 0 && i < boardDimension && j < boardDimension && j >= 0; i += row, j += col) {

            if (gameBoard[i][j] === '')
                MarkThreat(i, j, self);

            else if (gameBoard[i][j][1] === 'k' && gameBoard[i][j][0] === opponent)
                HandleOpponentKingInPath(i, j, row, col, currRow, currCol, self);

            else if (gameBoard[i][j] !== '') {
                HandleNonEmptySquare(i, j, row, col, currRow, currCol, self, opponent);
                break;
            }
        }
    }
    return doesKingGetInCheck;
}
const AddBishopThreats = (currRow, currCol, self, opponent) => {
    AddPieceThreats(bishopMoves, currRow, currCol, self, opponent);
}
const AddRookThreats = (currRow, currCol, self, opponent) => {
    AddPieceThreats(rookMoves, currRow, currCol, self, opponent);
}
const AddQueenThreats = (currRow, currCol, self, opponent) => {
    AddBishopThreats(currRow, currCol, self, opponent)
    AddRookThreats(currRow, currCol, self, opponent)
}
const AddKnightThreats = (currRow, currCol, self, opponent) => {
    for (let move of knightMoves) {
        let row = currRow + move.row;
        let col = currCol + move.col;

        if (row >= 0 && row < boardDimension && col >= 0 && col < boardDimension) {
            if (gameBoard[row][col] === '' || gameBoard[row][col].startsWith(self))
                MarkThreat(row, col, self);
            else if (gameBoard[row][col].endsWith('k') && gameBoard[row][col].startsWith(opponent))
                PutKingInCheck(self, currRow, currCol);
        }
    }
}
const AddKingThreats = (currRow, currCol, self, opponent) => {

    for (let move of kingMoves) {
        let row = currRow + move.row;
        let col = currCol + move.col;

        if (row >= 0 && row < boardDimension && col >= 0 && col < boardDimension) {
            if (gameBoard[row][col] === '' || gameBoard[row][col].startsWith(self)) MarkThreat(row, col, self);
        }
    }
}
const threatFunctions = {
    'r': AddRookThreats,
    'n': AddKnightThreats,
    'b': AddBishopThreats,
    'q': AddQueenThreats,
    'p': AddPawnThreats,
    'k': AddKingThreats
};
export const InitializeThreatBoard = () => {

    for (let i = 0; i < boardDimension; i++) {
        threatBoard[i] = [];
        for (let j = 0; j < boardDimension; j++) {
            threatBoard[i][j] = {
                white: false,
                black: false,
                whiteCheck: false,
                blackCheck: false
            };
        }
    }
}
export const ResetAllThreats = () => {
    for (let i = 0; i < threatBoard.length; i++) {
        for (let j = 0; j < threatBoard[i].length; j++) {
            //if (Chess.isBlack){
                threatBoard[i][j].black = false;
                threatBoard[i][j].blackCheck = false;
            //}
            //else {  
                threatBoard[i][j].white = false;
                threatBoard[i][j].whiteCheck = false;
            //}
        }
    }
    //Remove Checks becasue they will be given again
    blackCheckGivingPieces.length = 0;
    whiteCheckGivingPieces.length = 0;
}

export function AddNewThreats(self) {
    let opponent = self == 'b' ? 'w' : 'b';
    let pieces = self == 'b' ? blackPieces : whitePieces;

    for (let i = 0; i < pieces.length; i++) {
        let row = pieces[i].row;
        let col = pieces[i].col;

        let piece = gameBoard[row][col];
        threatFunctions[piece[1]](row, col, self, opponent)
    }
}