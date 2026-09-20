function squareInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isWhitePiece(piece) {
    return piece === '♖' || piece === '♘' || piece === '♗' || piece === '♕' || piece === '♔' || piece === '♙';
}

function isBlackPiece(piece) {
    return piece === '♜' || piece === '♞' || piece === '♝' || piece === '♛' || piece === '♚' || piece === '♟';
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