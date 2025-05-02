class SudokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.difficulty = 'easy';
        this.selectedCell = null;
        this.draftMode = false;
        this.initializeDOM();
        this.setupEventListeners();
    }

    initializeDOM() {
        this.boardElement = document.getElementById('board');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameButton = document.getElementById('newGame');
        this.draftModeToggle = document.getElementById('draftMode');
        this.numberButtons = document.querySelectorAll('.num-btn');
        this.createBoard();
    }

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.difficultySelect.addEventListener('change', () => {
            this.difficulty = this.difficultySelect.value;
            this.startNewGame();
        });
        this.draftModeToggle.addEventListener('change', (e) => {
            this.draftMode = e.target.checked;
            this.updateDraftModeDisplay();
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.selectedCell) {
                if (e.key >= '1' && e.key <= '9') {
                    this.setNumber(parseInt(e.key));
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    this.clearCell();
                }
            }
        });

        this.numberButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.selectedCell) {
                    if (btn.classList.contains('clear')) {
                        this.clearCell();
                    } else {
                        this.setNumber(parseInt(btn.textContent));
                    }
                }
            });
        });
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if ((Math.floor(i/3) + Math.floor(j/3)) % 2 === 0) {
                    cell.style.backgroundColor = '#f8f9fa';
                }
                cell.addEventListener('click', () => this.selectCell(i, j));
                this.boardElement.appendChild(cell);
            }
        }
    }

    selectCell(row, col) {
        if (this.selectedCell) {
            this.selectedCell.element.classList.remove('selected');
        }
        const index = row * 9 + col;
        const cell = this.boardElement.children[index];
        if (!cell.classList.contains('fixed') || this.draftMode) {
            this.selectedCell = { row, col, element: cell };
            cell.classList.add('selected');
        }
    }

    setNumber(num) {
        if (!this.selectedCell) return;
        const { row, col, element } = this.selectedCell;
        
        // Si no está en modo draft, solo permitir colocar números en celdas vacías
        if (!this.draftMode && this.board[row][col] !== 0) {
            return;
        }

        if (!element.classList.contains('fixed')) {
            this.board[row][col] = num;
            element.textContent = num;
            
            element.classList.remove('correct', 'incorrect', 'draft-mode');
            
            if (this.draftMode) {
                element.classList.add('draft-mode');
                if (this.isValidMove(row, col, num)) {
                    if (num === this.solution[row][col]) {
                        element.classList.add('correct');
                    } else {
                        element.classList.add('incorrect');
                    }
                } else {
                    element.classList.add('incorrect');
                }
            }
            
            if (this.isBoardComplete()) {
                setTimeout(() => alert('¡Felicitaciones! Has completado el Sudoku.'), 100);
            }
        }
    }

    clearCell() {
        if (!this.selectedCell) return;
        const { row, col, element } = this.selectedCell;
        
        // Solo permitir borrar en modo draft o si la celda no tiene número
        if (!this.draftMode && this.board[row][col] !== 0) {
            return;
        }

        if (!element.classList.contains('fixed')) {
            this.board[row][col] = 0;
            element.textContent = '';
            element.classList.remove('correct', 'incorrect', 'draft-mode');
        }
    }

    isValidMove(row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.board[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row/3) * 3;
        const boxCol = Math.floor(col/3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (i !== row && j !== col && this.board[i][j] === num) return false;
            }
        }
        
        return true;
    }

    isBoardComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== this.solution[i][j]) return false;
            }
        }
        return true;
    }

    generateSudoku() {
        // Generate a solved sudoku board
        this.solveSudoku(this.solution);
        
        // Copy solution to current board
        this.board = this.solution.map(row => [...row]);
        
        // Remove numbers based on difficulty
        let cellsToRemove;
        switch(this.difficulty) {
            case 'easy':
                cellsToRemove = 40;
                break;
            case 'medium':
                cellsToRemove = 50;
                break;
            case 'hard':
                cellsToRemove = 60;
                break;
        }
        
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                cellsToRemove--;
            }
        }
    }

    solveSudoku(board) {
        const emptyCell = this.findEmptyCell(board);
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (let num of numbers) {
            if (this.isValidPlacement(board, row, col, num)) {
                board[row][col] = num;
                if (this.solveSudoku(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    findEmptyCell(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    isValidPlacement(board, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row/3) * 3;
        const boxCol = Math.floor(col/3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        
        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startNewGame() {
        this.generateSudoku();
        this.updateBoardDisplay();
    }

    updateBoardDisplay() {
        const cells = this.boardElement.children;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = cells[i * 9 + j];
                const value = this.board[i][j];
                cell.textContent = value || '';
                cell.classList.remove('fixed', 'correct', 'incorrect', 'draft-mode');
                if (value !== 0) {
                    cell.classList.add('fixed');
                }
            }
        }
    }

    updateDraftModeDisplay() {
        const cells = this.boardElement.children;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = cells[i * 9 + j];
                cell.classList.remove('draft-mode', 'correct', 'incorrect');
                
                if (this.draftMode && !cell.classList.contains('fixed')) {
                    const value = this.board[i][j];
                    if (value !== 0) {
                        cell.classList.add('draft-mode');
                        if (this.isValidMove(i, j, value)) {
                            if (value === this.solution[i][j]) {
                                cell.classList.add('correct');
                            } else {
                                cell.classList.add('incorrect');
                            }
                        } else {
                            cell.classList.add('incorrect');
                        }
                    }
                }
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SudokuGame();
    game.startNewGame();
});
