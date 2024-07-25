import { Chess, gameBoard, boardDimension, whitePieces, blackPieces, lastMove, lastMoves, threatBoard }
    from "./globals.js";
import { AddNewThreats, ResetCurrentPlayerThreats } from "./threatsManager.js";
import { RemovePreviousMovingOptions, UpdateMoveString, RemovePreviousMoveColors } from "./movesManager.js";
import { PlayedMoves } from "./chessManager.js";
import { DrawPawnPromotionBox } from "./boardManager.js";
const moveSound = new Audio ('/assets/moveSound.mp3');
const captureSound = new Audio ('/assets/captureSound.mp3');
const castleSound = new Audio ('/assets/castleSound.mp3');

function RemoveCapturedPieceFromPiecesArray(row, col) {

    let opponentPieces = Chess.isBlack ? whitePieces : blackPieces;
    let index = opponentPieces.findIndex(piece => piece.row === row && piece.col === col);

    if (index !== -1) {
        opponentPieces.splice(index, 1);
    }
}
function UpdateCurrentPlayerPositionInPiecesArray(pieces, prevRow, prevCol, currRow, currCol) {
    pieces.some(piece => {
        if (piece.row === prevRow && piece.col === prevCol) {
            piece.row = currRow;
            piece.col = currCol;
            piece.type = gameBoard[currRow][currCol];
            return true;
        }
        return false;
    });
}
function HasPawnMovedToTheLastRow(piece, row) {
    return piece.includes('p') && (row === 0 || row === 7);
}
function DidKingCastle(selectedPiece, prevRow, prevCol, currRow, currCol) {

    if (selectedPiece.endsWith('k')) {
        if (prevRow === currRow) {
            let fileDiff = currCol - prevCol;
            if (fileDiff > 1 || fileDiff < -1) {
                return fileDiff;
            }
        }
    }
    return 0;
}
function HasKingMoved(selectedPiece) {

    if (selectedPiece.endsWith('k')) {
        if (Chess.isBlack) {
            Chess.hasBlackKingMoved = true;
        }
        else
            Chess.hasWhiteKingMoved = true;
    }
}
function CastleRook(pieces, direction){
    let rook = Chess.isBlack ? 'br' : 'wr';
    let rookPrevRow = Chess.isBlack ? 0 : 7;
    let rookPrevCol = (direction < 0) ? 0 : 7;
    let rookNewRow = rookPrevRow;
    let rookNewCol = (direction < 0) ? 3 : 5;

    gameBoard[rookPrevRow][rookPrevCol] = '';
    gameBoard[rookNewRow][rookNewCol] = rook;
    UpdateCurrentPlayerPositionInPiecesArray(pieces, rookPrevRow, rookPrevCol, rookNewRow, rookNewCol);

    PopulateLastMovesArray( rookPrevRow, rookPrevCol, rookNewRow, rookNewCol) ;
}
function RemoveKingFromCheck(){
    if (Chess.isBlack) Chess.isBlackKingInCheck = false;
    else Chess.isWhiteKingInCheck = false;
}
const PopulateLastMovesArray = (prevRow, prevCol, currRow, currCol) => {
    lastMove.prevRow = prevRow;
    lastMove.prevCol = prevCol;
    lastMove.currRow = currRow;
    lastMove.currCol = currCol;
    lastMoves.push(lastMove);
} 
export async function MoveThePiece(selectedPiece, prevRow, prevCol, currRow, currCol) {    

   
    let selfColor = Chess.isBlack ? 'b' : 'w';
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let isCapturing = gameBoard[currRow][currCol].includes('capture');

    //Check if the move involves capturing an opponent's piece
    if (isCapturing){
        RemoveCapturedPieceFromPiecesArray(currRow, currCol);
    }
    //Update the game board with the moved piece
    if (HasPawnMovedToTheLastRow(selectedPiece, currRow)) {
        selectedPiece = await DrawPawnPromotionBox(selectedPiece, currRow, currCol);
    }
    RemovePreviousMovingOptions();

    gameBoard[prevRow][prevCol] = '';
    gameBoard[currRow][currCol] = selectedPiece;
    PopulateLastMovesArray( prevRow, prevCol, currRow, currCol) ;

    //Remove all other options to move and Update the position in its respective pieces array
    UpdateCurrentPlayerPositionInPiecesArray(pieces, prevRow, prevCol, currRow, currCol);

    let castlingDirection = DidKingCastle(selectedPiece, prevRow, prevCol, currRow, currCol);
    if (castlingDirection) {
        CastleRook(pieces, castlingDirection);
    }

    HasKingMoved(selectedPiece);
    ResetCurrentPlayerThreats();
    RemoveKingFromCheck();

    //Reset the previous row and column to out of bounds
    prevRow = prevCol = 10;

    //Unselect the piece
    Chess.isPieceSelected = false;

    //Check if the current player give check to king after the move
    AddNewThreats(selfColor);

    PlayedMoves.halfMoveCount++;
    if (PlayedMoves.halfMoveCount % 2 === 0) {
        PlayedMoves.fullMoveCount++;
    }
    // Create the move string
    let moveString = UpdateMoveString(isCapturing, selectedPiece, currRow, currCol, boardDimension);
    PlayedMoves.fullMoves += moveString;

    console.log(PlayedMoves.fullMoves);

    if (isCapturing){
        captureSound.play();
    }
    else if (castlingDirection){
        castleSound.play();
    }
    else  moveSound.play();
}