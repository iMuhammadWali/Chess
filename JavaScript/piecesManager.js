import { Chess, gameBoard, whitePieces, blackPieces, lastMoves, threatBoard, boardDimension }
    from "./globals.js";
import { AddNewThreats, ResetAllThreats } from "./threatsManager.js";
import { RemovePreviousMovingOptions, UpdateMoveString } from "./movesManager.js";
import { DrawPawnPromotionBox, GetAllPiecePositions } from "./boardManager.js";
const moveSound = new Audio('/assets/moveSound.mp3');
const captureSound = new Audio('/assets/captureSound.mp3');
const castleSound = new Audio('/assets/castleSound.mp3');

export const PlayedMoves = {
    fullMoves: "",
    fullMoveCount: 0,
    halfMoveCount: 0,
}

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
function CastleRook(pieces, direction) {
    let rook = Chess.isBlack ? 'br' : 'wr';
    let rookPrevRow = Chess.isBlack ? 0 : 7;
    let rookPrevCol = (direction < 0) ? 0 : 7;
    let rookNewRow = rookPrevRow;
    let rookNewCol = (direction < 0) ? 3 : 5;

    //PopulateLastMovesArray(rookPrevRow, rookPrevCol, rookNewRow, rookNewCol, gameBoard[rookNewRow][rookNewCol]);
    gameBoard[rookPrevRow][rookPrevCol] = '';
    gameBoard[rookNewRow][rookNewCol] = rook;
    //UpdateCurrentPlayerPositionInPiecesArray(pieces, rookPrevRow, rookPrevCol, rookNewRow, rookNewCol);
}
function UndoCastleRook(pieces, direction) {
    let rook = Chess.isBlack ? 'br' : 'wr';
    let rookPrevRow = Chess.isBlack ? 0 : 7;
    let rookPrevCol = (direction < 0) ? 0 : 7;
    let rookNewRow = rookPrevRow;
    let rookNewCol = (direction < 0) ? 3 : 5;

    gameBoard[rookPrevRow][rookPrevCol] = rook;
    gameBoard[rookNewRow][rookNewCol] = '';
    UpdateCurrentPlayerPositionInPiecesArray(pieces, rookNewRow, rookNewCol, rookPrevRow, rookPrevCol);
}
function RemoveKingFromCheck() {
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
export function UndoTheMove(movedPiece, capturedPiece, prevRow, prevCol, currRow, currCol, HasKingMovedInTheLastMove) {
    // The prevRow and prevCol was the block where the piece was moved to in the previous Turn.
    // The currRow and currCol is the block where the piece was moved from in the previous Turn.

    // Start the undo function by reversing the turn.
    Chess.isBlack = !Chess.isBlack;
    let selfColor = Chess.isBlack ? 'b' : 'w';
    let pieces = Chess.isBlack ? blackPieces : whitePieces;

    // Get the kings move status from the last move.
    let hasKingMoved = Chess.isBlack ? Chess.hasBlackKingMoved : Chess.hasWhiteKingMoved;
    hasKingMoved = HasKingMovedInTheLastMove;

    if (capturedPiece !== '') {
        AddCapturedPieceBackToPiecesArray(capturedPiece, prevRow, prevCol);
    }
    if (DidKingCastle(movedPiece, currRow, currCol, prevRow, prevCol)) {
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

async function sleep(){
    return new Promise (resolve => {
        setTimeout(() => {
            resolve();
        }, 1000);
    }
    )
} 
export async function MoveThePiece(selectedPiece, prevRow, prevCol, currRow, currCol, isSimluatedMove = false, isBotMove = false) {
   
    // I will change the undo mechanism.
    let capturedPiece = "";
    let pieces = Chess.isBlack ? blackPieces : whitePieces;
    let isCapturing = false;
    if (gameBoard[currRow][currCol][0] === (Chess.isBlack ? 'w' : 'b') || gameBoard[currRow][currCol].includes('capture'))  {
        console.log('The piece at the destination is: ', gameBoard[currRow][currCol]);
        isCapturing = true;
    }

    //Check if the move involves capturing an opponent's piece
    if (isCapturing) {
        capturedPiece = gameBoard[currRow][currCol];
        capturedPiece = capturedPiece.split('capture:')[1];
    }
    //Update the game board with the moved piece
    if (!isSimluatedMove && !isBotMove) {
        if (HasPawnMovedToTheLastRow(selectedPiece, currRow)) {
            selectedPiece = await DrawPawnPromotionBox(selectedPiece, currRow, currCol);
        }
    }
    RemovePreviousMovingOptions();

    HasKingMoved(selectedPiece);
    if (!isBotMove && !isSimluatedMove){
        let hasKingMoved = Chess.isBlack ? Chess.hasBlackKingMoved : Chess.hasWhiteKingMoved;
        PopulateLastMovesArray(prevRow, prevCol, currRow, currCol, capturedPiece, hasKingMoved);
    }
    gameBoard[prevRow][prevCol] = '';
    gameBoard[currRow][currCol] = selectedPiece;

    //Remove all other options to move and Update the position in its respective pieces array
    //UpdateCurrentPlayerPositionInPiecesArray(pieces, prevRow, prevCol, currRow, currCol);

    let castlingDirection = DidKingCastle(selectedPiece, prevRow, prevCol, currRow, currCol);
    if (castlingDirection) {
        CastleRook(pieces, castlingDirection);
    }
    // Prepare the board for next move.
    ResetAllThreats();
    GetAllPiecePositions();
    //AddNewThreats('w')
    //AddNewThreats('b');
    AddNewThreats(Chess.isBlack ? 'b' : 'w');
    Chess.isBlack = !Chess.isBlack;
    AddNewThreats(Chess.isBlack ? 'b' : 'w');
    Chess.isBlack = !Chess.isBlack;
    //AddNewThreats(Chess.isBlack ? 'w' : 'b');
        
    RemoveKingFromCheck();

    //Unselect the piece
    Chess.isPieceSelected = false;
    //console.log('The board after moving', gameBoard);

    if (isSimluatedMove){
        return;
    }
    //This Part of the code is responsible for making the Move-string to display on the screen.
    // Create the move string
    let moveString = UpdateMoveString(isCapturing, selectedPiece, prevCol, currRow, currCol, boardDimension);
    PlayedMoves.fullMoves += moveString;

    console.log(PlayedMoves.fullMoves);
    prevRow = prevCol = 10;

    if (isCapturing) {
        captureSound.play();
    }
    else if (castlingDirection) {
        castleSound.play();
    }
    else {
        moveSound.play();
    }
}