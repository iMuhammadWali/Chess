import { board, Chess, gameBoard, pawnBox, boardDimension, whitePieces, blackPieces } from "./globals.js";
import {DrawTurnName } from "./chessManager.js";

export const GetAllPiecePositions = () => {

    whitePieces.length = 0;
    blackPieces.length = 0;

    for (let i = 0; i < boardDimension; i++) {
        for (let j = 0; j < boardDimension; j++) {
            if (gameBoard[i][j][0] === 'w') {
                whitePieces.push({
                    row: i,
                    col: j,
                    type: gameBoard[i][j],
                    isPinned: false,
                    pinPath: []
                });
            }
            else if (gameBoard[i][j][0] === 'b') {
                blackPieces.push({
                    row: i,
                    col: j,
                    type: gameBoard[i][j],
                    isPinned: false,
                    pinPath: []
                });
            }
        }
    }
}
const DrawPieceOnBlock = (block, piece) => {
    let img = document.createElement('img');
    img.src = `./pieces/${piece}.png`;
    // console.log(`./pieces/${piece}.png`);
    img.className = 'piece';
    // console.log(`./pieces/${piece}.png`);
    block.appendChild(img);
}
const DrawKingInCheck = (block, piece) => {
    if (piece == 'wk' && Chess.isWhiteKingInCheck || piece == 'bk' && Chess.isBlackKingInCheck)
        block.style.backgroundColor = 'brown';
    // block.style.backgroundColor = '#C8342F';
}
const DrawFilledCircle = (block) => {
    const circle = document.createElement('div');
    circle.classList.add('filledCircle');
    block.appendChild(circle);
}
const DrawHollowCircle = (block) => {
    block.innerHTML = "";
    const circle = document.createElement('div');
    circle.classList.add('hollowCircle');
    block.appendChild(circle);
}
const DrawPieceToCapture = (block, i, j) => {
    let img = document.createElement('img');
    img.src = `./pieces/${gameBoard[i][j].split(':')[1]}.png`;
    block.appendChild(img);
}
const UpdateBlock = (block, i, j) => {
    const square = gameBoard[i][j];

    if (square !== '' &&
        square !== 'validMove' &&
        square !== 'pS' &&
        !square.includes('capture')) {

        DrawPieceOnBlock(block, square);
        DrawKingInCheck(block, square);
    }
    if (square === 'validMove') {
        DrawFilledCircle(block);
    }
    if (square.includes('capture')) {
        DrawHollowCircle(block);
        DrawPieceToCapture(block, i, j);
    }

}
const CreateBlockNumber = (row, width) => {
    const num = document.createElement('span');
    num.className = 'number';
    num.innerText = (boardDimension - row);
    num.style.color = (row % 2 === 0) ? '#514431' : '#EFEED4';
    let left = (width - ((width/100)*90)) + 'px'; 
    let top = (width - ((width/100)*90)) + 'px'; 
    num.style.height = ((width/100)*0.5);
    num.style.width = ((width/100)*0.5);
    num.style.left = left;
    num.style.top = top;
    return num;
}
const CreateAlphabet = (col, width) => {
    const letter = document.createElement('div');
    letter.className = 'letter';
    letter.style.color = (col % 2) ? '#514431' : '#EFEED4';

    letter.innerText = String.fromCharCode('a'.charCodeAt(0) + col);
    let left = (width - ((width/100)*20)) + 'px'; 
    let top = (width - ((width/100)*40)) + 'px'; 
    letter.style.height = ((width/100)*0.3);
    letter.style.width = ((width/100)*0.3);
    letter.style.left = left;
    letter.style.top = top;
    return letter;
}
export const DrawGameBoard = () => {

    board.innerHTML = " ";
    for (let i = 0; i < boardDimension; i++) {
        for (let j = 0; j < boardDimension; j++) {
            const block = document.createElement('div');

            block.className = 'block';
            block.dataset.row = i;
            block.dataset.col = j;
            block.style.position = 'relative';
            block.style.backgroundColor = ((i + j) % 2 === 1) ? '#9e7a44' : '#EFEED4';

            UpdateBlock(block, i, j);
            board.appendChild(block);
            let width = block.getBoundingClientRect().width;
            if (!j) block.appendChild(CreateBlockNumber(i, width));
            if (i === boardDimension - 1) {
                block.appendChild(CreateAlphabet(j, width));
            }
        }
    }
}
export const UpdateBoard = () => {
    DrawTurnName();
    for (let i = 0; i < boardDimension; i++) {
        for (let j = 0; j < boardDimension; j++) {

            let block = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            if (block.style.backgroundColor === 'brown')
                block.style.backgroundColor = ((i + j) % 2 === 1) ? '#9e7a44': '#EFEED4';
            block.innerHTML = '';
            let width = block.getBoundingClientRect().width;
            UpdateBlock(block, i, j);
            if (!j) block.appendChild(CreateBlockNumber(i, width));
            if (i === boardDimension - 1) {
                block.appendChild(CreateAlphabet(j, width));
            }
        }
    }
}
export async function DrawPawnPromotionBox(selectedPiece, currRow, currCol) {

    //4 because there are only four pieces to select from
    pawnBox.style.display = 'grid';
    let block = document.querySelector(`[data-row="${currRow}"][data-col="${currCol}"]`);
    let blockPosi;
    if (block)
        blockPosi = block.getBoundingClientRect();

    const piecesToSelect = ['n', 'b', 'q', 'r'];

    while (pawnBox.firstChild) {
        pawnBox.removeChild(pawnBox.firstChild);
    }

    for (let i = 0; i < 4; i++) {
        let square = document.createElement('div');
        square.style.height = `${blockPosi.height}px`;
        pawnBox.appendChild(square);
        let piece = (Chess.isBlack ? 'b' : 'w') + piecesToSelect[i];
        square.classList.add(piece);
        DrawPieceOnBlock(square, piece);
    }
    pawnBox.style.top = `${Chess.isBlack ? (blockPosi.top - blockPosi.height * 3) : blockPosi.top}px`;
    pawnBox.style.left = `${blockPosi.left}px`;
    pawnBox.style.height = `${blockPosi.height * 4}px`;
    pawnBox.style.width = `${blockPosi.width}px`;

    console.log( pawnBox.style.top);
    console.log( pawnBox.style.left);
    console.log( pawnBox.style.height);
    console.log( pawnBox.style.width);
    
    return new Promise(resolve => {
        pawnBox.addEventListener('click', (event) => {
            const target = event.target.closest('div');
            selectedPiece = target.classList.value;
            pawnBox.style.display = 'none';
            // console.log (selectedPiece, 'after the pawn box has been clicked');
            resolve(selectedPiece);
        });
    });
}