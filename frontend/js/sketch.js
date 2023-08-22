// THIS IS NOT A GAME OF CHESS!
// It's a simplified version, where we have a 5x5 board and only 20 pieces.
// - The game ends when one of the kings is captured or when there are no more valid moves.
// - En-passant, castling, and pawn two-step moves are not allowed.
// - Pawns may only promote to queens.
// - The game is a tie if there are no more valid moves, there are only two kings left, or the turn count is greater than 50.
// - The two AIs use depth-limited (only 4) minimax with alpha-beta pruning. When the board is repeated, the heuristic will be adjusted to a random value.
// - The AI will make random moves for the first two turns.
// - The game may end early if the AI predicts a win/loss/tie.
let currWidth = window.innerWidth;
let currHeight = window.innerHeight;

import { sketch } from "p5js-wrapper";

let spritesheet; // path to sprite: /assets/spritesheet.png
sketch.preload = () => {
  spritesheet = loadImage("assets/spritesheet.png");
};

const PAWN = 0;
const ROOK = 1;
const KNIGHT = 2;
const BISHOP = 3;
const QUEEN = 4;
const KING = 5;

// white is bottom, black is top
const WHITE = 0;
const BLACK = 1;

// game status
const GAME_ONGOING = 0;
const GAME_ENEMY_WINS = -1;
const GAME_FRIENDLY_WINS = 1;
const GAME_TIE = 2;

function drawPiece(r, c, color, type) {
  let cellSize = height / 5;
  let pieceSize = cellSize * 1;
  let xOffset = (cellSize - pieceSize) / 2;
  let yOffset = (cellSize - pieceSize) / 2;

  let x = c * cellSize + xOffset;
  let y = r * cellSize + yOffset;
  let spriteX = 0;
  let spriteY = 0;
  if (color == WHITE) {
    spriteY = 0;
  } else {
    spriteY = 1;
  }
  switch (type) {
    case KING:
      spriteX = 0;
      break;
    case QUEEN:
      spriteX = 1;
      break;
    case BISHOP:
      spriteX = 2;
      break;
    case KNIGHT:
      spriteX = 3;
      break;
    case ROOK:
      spriteX = 4;
      break;
    case PAWN:
      spriteX = 5;
      break;
  }
  const imgSize = 212.5;
  image(
    spritesheet,
    x,
    y,
    pieceSize,
    pieceSize,
    spriteX * imgSize,
    spriteY * imgSize,
    imgSize,
    imgSize
  );
}

function changeStatus(message) {
  document.getElementById("chess-status").innerHTML = message;
}

let turn;
let currentBoard;
let turns;
let boardWindow;
let repeated;
function initGame() {
  turns = 0;
  turn = [WHITE, BLACK][Math.floor(Math.random() * 2)];
  boardWindow = [];
  repeated = false;
  currentBoard = [
    [
      [BLACK, KING],
      [BLACK, QUEEN],
      [BLACK, BISHOP],
      [BLACK, KNIGHT],
      [BLACK, ROOK],
    ],
    [
      [BLACK, PAWN],
      [BLACK, PAWN],
      [BLACK, PAWN],
      [BLACK, PAWN],
      [BLACK, PAWN],
    ],
    [null, null, null, null, null],
    [
      [WHITE, PAWN],
      [WHITE, PAWN],
      [WHITE, PAWN],
      [WHITE, PAWN],
      [WHITE, PAWN],
    ],
    [
      [WHITE, ROOK],
      [WHITE, KNIGHT],
      [WHITE, BISHOP],
      [WHITE, QUEEN],
      [WHITE, KING],
    ],
  ];
}

const pieceEval = [1, 5, 3, 3, 9, 0];

function heuristic(color, board) {
  let foundEnemyKing = false;
  let foundFriendlyKing = false;
  let pieceCount = 0;
  let score = 0;

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      let piece = board[r][c];
      if (piece != null) {
        if (piece[1] == KING) {
          if (piece[0] == color) {
            foundFriendlyKing = true;
          } else {
            foundEnemyKing = true;
          }
        }
        if (piece[0] == color) {
          score += pieceEval[piece[1]];
        } else {
          score -= pieceEval[piece[1]];
        }
        pieceCount++;
      }
    }
  }

  if (repeated) {
    // randomize score if the board is repeating
    score = (Math.floor(Math.random() * 3) - 1) * (pieceCount / 2);
  }

  if (!foundFriendlyKing) {
    return [GAME_ENEMY_WINS, score]; // enemy wins
  } else if (!foundEnemyKing) {
    return [GAME_FRIENDLY_WINS, score]; // friendly wins
  } else if (pieceCount == 2) {
    return [GAME_TIE, score]; // tie
  } else {
    return [GAME_ONGOING, score]; // no winner
  }
}

function validMoves(type, color, r, c, board) {
  let moves = [];

  // Helper function to check if a position is within the board.
  const isInsideBoard = (r, c) => {
    return r >= 0 && r < 5 && c >= 0 && c < 5;
  };

  switch (type) {
    case PAWN:
      let forward = color === WHITE ? -1 : 1;
      if (isInsideBoard(r + forward, c) && !board[r + forward][c]) {
        moves.push([r + forward, c]);
      }
      if (
        isInsideBoard(r + forward, c + 1) &&
        board[r + forward][c + 1] &&
        board[r + forward][c + 1][0] !== color
      ) {
        moves.push([r + forward, c + 1]);
      }
      if (
        isInsideBoard(r + forward, c - 1) &&
        board[r + forward][c - 1] &&
        board[r + forward][c - 1][0] !== color
      ) {
        moves.push([r + forward, c - 1]);
      }
      break;

    case ROOK:
      // Horizontal and vertical
      const directions = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ];
      for (let dir of directions) {
        let nr = r,
          nc = c;
        while (true) {
          nr += dir[0];
          nc += dir[1];
          if (!isInsideBoard(nr, nc)) break;
          if (board[nr][nc]) {
            if (board[nr][nc][0] !== color) moves.push([nr, nc]);
            break;
          }
          moves.push([nr, nc]);
        }
      }
      break;

    case KNIGHT:
      const knightMoves = [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-2, -1],
        [-1, -2],
        [1, -2],
        [2, -1],
      ];
      for (let move of knightMoves) {
        let nr = r + move[0];
        let nc = c + move[1];
        if (
          isInsideBoard(nr, nc) &&
          (!board[nr][nc] || board[nr][nc][0] !== color)
        ) {
          moves.push([nr, nc]);
        }
      }
      break;

    case BISHOP:
      // Diagonal moves
      const diagonalDirections = [
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ];
      for (let dir of diagonalDirections) {
        let nr = r,
          nc = c;
        while (true) {
          nr += dir[0];
          nc += dir[1];
          if (!isInsideBoard(nr, nc)) break;
          if (board[nr][nc]) {
            if (board[nr][nc][0] !== color) moves.push([nr, nc]);
            break;
          }
          moves.push([nr, nc]);
        }
      }
      break;

    case QUEEN:
      // Combination of Rook and Bishop moves
      const queenDirections = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ];
      for (let dir of queenDirections) {
        let nr = r,
          nc = c;
        while (true) {
          nr += dir[0];
          nc += dir[1];
          if (!isInsideBoard(nr, nc)) break;
          if (board[nr][nc]) {
            if (board[nr][nc][0] !== color) moves.push([nr, nc]);
            break;
          }
          moves.push([nr, nc]);
        }
      }
      break;

    case KING:
      const kingDirections = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ];
      for (let dir of kingDirections) {
        let nr = r + dir[0];
        let nc = c + dir[1];
        if (
          isInsideBoard(nr, nc) &&
          (!board[nr][nc] || board[nr][nc][0] !== color)
        ) {
          moves.push([nr, nc]);
        }
      }
      break;
  }

  return moves;
}

function allValidMoves(color, board) {
  let moves = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      let piece = board[r][c];
      if (piece != null && piece[0] == color) {
        let from = [r, c];
        let foundMoves = validMoves(piece[1], piece[0], r, c, board);
        for (let move of foundMoves) {
          moves.push([from, move]);
        }
      }
    }
  }
  return moves;
}

function oppositeColor(color) {
  return color === WHITE ? BLACK : WHITE;
}

function colorName(color) {
  return color === WHITE ? "White" : "Black";
}

function applyMove(move, board) {
  let from = move[0];
  let to = move[1];
  board[to[0]][to[1]] = board[from[0]][from[1]];
  board[from[0]][from[1]] = null;
  // promote PAWN to QUEEN if it reaches the other side
  if (board[to[0]][to[1]][1] == PAWN && (to[0] == 0 || to[0] == 4)) {
    board[to[0]][to[1]][1] = QUEEN;
  }
}

function addToBoardWindow(board) {
  if (boardWindow.length >= 4) {
    boardWindow.shift();
  }
  boardWindow.push(board);
}

function isRepeating(board) {
  if (boardWindow.length < 4) {
    return false;
  }

  // check if the current board is the same as the last 3 boards
  let currJson = JSON.stringify(board);
  let repeated = false;
  for (let i = 0; i < boardWindow.length; i++) {
    let prevJson = JSON.stringify(boardWindow[i]);
    if (prevJson == currJson) {
      repeated = true;
      break;
    }
  }

  return repeated;
}

function makeMove(board, move) {
  // deep clone
  let newBoard = JSON.parse(JSON.stringify(board));
  applyMove(move, newBoard);
  return newBoard;
}

function switchTurn() {
  turn = turn == WHITE ? BLACK : WHITE;
}

function orderMoves(board, moves) {
  moves.sort((a, b) => {
    let [ar, ac] = a[1];
    let [br, bc] = b[1];
    // Get the value of the piece being captured by move a
    let aPiece = board[ar][ac];
    let aValue = aPiece !== null ? pieceEval[aPiece[1]] : 0;

    // Get the value of the piece being captured by move b
    let bPiece = board[br][bc];
    let bValue = bPiece !== null ? pieceEval[bPiece[1]] : 0;

    return bValue - aValue; // Sort in descending order based on captured piece value
  });
  return moves;
}

let minimaxCalls = 0;
function minimax(
  color,
  board,
  move,
  depth,
  maximizingPlayer,
  alpha = -Infinity,
  beta = Infinity
) {
  minimaxCalls++;
  let [stat, h] = heuristic(color, board);

  // Base cases for depth or game-over states
  if (depth <= 0 || stat != GAME_ONGOING) {
    return { score: h, stat: stat, move: move };
  }

  let moves = orderMoves(board, allValidMoves(color, board));
  if (moves.length === 0) {
    return { score: h, stat: stat, move: null };
  }

  // Maximizing player logic
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    let bestMoveForMax = moves[0];

    for (let currentMove of moves) {
      let newBoard = makeMove(board, currentMove);
      let result = minimax(
        oppositeColor(color),
        newBoard,
        currentMove,
        depth - 1,
        false,
        alpha,
        beta
      );

      if (result.stat == GAME_FRIENDLY_WINS) {
        maxEval = Infinity; // Assign the highest possible value to represent a win.
        bestMoveForMax = currentMove;
        break; // No need to look further, since we've found a winning move.
      } else if (result.score > maxEval) {
        maxEval = result.score;
        bestMoveForMax = currentMove;
      }

      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break; // Prune
    }

    return {
      score: maxEval,
      move: bestMoveForMax,
      stat: maxEval == h ? stat : GAME_ONGOING, // If score didn't change, return original stat
    };
  }

  // Minimizing player logic
  else {
    let minEval = Infinity;
    let bestMoveForMin = moves[0];

    for (let currentMove of moves) {
      let newBoard = makeMove(board, currentMove);
      let result = minimax(
        oppositeColor(color),
        newBoard,
        currentMove,
        depth - 1,
        true,
        alpha,
        beta
      );

      if (result.stat == GAME_ENEMY_WINS) {
        minEval = -Infinity; // Assign the lowest possible value to represent a loss.
        bestMoveForMin = currentMove;
        break; // No need to look further, since we've found a losing move.
      } else if (result.score < minEval) {
        minEval = result.score;
        bestMoveForMin = currentMove;
      }

      beta = Math.min(beta, result.score);
      if (beta <= alpha) break; // Prune
    }

    return {
      score: minEval,
      move: bestMoveForMin,
      stat: minEval == h ? stat : GAME_ONGOING, // If score didn't change, return original stat
    };
  }
}

function randomMove(color) {
  let [stat, h] = heuristic(color, currentBoard);
  switch (stat) {
    case GAME_FRIENDLY_WINS:
      return;
    case GAME_ENEMY_WINS:
      return;
  }

  let moves = allValidMoves(color, currentBoard);
  let idx = Math.floor(Math.random() * moves.length);
  let move = moves[idx];
  applyMove(move, currentBoard);
}

function resizeBgIfNeeded() {
  // if on mobile, make the ratio larger
  if (window.innerWidth < 600) {
    widthRatio = 2;
  } else {
    widthRatio = 5;
  }
  if (currWidth != window.innerWidth || currHeight != window.innerHeight) {
    currWidth = window.innerWidth;
    currHeight = window.innerHeight;
    resizeCanvas(currWidth / widthRatio, currWidth / widthRatio);
  }
}

function drawBoard() {
  changeStatus(`<font style='opacity: 0;'>.</font>`);
  clear();
  const size = 5;
  // draw tiles
  for (let i1 = 0, d = 1; i1 < size; i1++) {
    for (let i2 = 0; i2 <= 10; i2++) {
      fill(i2 % 2 == 0 ? 255 : 75);
      rect(
        i1 * (height / size),
        i2 * (height / size) - d * (height / size),
        height / size,
        height / size
      );
    }
    if (i1 % 2 != 0) {
      d = 1;
    } else {
      d = 0;
    }
  }

  // draw pieces
  for (let r = 0; r < currentBoard.length; r++) {
    for (let c = 0; c < currentBoard[0].length; c++) {
      let piece = currentBoard[r][c];
      if (piece != null) drawPiece(r, c, piece[0], piece[1]);
    }
  }
}

function gameEnd(stat) {
  console.log(stat);
  switch (stat) {
    case GAME_FRIENDLY_WINS:
      changeStatus(`${colorName(turn)} wins!`);
      break;
    case GAME_ENEMY_WINS:
      changeStatus(`${colorName(oppositeColor(turn))} wins!`);
      break;
    case GAME_TIE:
      changeStatus(`It's a tie!`);
      break;
    case GAME_ONGOING:
      changeStatus(`${colorName(turn)} checkmated!`);
      break;
  }
  frameRate(0.15);
  initGame();
}

let widthRatio = 5;

sketch.setup = () => {
  // if on mobile, make the ratio larger
  if (window.innerWidth < 600) {
    widthRatio = 2;
  }
  let canvas = createCanvas(currWidth / widthRatio, currWidth / widthRatio);
  const chess = document.getElementById("chess");
  canvas.parent("chess");

  // add text to chess
  let message = document.createElement("div");
  message.id = "chess-msg";
  message.className = "chess-msg";
  const link =
    "https://github.com/cassanof/personalwebsite/blob/b898a462ed00133728cb4d67632171ed00973189/frontend/js/sketch.js#L1";
  message.innerHTML = `<a href="${link}" class="link-offset-2 link-underline-success" target="_blank"><font color="#84a463">This is NOT chess</font></a>`;
  // center text horizontally
  // message.style.transform = "translateX(15%)";

  chess.appendChild(message);

  // border around canvas
  canvas.style("border", "5px solid #84a463");
  // make it relative to the parent
  canvas.style("position", "relative");

  noStroke();
  initGame();
  drawBoard();
};

sketch.draw = () => {
  frameRate(5);
  resizeBgIfNeeded();
  drawBoard();

  // first two moves are random
  if (turns < 2) {
    randomMove(turn);
    switchTurn();
    turns++;
    return;
  } else if (turns >= 100) {
    // after 100 turns, the game is a tie
    console.log("Tie due to 100 turns");
    gameEnd(GAME_TIE);
    return;
  }

  minimaxCalls = 0;
  const result = minimax(turn, currentBoard, null, 4, true);
  console.log(`Minimax calls: ${minimaxCalls}`);

  if (result.move == null) {
    gameEnd(result.stat);
    return;
  }

  applyMove(result.move, currentBoard);
  let clonedBoard = JSON.parse(JSON.stringify(currentBoard));
  if (isRepeating(currentBoard)) {
    repeated = true;
  } else {
    repeated = false;
  }
  addToBoardWindow(clonedBoard);
  switchTurn();
  turns++;
};
