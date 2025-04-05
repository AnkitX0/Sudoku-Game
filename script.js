let fullBoard = []; // solution
let puzzleBoard = []; // puzzle shown to user
let solutionGrid = []; // stored solution for showAnswer
let startTime = null;
let timerInterval;

function generateFullBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    const firstRow = shuffle([...Array(9).keys()].map(n => n + 1));
    board[0] = firstRow;
    if (solve(board)) {
        return board;
    }
    return generateFullBoard(); // Fallback
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) return false;
        }
    }
    return true;
}

function solve(board) {
    const empty = findEmpty(board);
    if (!empty) return true;
    
    const [row, col] = empty;
    const numbers = shuffle([...Array(9).keys()].map(n => n + 1));
    
    for (let num of numbers) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

function findEmpty(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) return [row, col];
        }
    }
    return null;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makePuzzle(fullBoard, difficulty) {
    const puzzle = fullBoard.map(row => [...row]);
    const cellsToRemove = difficulty === 'easy' ? 40 : 
                         difficulty === 'medium' ? 50 : 60;
    const positions = [];
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            positions.push([i, j]);
        }
    }
    
    shuffle(positions);
    let removed = 0;
    const tempBoard = fullBoard.map(row => [...row]);
    
    for (let [row, col] of positions) {
        if (removed >= cellsToRemove) break;
        
        const original = puzzle[row][col];
        puzzle[row][col] = 0;
        tempBoard[row][col] = 0;
        
        if (!hasUniqueSolution(tempBoard)) {
            puzzle[row][col] = original;
        } else {
            removed++;
        }
    }
    
    return puzzle;
}

function hasUniqueSolution(board) {
    const temp = board.map(row => [...row]);
    let solutions = 0;
    
    function countSolutions(b) {
        const empty = findEmpty(b);
        if (!empty) {
            solutions++;
            return solutions > 1;
        }
        
        const [row, col] = empty;
        for (let num = 1; num <= 9; num++) {
            if (isValid(b, row, col, num)) {
                b[row][col] = num;
                if (countSolutions(b)) return true;
                b[row][col] = 0;
            }
        }
        return false;
    }
    
    countSolutions(temp);
    return solutions === 1;
}

function generateNewGame() {
    const difficulty = document.getElementById('difficulty').value;
    fullBoard = generateFullBoard();
    solutionGrid = fullBoard.map(row => [...row]);
    puzzleBoard = makePuzzle(fullBoard, difficulty);
    renderBoard();
    resetTimer();
    document.getElementById("message").textContent = '';
}

function renderBoard() {
    const boardContainer = document.getElementById("sudoku-board");
    boardContainer.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("maxlength", "1");

            if (puzzleBoard[row][col] !== 0) {
                input.value = puzzleBoard[row][col];
                input.readOnly = true;
            } else {
                input.dataset.row = row;
                input.dataset.col = col;
                input.addEventListener("input", handleInput);
            }

            boardContainer.appendChild(input);
        }
    }
}

function handleInput(e) {
    const val = e.target.value;
    const row = e.target.dataset.row;
    const col = e.target.dataset.col;

    if (!/^[1-9]$/.test(val)) {
        e.target.value = "";
        return;
    }

    puzzleBoard[row][col] = parseInt(val);
    if (!startTime) startTimer();
}

function checkSolution() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (puzzleBoard[row][col] !== fullBoard[row][col]) {
                document.getElementById("message").textContent = "Incorrect! Keep trying.";
                document.getElementById("message").style.color = "red";
                return;
            }
        }
    }
    document.getElementById("message").textContent = "You did it! 🎉";
    document.getElementById("message").style.color = "green";
    clearInterval(timerInterval);
}

function showAnswer() {
    const inputs = document.querySelectorAll('#sudoku-board input');
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const index = i * 9 + j;
            inputs[index].value = solutionGrid[i][j];
            inputs[index].readOnly = true;
            inputs[index].style.backgroundColor = '#e0f7fa';
        }
    }
    
    clearInterval(timerInterval);
    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = 
        `✅ Solved (via Show Answer) in ${minutes}:${seconds}`;
    
    const msg = document.getElementById('message');
    msg.textContent = `🧠 Answer revealed!`;
    msg.style.color = "#00796b";
}

function startTimer() {
    if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `⏱ Time: ${minutes}:${seconds}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    startTime = null;
    document.getElementById('timer').textContent = "⏱ Time: 00:00";
}

window.onload = () => generateNewGame();
// Add this function to create and show the celebration popup
function showCelebrationPopup() {
  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'celebration-popup';
  popup.innerHTML = `
      <div class="popup-content">
          <h2>You Did It! 🎉</h2>
          <p>Congratulations on solving the Sudoku!</p>
          <button onclick="closeCelebrationPopup()">Close</button>
      </div>
  `;
  document.body.appendChild(popup);

  // Add confetti effect
  confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
  });

  // Auto-close after 5 seconds
  setTimeout(closeCelebrationPopup, 5000);
}

// Function to close the popup
function closeCelebrationPopup() {
  const popup = document.getElementById('celebration-popup');
  if (popup) {
      popup.style.animation = 'fadeOut 0.5s ease';
      setTimeout(() => popup.remove(), 500);
  }
}

// Updated checkSolution function
function checkSolution() {
  for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
          if (puzzleBoard[row][col] !== fullBoard[row][col]) {
              document.getElementById("message").textContent = "Incorrect! Keep trying.";
              document.getElementById("message").style.color = "red";
              return;
          }
      }
  }
  // Success case
  document.getElementById("message").textContent = "";
  clearInterval(timerInterval);
  showCelebrationPopup();
}