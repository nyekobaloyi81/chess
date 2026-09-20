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

const gameOverModal = document.getElementById('gameOverModal');
const gameOverMessageEl = document.getElementById('gameOverMessage');

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
let gameOver = false;
let winner = null;

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
    gameOver = false;
    winner = null;
    hideGameOverModal();
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
    if (gameOver) {
        return;
    }

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

function isMoveLegal(piece, startRow, startCol, targetRow, targetCol) {
    const startSquare = getSquare(startRow, startCol);
    const targetSquare = getSquare(targetRow, targetCol);
    const originalTargetPiece = targetSquare.textContent;

    startSquare.textContent = '';
    targetSquare.textContent = piece;

    const sideToCheck = isWhitePiece(piece) ? 'white' : 'black';
    const result = !isKingInCheck(sideToCheck);

    startSquare.textContent = piece;
    targetSquare.textContent = originalTargetPiece;

    return result;
}

function ValidMove(piece, startSquare, targetRow, targetCol) {
    const moves = getPieceMoves(piece, startSquare.row, startSquare.col);
    const isTargetMove = moves.some(move => move.row === targetRow && move.col === targetCol);
    if (!isTargetMove) {
        return false;
    }

    return isMoveLegal(piece, startSquare.row, startSquare.col, targetRow, targetCol);
}

function movePiece(row, col) {
    if (gameOver) {
        return false;
    }

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
    renderCapturedPieces();
    renderMoveLog();
    checkForCheckmate();
    updateStatusBar();
    return true;
}

function getKingPosition(isWhiteKing) {
    const kingSymbol = isWhiteKing ? '♔' : '♚';
    const squares = document.querySelectorAll('.square');

    for (const square of squares) {
        if (square.textContent === kingSymbol) {
            return { row: square.row, col: square.col };
        }
    }

    return null;
}

function isKingInCheck(color) {
    const isWhiteKing = color === 'white';
    const kingPosition = getKingPosition(isWhiteKing);

    if (!kingPosition) {
        return false;
    }

    const squares = document.querySelectorAll('.square');
    for (const square of squares) {
        const piece = square.textContent;
        if (!piece) {
            continue;
        }

        const isEnemyPiece = isWhiteKing ? isBlackPiece(piece) : isWhitePiece(piece);
        if (!isEnemyPiece) {
            continue;
        }

        const moves = getPieceMoves(piece, square.row, square.col);
        if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
            return true;
        }
    }

    return false;
}

function getLegalMovesForSide(teamColor) {
    const legalMoves = [];
    const squares = document.querySelectorAll('.square');

    for (const square of squares) {
        const piece = square.textContent;
        if (!piece) {
            continue;
        }

        const pieceColor = isWhitePiece(piece) ? 'white' : isBlackPiece(piece) ? 'black' : null;
        if (pieceColor !== teamColor) {
            continue;
        }

        const moves = getPieceMoves(piece, square.row, square.col);
        moves.forEach(move => {
            if (isMoveLegal(piece, square.row, square.col, move.row, move.col)) {
                legalMoves.push({ piece, from: square, to: getSquare(move.row, move.col), row: move.row, col: move.col });
            }
        });
    }

    return legalMoves;
}

function showGameOverModal(message) {
    gameOverMessageEl.textContent = message;
    gameOverModal.classList.remove('hidden');
}

function hideGameOverModal() {
    gameOverModal.classList.add('hidden');
}

function checkForCheckmate() {
    if (gameOver) {
        return true;
    }

    const sideToMove = isWhiteTurn ? 'white' : 'black';
    const isInCheck = isKingInCheck(sideToMove);
    const hasLegalMoves = getLegalMovesForSide(sideToMove).length > 0;

    if (isInCheck && !hasLegalMoves) {
        gameOver = true;
        winner = sideToMove === 'white' ? 'black' : 'white';
        showGameOverModal(`Checkmate — ${winner === 'white' ? 'White' : 'Black'} wins!`);
        return true;
    }

    return false;
}

function updateStatusBar() {
    if (gameOver) {
        statusBar.textContent = `Checkmate — ${winner === 'white' ? 'White' : 'Black'} wins`;
        return;
    }

    const sideToMove = isWhiteTurn ? 'White' : 'Black';
    const sideInCheck = isKingInCheck(isWhiteTurn ? 'white' : 'black');
    const checkText = sideInCheck ? ' - in check' : '';
    statusBar.textContent = `${sideToMove} to move${checkText}`;
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
document.getElementById('newGameButton').addEventListener('click', createBoard);

createBoard();
