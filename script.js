/*
TO Do's:
    Piece capturing (Bug: Pieces will move anywhere, unless there is a piece in that square)
    Unselect a piece
    Other piece movement
*/

const board = document.getElementById('chessboard');
const resetButton = document.getElementById('resetButton');
const undoButton = document.getElementById('undoButton');
const redoButton = document.getElementById('redoButton');
const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
};

const initialBoard = [
    'RNBQKBNR',
    'PPPPPPPP',
    '        ',
    '        ',
    '        ',
    '        ',
    'pppppppp',
    'rnbqkbnr'
];

let selectedPiece = null;
let selectedSquare = null;
let moveHistory = [];
let redoHistory = [];
let isWhiteTurn = true;

function createBoard() {
    board.innerHTML = ''; // Clear the board first
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
            square.id = `square-${i}-${j}`;
            square.row = i;
            square.col = j;
            const piece = initialBoard[i][j];
            if (piece !== ' ') {
                square.textContent = pieces[piece];
            }
            square.addEventListener('click', () => selectSquare(i, j));
            board.appendChild(square);
        }
    }
    moveHistory = [];
    redoHistory = [];
    isWhiteTurn = true;
    clearMoveHighlights();
    updateButtonStates();
}

function clearMoveHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('move-target', 'capture-target');
    });
}

function highlightAvailableMoves() {
    clearMoveHighlights();
    if (!selectedPiece || !selectedSquare) return;

    const row = selectedSquare.row;
    const col = selectedSquare.col;
    const possibleMoves = [];

    if (selectedPiece === '♙') {
        const oneStep = row - 1;
        const twoStep = row - 2;
        if (oneStep >= 0 && document.getElementById(`square-${oneStep}-${col}`).textContent === '') {
            possibleMoves.push({ row: oneStep, col, isCapture: false });
            if (row === 6 && twoStep >= 0 && document.getElementById(`square-${twoStep}-${col}`).textContent === '') {
                possibleMoves.push({ row: twoStep, col, isCapture: false });
            }
        }

        [-1, 1].forEach(delta => {
            const targetCol = col + delta;
            const targetRow = row - 1;
            if (targetCol >= 0 && targetCol < 8 && targetRow >= 0 && targetRow < 8) {
                const targetSquare = document.getElementById(`square-${targetRow}-${targetCol}`);
                if (targetSquare.textContent && checkIfBlackPiece(targetSquare.textContent)) {
                    possibleMoves.push({ row: targetRow, col: targetCol, isCapture: true });
                }
            }
        });
    }

    if (selectedPiece === '♟') {
        const oneStep = row + 1;
        const twoStep = row + 2;
        if (oneStep < 8 && document.getElementById(`square-${oneStep}-${col}`).textContent === '') {
            possibleMoves.push({ row: oneStep, col, isCapture: false });
            if (row === 1 && twoStep < 8 && document.getElementById(`square-${twoStep}-${col}`).textContent === '') {
                possibleMoves.push({ row: twoStep, col, isCapture: false });
            }
        }

        [-1, 1].forEach(delta => {
            const targetCol = col + delta;
            const targetRow = row + 1;
            if (targetCol >= 0 && targetCol < 8 && targetRow >= 0 && targetRow < 8) {
                const targetSquare = document.getElementById(`square-${targetRow}-${targetCol}`);
                if (targetSquare.textContent && checkIfWhitePiece(targetSquare.textContent)) {
                    possibleMoves.push({ row: targetRow, col: targetCol, isCapture: true });
                }
            }
        });
    }

    possibleMoves.forEach(move => {
        const moveSquare = document.getElementById(`square-${move.row}-${move.col}`);
        if (moveSquare) {
            moveSquare.classList.add(move.isCapture ? 'capture-target' : 'move-target');
        }
    });
}

function selectSquare(row, col) {//Consider displaying valid moves
    const square = document.getElementById(`square-${row}-${col}`);
    if (selectedPiece) {
        movePiece(row, col);
    } else if (square.textContent !== '' && isTurnValid(square.textContent)) {
        if (selectedSquare) {
            selectedSquare.classList.remove('selected');
        }
        selectedPiece = square.textContent;
        selectedSquare = square;
        square.classList.add('selected');
        highlightAvailableMoves();
    }
}

function movePiece(row, col) {
    const targetSquare = document.getElementById(`square-${row}-${col}`);
    if ((targetSquare.textContent === '' || (targetSquare.textContent !== '' && isTurnValid(targetSquare.textContent))) && ValidMove(selectedPiece, selectedSquare, row, col, targetSquare)) {

        moveHistory.push({
            from: selectedSquare.id,
            to: targetSquare.id,
            piece: selectedPiece,
            captured: targetSquare.textContent
        });

        //
        //console.log("From -> Row: ", selectedSquare.row, ", Col: ", selectedSquare.col);
        //console.log("Going to -> Row: ", row, ", Col: ", col);
        //
        redoHistory = [];
        targetSquare.textContent = selectedPiece; //moves the piece
        selectedSquare.textContent = '';
        selectedSquare.classList.remove('selected');
        clearMoveHighlights();
        selectedPiece = null;
        selectedSquare = null;
        isWhiteTurn = !isWhiteTurn;
        updateButtonStates();
    }
}

function ValidMove(selectedPiece, selectedSquare, targetRow, targetCol, targetSquare){

    //Valid White Pawn moves
    if(selectedPiece === '♙'){
        //Move 2 squares up from home square
        if(selectedSquare.row == 6 && targetRow == 4){
            return true;
        }
        
        //Move 1 square up
        else if((targetRow === (selectedSquare.row - 1)) && targetCol == selectedSquare.col){
            return true;
        }

        //capture diagonally
        /*else if ((targetRow === (selectedSquare.row - 1)) && ((targetCol == selectedSquare.col + 1) || (targetCol == selectedSquare.col - 1)) && checkIfBlackPiece(targetSquare.textContent) ){
            console.log("diag pawn capture");
            return true;
        }*/

        return false;

        
        //en passent
    }
    return true;
}

function checkIfBlackPiece(piece){
   if (piece === '♜' || piece === '♞'|| piece === '♝'|| piece === '♛'|| piece === '♚'|| piece === '♟'){
    return true;
   }
   return false;
}

function checkIfWhitePiece(piece){
    if (piece === '♖' || piece === '♘'|| piece === '♗'|| piece === '♕'|| piece === '♔'|| piece === '♙'){
        return true;
    }
    return false;
}


function isTurnValid(piece) {
    //White's move
    if (isWhiteTurn && checkIfWhitePiece(piece)) {
        return true;
    }

    //Black's move
    if (!isWhiteTurn && checkIfBlackPiece(piece)){
        return true;
    } 
    return false;
}

function undoMove() {
    const lastMove = moveHistory.pop();
    if (lastMove) {
        const fromSquare = document.getElementById(lastMove.from);
        const toSquare = document.getElementById(lastMove.to);
        fromSquare.textContent = lastMove.piece;
        toSquare.textContent = lastMove.captured;
        redoHistory.push(lastMove);
        isWhiteTurn = !isWhiteTurn;
        updateButtonStates();
    }
}

function redoMove() {
    const lastUndo = redoHistory.pop();
    if (lastUndo) {
        const fromSquare = document.getElementById(lastUndo.from);
        const toSquare = document.getElementById(lastUndo.to);
        toSquare.textContent = lastUndo.piece;
        fromSquare.textContent = '';
        moveHistory.push(lastUndo);
        isWhiteTurn = !isWhiteTurn;
        updateButtonStates();
    }
}

function updateButtonStates() {
    undoButton.disabled = moveHistory.length === 0;
    redoButton.disabled = redoHistory.length === 0;
}

resetButton.addEventListener('click', createBoard);
undoButton.addEventListener('click', undoMove);
redoButton.addEventListener('click', redoMove);

createBoard();
