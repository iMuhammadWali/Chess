import { Chess, gameBoard, boardDimension, whitePieces, blackPieces, lastMoves, threatBoard }
    from "./globals.js";
import { AddNewThreats, ResetCurrentPlayerThreats } from "./threatsManager.js";
import { RemovePreviousMovingOptions, UpdateMoveString, RemovePreviousMoveColors } from "./movesManager.js";
import { PlayedMoves } from "./chessManager.js";
import { DrawPawnPromotionBox } from "./boardManager.js";
const moveSound = new Audio ('/assets/moveSound.mp3');
const captureSound = new Audio ('/assets/captureSound.mp3');
const castleSound = new Audio ('/assets/castleSound.mp3');

export function RemoveCapturedPieceFromPiecesArray(row, col) {

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
    
    //PopulateLastMovesArray(rookPrevRow, rookPrevCol, rookNewRow, rookNewCol, gameBoard[rookNewRow][rookNewCol]);
    gameBoard[rookPrevRow][rookPrevCol] = '';
    gameBoard[rookNewRow][rookNewCol] = rook;
    UpdateCurrentPlayerPositionInPiecesArray(pieces, rookPrevRow, rookPrevCol, rookNewRow, rookNewCol);
}
function UndoCastleRook(pieces, direction){
    let rook = Chess.isBlack ? 'br' : 'wr';
    let rookPrevRow = Chess.isBlack ? 0 : 7;
    let rookPrevCol = (direction < 0) ? 0 : 7;
    let rookNewRow = rookPrevRow;
    let rookNewCol = (direction < 0) ? 3 : 5;

    gameBoard[rookPrevRow][rookPrevCol] = rook;
    gameBoard[rookNewRow][rookNewCol] = '';
    UpdateCurrentPlayerPositionInPiecesArray(pieces, rookNewRow, rookNewCol, rookPrevRow, rookPrevCol);
}
function RemoveKingFromCheck(){
    if (Chess.isBlack) Chess.isBlackKingInCheck = false;
    else Chess.isWhiteKingInCheck = false;
}
const PopulateLastMovesArray = (prevRow, prevCol, currRow, currCol, capturedPiece, hasKingMoved) => {
    
    let lastMove = {
        prevRow: prevRow, 
        prevCol: prevCol,
        currRow: currRow,
        currCol: currCol,
        capturedPiece: capturedPiece,
        movedPiece: gameBoard[prevRow][prevCol],
        hasKingMoved: hasKingMoved,
    }
    lastMoves.push(lastMove);
} 
function AddCapturedPieceBackToPiecesArray(capturedPiece, fromRow, fromCol) {

    let opponentPieces = Chess.isBlack ? whitePieces : blackPieces;
    let piece = {
        row: fromRow,
        col: fromCol,
        type: capturedPiece,
    }
    opponentPieces.push(piece); // No need to insert at the right place. Just push it in the array.
}

// Works fine as Wine !!
export function UndoTheMove(movedPiece, capturedPiece, prevRow, prevCol, currRow, currCol, HasKingMovedInTheLastMove){
    // The prevRow and prevCol was the block where the piece was moved to in the previous Turn.
    // The currRow and currCol is the block where the piece was moved from in the previous Turn.

    // Start the undo function by reversing the turn.
    Chess.isBlack = !Chess.isBlack;
    let selfColor = Chess.isBlack ? 'b' : 'w';
    let pieces = Chess.isBlack ? blackPieces : whitePieces;

    // Get the kings move status from the last move.
    let  hasKingMoved = Chess.isBlack ? Chess.hasBlackKingMoved : Chess.hasWhiteKingMoved;
    hasKingMoved = HasKingMovedInTheLastMove;

    if (capturedPiece !== ''){
        AddCapturedPieceBackToPiecesArray(capturedPiece, prevRow, prevCol);
    }
    if (DidKingCastle(movedPiece, currRow, currCol, prevRow, prevCol)){
        console.log('Undoing the castling move');
        UndoCastleRook(pieces, currRow, currCol);
    }
    gameBoard[prevRow][prevCol] = capturedPiece;
    gameBoard[currRow][currCol] = movedPiece;

    UpdateCurrentPlayerPositionInPiecesArray(pieces, prevRow, prevCol, currRow, currCol);

    //Remove the threats and update the threats
    ResetCurrentPlayerThreats();
    // Remove the opponent king from Check.
    if (Chess.isBlack) Chess.isWhiteKingInCheck = false;
    else Chess.isBlackKingInCheck = false;
    
    AddNewThreats(selfColor);
}
export async function MoveThePiece(selectedPiece, prevRow, prevCol, currRow, currCol){    

    let selfColor = Chess.isBlack ? 'b' : 'w';
    let capturedPiece = "";
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let isCapturing = gameBoard[currRow][currCol].includes('capture');

    //Check if the move involves capturing an opponent's piece
    if (isCapturing){
        RemoveCapturedPieceFromPiecesArray(currRow, currCol);
        capturedPiece = gameBoard[currRow][currCol];
        capturedPiece = capturedPiece.split('capture:')[1];
    }
    //Update the game board with the moved piece
    if (HasPawnMovedToTheLastRow(selectedPiece, currRow)) {
        selectedPiece = await DrawPawnPromotionBox(selectedPiece, currRow, currCol);
    }
    RemovePreviousMovingOptions();

    HasKingMoved(selectedPiece);
    let hasKingMoved = Chess.isBlack ? Chess.hasBlackKingMoved : Chess.hasWhiteKingMoved;
    PopulateLastMovesArray(prevRow, prevCol, currRow, currCol, capturedPiece, hasKingMoved);
    
    gameBoard[prevRow][prevCol] = '';
    gameBoard[currRow][currCol] = selectedPiece;

    //Remove all other options to move and Update the position in its respective pieces array
    UpdateCurrentPlayerPositionInPiecesArray(pieces, prevRow, prevCol, currRow, currCol);

    let castlingDirection = DidKingCastle(selectedPiece, prevRow, prevCol, currRow, currCol);
    if (castlingDirection) {
        CastleRook(pieces, castlingDirection);
    }

    ResetCurrentPlayerThreats();
    RemoveKingFromCheck();

    //Unselect the piece
    Chess.isPieceSelected = false;
    AddNewThreats(selfColor);

    // This Part of the code is responsible for making the Move-string to display on the screen.
    // PlayedMoves.halfMoveCount++;
    // if (PlayedMoves.halfMoveCount % 2 === 0) {
    //     PlayedMoves.fullMoveCount++;
    // }
    // // Create the move string
    // let moveString = UpdateMoveString(isCapturing, selectedPiece, currRow, currCol, boardDimension);
    // PlayedMoves.fullMoves += moveString;

    // console.log(PlayedMoves.fullMoves);

    if (isCapturing){
        captureSound.play();
    }
    else if (castlingDirection){
        castleSound.play();
    }
    else  moveSound.play();
    //export function UndoTheMove(movedPiece, capturedPiece, prevRow, prevCol, currRow, currCol, isCastling)
    //Reset the previous row and column to out of bounds
    prevRow = prevCol = 10;
}