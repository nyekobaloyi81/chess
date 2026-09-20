const board = document.getElementById('chessboard');
const resetButton = document.getElementById('resetButton');
const undoButton = document.getElementById('undoButton');
const redoButton = document.getElementById('redoButton');
const statusBar = document.getElementById('statusBar');
const capturedPiecesEl = document.getElementById('capturedPieces');
const moveLogEl = document.getElementById('moveLog');

const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
};

const pieceNames = {
    '♜': 'Rook', '♞': 'Knight', '♝': 'Bishop', '♛': 'Queen', '♚': 'King', '♟': 'Pawn',
    '♖': 'Rook', '♘': 'Knight', '♗': 'Bishop', '♕': 'Queen', '♔': 'King', '♙': 'Pawn'
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
let capturedPieces = {
    white: [],
    black: []
};

function createBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.id = `square-${row}-${col}`;
            square.row = row;
            square.col = col;

            const piece = initialBoard[row][col];
            if (piece !== ' ') {
                square.textContent = pieces[piece];
            }

            square.addEventListener('click', () => selectSquare(row, col));
            board.appendChild(square);
        }
    }

    moveHistory = [];
    redoHistory = [];
    capturedPieces = { white: [], black: [] };
    isWhiteTurn = true;
    selectedPiece = null;
    selectedSquare = null;
    clearMoveHighlights();
    updateButtonStates();
    updateStatusBar();
    renderCapturedPieces();
    renderMoveLog();
}

function getSquare(row, col) {
    return document.getElementById(`square-${row}-${col}`);
}

function clearMoveHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('move-target', 'capture-target');
    });
}

function squareInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isWhitePiece(piece) {
    return piece === '♖' || piece === '♘' || piece === '♗' || piece === '♕' || piece === '♔' || piece === '♙';
}

function isBlackPiece(piece) {
    return piece === '♜' || piece === '♞' || piece === '♝' || piece === '♛' || piece === '♚' || piece === '♟';
}

function isTurnValid(piece) {
    if (isWhiteTurn && isWhitePiece(piece)) {
        return true;
    }

    if (!isWhiteTurn && isBlackPiece(piece)) {
        return true;
    }

    return false;
}

function formatSquare(row, col) {
    const files = 'abcdefgh';
    return `${files[col]}${8 - row}`;
}

function addDirectionalMoves(moves, startRow, startCol, rowStep, colStep, isWhite) {
    let row = startRow + rowStep;
    let col = startCol + colStep;

    while (squareInBounds(row, col)) {
        const targetSquare = getSquare(row, col);
        const targetPiece = targetSquare.textContent;

        if (!targetPiece) {
            moves.push({ row, col, isCapture: false });
        } else {
            if ((isWhite && isBlackPiece(targetPiece)) || (!isWhite && isWhitePiece(targetPiece))) {
                moves.push({ row, col, isCapture: true });
            }
            break;
        }

        row += rowStep;
        col += colStep;
    }
}

function getPieceMoves(piece, row, col) {
    const moves = [];
    const isWhite = isWhitePiece(piece);

    if (piece === '♙' || piece === '♟') {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        const oneStepRow = row + direction;

        if (squareInBounds(oneStepRow, col)) {
            const squareAhead = getSquare(oneStepRow, col);
            if (!squareAhead.textContent) {
                moves.push({ row: oneStepRow, col, isCapture: false });
                const twoStepRow = row + (direction * 2);
                if (row === startRow && squareInBounds(twoStepRow, col)) {
                    const secondSquare = getSquare(twoStepRow, col);
                    if (!secondSquare.textContent) {
                        moves.push({ row: twoStepRow, col, isCapture: false });
                    }
                }
            }
        }

        [-1, 1].forEach(delta => {
            const targetRow = row + direction;
            const targetCol = col + delta;
            if (squareInBounds(targetRow, targetCol)) {
                const targetSquare = getSquare(targetRow, targetCol);
                const targetPiece = targetSquare.textContent;
                if (targetPiece && ((isWhite && isBlackPiece(targetPiece)) || (!isWhite && isWhitePiece(targetPiece)))) {
                    moves.push({ row: targetRow, col: targetCol, isCapture: true });
                }
            }
        });

        return moves;
    }

    if (piece === '♖' || piece === '♜') {
        const directions = [[1,0],[-1,0],[0,1],[0,-1]];
        directions.forEach(([rowStep, colStep]) => addDirectionalMoves(moves, row, col, rowStep, colStep, isWhite));
        return moves;
    }

    if (piece === '♗' || piece === '♝') {
        const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
        directions.forEach(([rowStep, colStep]) => addDirectionalMoves(moves, row, col, rowStep, colStep, isWhite));
        return moves;
    }

    if (piece === '♕' || piece === '♛') {
        const directions = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        directions.forEach(([rowStep, colStep]) => addDirectionalMoves(moves, row, col, rowStep, colStep, isWhite));
        return moves;
    }

    if (piece === '♘' || piece === '♞') {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([rowOffset, colOffset]) => {
            const targetRow = row + rowOffset;
            const targetCol = col + colOffset;
            if (!squareInBounds(targetRow, targetCol)) {
                return;
            }

            const targetSquare = getSquare(targetRow, targetCol);
            const targetPiece = targetSquare.textContent;
            if (!targetPiece) {
                moves.push({ row: targetRow, col: targetCol, isCapture: false });
                return;
            }

            if ((isWhite && isBlackPiece(targetPiece)) || (!isWhite && isWhitePiece(targetPiece))) {
                moves.push({ row: targetRow, col: targetCol, isCapture: true });
            }
        });

        return moves;
    }

    if (piece === '♔' || piece === '♚') {
        const kingMoves = [
            [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]
        ];

        kingMoves.forEach(([rowOffset, colOffset]) => {
            const targetRow = row + rowOffset;
            const targetCol = col + colOffset;
            if (!squareInBounds(targetRow, targetCol)) {
                return;
            }

            const targetSquare = getSquare(targetRow, targetCol);
            const targetPiece = targetSquare.textContent;
            if (!targetPiece) {
                moves.push({ row: targetRow, col: targetCol, isCapture: false });
                return;
            }

            if ((isWhite && isBlackPiece(targetPiece)) || (!isWhite && isWhitePiece(targetPiece))) {
                moves.push({ row: targetRow, col: targetCol, isCapture: true });
            }
        });
    }

    return moves;
}

function highlightAvailableMoves() {
    clearMoveHighlights();
    if (!selectedPiece || !selectedSquare) {
        return;
    }

    const legalMoves = getPieceMoves(selectedPiece, selectedSquare.row, selectedSquare.col);
    legalMoves.forEach(move => {
        const moveSquare = getSquare(move.row, move.col);
        if (moveSquare) {
            moveSquare.classList.add(move.isCapture ? 'capture-target' : 'move-target');
        }
    });
}

function toggleSelection(row, col) {
    const square = getSquare(row, col);
    if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
        selectedSquare.classList.remove('selected');
        selectedPiece = null;
        selectedSquare = null;
        clearMoveHighlights();
        return;
    }

    if (square.textContent && isTurnValid(square.textContent)) {
        if (selectedSquare) {
            selectedSquare.classList.remove('selected');
        }
        selectedPiece = square.textContent;
        selectedSquare = square;
        square.classList.add('selected');
        highlightAvailableMoves();
    }
}

function selectSquare(row, col) {
    const square = getSquare(row, col);

    if (selectedPiece) {
        if (movePiece(row, col)) {
            return;
        }

        if (square.textContent && isTurnValid(square.textContent)) {
            toggleSelection(row, col);
            return;
        }

        selectedSquare.classList.remove('selected');
        selectedPiece = null;
        selectedSquare = null;
        clearMoveHighlights();
        return;
    }

    if (square.textContent && isTurnValid(square.textContent)) {
        toggleSelection(row, col);
    }
}

function ValidMove(piece, startSquare, targetRow, targetCol) {
    const moves = getPieceMoves(piece, startSquare.row, startSquare.col);
    return moves.some(move => move.row === targetRow && move.col === targetCol);
}

function movePiece(row, col) {
    const targetSquare = getSquare(row, col);
    if (!selectedPiece || !selectedSquare) {
        return false;
    }

    if (selectedSquare.row === row && selectedSquare.col === col) {
        return false;
    }

    if (!ValidMove(selectedPiece, selectedSquare, row, col)) {
        return false;
    }

    const capturedValue = targetSquare.textContent;
    moveHistory.push({
        from: selectedSquare.id,
        to: targetSquare.id,
        piece: selectedPiece,
        captured: capturedValue,
        notation: `${pieceNames[selectedPiece]} ${formatSquare(selectedSquare.row, selectedSquare.col)} to ${formatSquare(row, col)}`
    });

    redoHistory = [];

    if (capturedValue) {
        const captureOwner = isWhitePiece(selectedPiece) ? 'black' : 'white';
        capturedPieces[captureOwner].push(capturedValue);
    }

    targetSquare.textContent = selectedPiece;
    selectedSquare.textContent = '';
    selectedSquare.classList.remove('selected');
    clearMoveHighlights();

    selectedPiece = null;
    selectedSquare = null;
    isWhiteTurn = !isWhiteTurn;
    updateButtonStates();
    updateStatusBar();
    renderCapturedPieces();
    renderMoveLog();
    return true;
}

function updateStatusBar() {
    statusBar.textContent = `${isWhiteTurn ? 'White' : 'Black'} to move`;
}

function renderCapturedPieces() {
    const whiteCaptures = capturedPieces.white.map(piece => `<span class="capture-group">${piece}</span>`).join('');
    const blackCaptures = capturedPieces.black.map(piece => `<span class="capture-group">${piece}</span>`).join('');

    capturedPiecesEl.innerHTML = `
        <div class="capture-group"><strong>White</strong> ${whiteCaptures}</div>
        <div class="capture-group"><strong>Black</strong> ${blackCaptures}</div>
    `;
}

function renderMoveLog() {
    const lastMoves = moveHistory.slice(-12);
    moveLogEl.innerHTML = lastMoves.map(move => `<li>${move.notation}</li>`).join('');
}

function undoMove() {
    const lastMove = moveHistory.pop();
    if (!lastMove) {
        return;
    }

    const fromSquare = document.getElementById(lastMove.from);
    const toSquare = document.getElementById(lastMove.to);
    fromSquare.textContent = lastMove.piece;
    toSquare.textContent = lastMove.captured;

    if (lastMove.captured) {
        const captureOwner = isWhitePiece(lastMove.piece) ? 'black' : 'white';
        capturedPieces[captureOwner].pop();
    }

    redoHistory.push(lastMove);
    isWhiteTurn = !isWhiteTurn;
    updateButtonStates();
    updateStatusBar();
    renderCapturedPieces();
    renderMoveLog();
}

function redoMove() {
    const lastUndo = redoHistory.pop();
    if (!lastUndo) {
        return;
    }

    const fromSquare = document.getElementById(lastUndo.from);
    const toSquare = document.getElementById(lastUndo.to);
    toSquare.textContent = lastUndo.piece;
    fromSquare.textContent = '';

    if (lastUndo.captured) {
        const captureOwner = isWhitePiece(lastUndo.piece) ? 'black' : 'white';
        capturedPieces[captureOwner].push(lastUndo.captured);
    }

    moveHistory.push(lastUndo);
    isWhiteTurn = !isWhiteTurn;
    updateButtonStates();
    updateStatusBar();
    renderCapturedPieces();
    renderMoveLog();
}

function updateButtonStates() {
    undoButton.disabled = moveHistory.length === 0;
    redoButton.disabled = redoHistory.length === 0;
}

resetButton.addEventListener('click', createBoard);
undoButton.addEventListener('click', undoMove);
redoButton.addEventListener('click', redoMove);

createBoard();
