const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');
const restartButton = document.getElementById('restart-button');

const paddle = { width: 14, height: 100, speed: 7 };
const ball = { size: 14, speed: 6 };
const keys = { up: false, down: false };
let playerPaddle;
let computerPaddle;
let gameBall;
let playerScore = 0;
let computerScore = 0;
let paused = false;
let animationFrame;

function resetBall(direction = Math.random() > 0.5 ? 1 : -1) {
  gameBall = {
    x: canvas.width / 2 - ball.size / 2,
    y: canvas.height / 2 - ball.size / 2,
    velocityX: direction * ball.speed,
    velocityY: (Math.random() * 4 - 2) || 1
  };
}

function resetGame() {
  playerScore = 0;
  computerScore = 0;
  playerPaddle = { x: 24, y: canvas.height / 2 - paddle.height / 2 };
  computerPaddle = { x: canvas.width - 24 - paddle.width, y: canvas.height / 2 - paddle.height / 2 };
  resetBall();
  updateScoreboard();
  paused = false;
}

function updateScoreboard() {
  playerScoreElement.textContent = playerScore;
  computerScoreElement.textContent = computerScore;
}

function clampPaddle(paddleToClamp) {
  paddleToClamp.y = Math.max(0, Math.min(canvas.height - paddle.height, paddleToClamp.y));
}

function movePlayer() {
  if (keys.up) playerPaddle.y -= paddle.speed;
  if (keys.down) playerPaddle.y += paddle.speed;
  clampPaddle(playerPaddle);
}

function moveComputer() {
  const target = gameBall.y + ball.size / 2 - paddle.height / 2;
  const difference = target - computerPaddle.y;
  computerPaddle.y += Math.sign(difference) * Math.min(Math.abs(difference), paddle.speed * 0.72);
  clampPaddle(computerPaddle);
}

function collidesWithPaddle(paddleToCheck) {
  return gameBall.x < paddleToCheck.x + paddle.width &&
    gameBall.x + ball.size > paddleToCheck.x &&
    gameBall.y < paddleToCheck.y + paddle.height &&
    gameBall.y + ball.size > paddleToCheck.y;
}

function bounceOffPaddle(paddleToCheck, direction) {
  const paddleCenter = paddleToCheck.y + paddle.height / 2;
  const ballCenter = gameBall.y + ball.size / 2;
  const angle = (ballCenter - paddleCenter) / (paddle.height / 2);
  const currentSpeed = Math.min(Math.hypot(gameBall.velocityX, gameBall.velocityY) * 1.04, 11);
  gameBall.velocityX = direction * currentSpeed;
  gameBall.velocityY = angle * currentSpeed;
  gameBall.x = direction > 0 ? paddleToCheck.x + paddle.width : paddleToCheck.x - ball.size;
}

function update() {
  if (paused) return;

  movePlayer();
  moveComputer();
  gameBall.x += gameBall.velocityX;
  gameBall.y += gameBall.velocityY;

  if (gameBall.y <= 0 || gameBall.y + ball.size >= canvas.height) {
    gameBall.velocityY *= -1;
    gameBall.y = Math.max(0, Math.min(canvas.height - ball.size, gameBall.y));
  }

  if (gameBall.velocityX < 0 && collidesWithPaddle(playerPaddle)) {
    bounceOffPaddle(playerPaddle, 1);
  } else if (gameBall.velocityX > 0 && collidesWithPaddle(computerPaddle)) {
    bounceOffPaddle(computerPaddle, -1);
  }

  if (gameBall.x + ball.size < 0) {
    computerScore += 1;
    updateScoreboard();
    resetBall(-1);
  } else if (gameBall.x > canvas.width) {
    playerScore += 1;
    updateScoreboard();
    resetBall(1);
  }
}

function draw() {
  context.fillStyle = '#171c25';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.setLineDash([10, 15]);
  context.strokeStyle = '#364052';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = '#62e6a7';
  context.fillRect(playerPaddle.x, playerPaddle.y, paddle.width, paddle.height);
  context.fillStyle = '#f58b8b';
  context.fillRect(computerPaddle.x, computerPaddle.y, paddle.width, paddle.height);
  context.fillStyle = '#f4f7fb';
  context.fillRect(gameBall.x, gameBall.y, ball.size, ball.size);

  if (paused) {
    context.fillStyle = 'rgba(16, 19, 26, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#f4f7fb';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  }
}

function gameLoop() {
  update();
  draw();
  animationFrame = requestAnimationFrame(gameLoop);
}

function setPlayerPosition(event) {
  const bounds = canvas.getBoundingClientRect();
  playerPaddle.y = (event.clientY - bounds.top) * (canvas.height / bounds.height) - paddle.height / 2;
  clampPaddle(playerPaddle);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.code === 'Space') event.preventDefault();
  if (event.key === 'ArrowUp') keys.up = true;
  if (event.key === 'ArrowDown') keys.down = true;
  if (event.code === 'Space') paused = !paused;
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp') keys.up = false;
  if (event.key === 'ArrowDown') keys.down = false;
});

canvas.addEventListener('mousemove', setPlayerPosition);
restartButton.addEventListener('click', resetGame);

resetGame();
cancelAnimationFrame(animationFrame);
gameLoop();
