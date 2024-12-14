import { Chess, gameBoard, boardDimension} from "./globals.js";
import { GetAllPiecePositions } from "./boardManager.js";
import { AddNewThreats } from "./threatsManager.js";
import { PlayedMoves } from "./piecesManager.js";
export let correctPuzzleMoves;

export const ParseFEN = (fen) => {
    console.log('The fen string for today\'s puzzle is: ', fen);
    let rank = 0;
    let file = 0;
    for (let i = 0; i < fen.length; i++) {
        if (fen[i] === '/') {
            file = 0; 
            rank++;
        } else if (IsAnInteger(fen[i])) { 
            file += parseInt(fen[i]);
        } else if (fen[i] === ' ') {
            if (fen[i + 1] === 'b') {
                PlayedMoves.halfMoveCount = 1;
                Chess.isBlack = true;
            } else {
                Chess.isBlack = false;
            }
            break;
        } else {
            if (isUpperCase(fen[i])) {
                gameBoard[rank][file] = 'w' + fen[i].toLowerCase();
                file++;
            }
            else if (isLowerCase(fen[i])) {
                gameBoard[rank][file] = 'b' + fen[i];
                file++;
            }
        }
    }
}
function IsAnInteger(char) {
    return !isNaN(parseInt(char));
}
function isUpperCase(char) {
    return char === char.toUpperCase() && char !== char.toLowerCase();
}
function isLowerCase(char) {
    return char === char.toLowerCase() && char !== char.toUpperCase();
}
export function EmptyGameBoard() {
    for (let i = 0; i < boardDimension; i++) {
        for (let j = 0; j < boardDimension; j++) {
            gameBoard[i][j] = "";
        }
    }
}
export async function GetPuzzle() {

    let puzzleData = await fetch('https://api.chess.com/pub/puzzle');
    let data = await puzzleData.json();
    console.log(data);
    EmptyGameBoard() //Before Puzzle

    ParseFEN(data.fen);
    GetAllPiecePositions();

    let pgnString = data.pgn;
    const indexOfMovesStart = pgnString.indexOf('\r\n\r\n');
    correctPuzzleMoves = pgnString.substring(indexOfMovesStart).trim();
    PlayedMoves.fullMoveCount = 0;

    // PlayedMoves.fullMoves = "" + PlayedMoves.fullMoveCount;
    //PlayedMoves.fullMoves = "1.";

    if (Chess.isBlack) {
        PlayedMoves.halfMoveCount = 0;
        PlayedMoves.fullMoves += ".. ";
    }
    else {
        PlayedMoves.halfMoveCount = 1;
    }

    return correctPuzzleMoves;
}

//fen: '4N1rk/4Q2p/5R1n/8/8/rq4Pn/3P1PK1/4R3 b - - 0 1',
// pgn: '[Event "Match"]\r\n' +
// '[Site "New Castle on Tyne (England)"]\r\n' +
// '[Date "1892.??.??"]\r\n' +
// '[White "Henry E Bird"]\r\n' +
// '[Black "Emanuel Lasker"]\r\n' +
// '[Result "0-1"]\r\n' +
// '[FEN "3R1nk1/5rp1/4Q3/4B3/3pqP2/8/6P1/6K1 b - - 0 41"]\r\n' +
// '\r\n' +
// '41... Qe1+ 42. Kh2 Qh4+ 43. Kg1 Qxd8 0-1',
//   image: 'https://www.chess.com/dynboard?fen=3R1nk1/5rp1/4Q3/4B3/3pqP2/8/6P1/6K1%20b%20-%20-%200%2041&size=2'}