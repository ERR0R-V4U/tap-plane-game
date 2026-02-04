const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// UI
const startScreen = document.getElementById("startScreen");
const gameOverBox = document.getElementById("gameOver");
const finalText = document.getElementById("finalText");
const leaderboardUI = document.getElementById("leaderboard");

// Assets
const planeImg = new Image();
planeImg.src = "assets/plane.png";

const poleImg = new Image();
poleImg.src = "assets/pole.png";

// Sounds
const bgSound = new Audio("sounds/bg.wav");
bgSound.loop = true;

const flySound = new Audio("sounds/fly.wav");
const crashSound = new Audio("sounds/crash.wav");

// Game variables
let plane, poles, score, running, playerName;

// Start game
function startGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("আগে নাম লিখুন");
    return;
  }
  startScreen.style.display = "none";
  init();
  bgSound.play();
  update();
}

function init() {
  plane = { x: 120, y: canvas.height/2, w: 80, h: 60, vel: 0 };
  poles = [];
  score = 0;
  running = true;
  gameOverBox.style.display = "none";
}

// Controls
addEventListener("click", jump);
addEventListener("touchstart", jump);

function jump() {
  if (!running) return;
  plane.vel = -11;
  flySound.currentTime = 0;
  flySound.play();
}

// Create poles
setInterval(() => {
  if (!running) return;
  let gap = 200;
  let top = Math.random() * (canvas.height / 2);

  poles.push({
    x: canvas.width,
    w: 90,
    top: top,
    bottom: canvas.height - top - gap,
    passed: false
  });
}, 2000);

// Game loop
function update() {
  if (!running) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Plane physics (smooth)
  plane.vel += 0.6;
  plane.y += plane.vel;
  ctx.drawImage(planeImg, plane.x, plane.y, plane.w, plane.h);

  // Poles
  poles.forEach(p => {
    p.x -= 4;

    ctx.drawImage(poleImg, p.x, p.top - poleImg.height, p.w, poleImg.height);
    ctx.drawImage(poleImg, p.x, canvas.height - p.bottom, p.w, poleImg.height);

    // Score count
    if (!p.passed && p.x + p.w < plane.x) {
      score++;
      p.passed = true;
    }

    // Collision
    if (
      plane.x < p.x + p.w &&
      plane.x + plane.w > p.x &&
      (plane.y < p.top ||
       plane.y + plane.h > canvas.height - p.bottom)
    ) endGame();
  });

  if (plane.y < 0 || plane.y + plane.h > canvas.height) endGame();

  // Score UI
  ctx.fillStyle = "#fff";
  ctx.font = "26px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  requestAnimationFrame(update);
}

// Game Over
function endGame() {
  running = false;
  bgSound.pause();
  crashSound.play();

  finalText.innerText = `আপনি মোট ${score}টা খুঁটি পার করেছেন`;
  saveScore();
  showLeaderboard();
  gameOverBox.style.display = "flex";
}

// Restart
function restartGame() {
  location.reload();
}

// Leaderboard
function saveScore() {
  let board = JSON.parse(localStorage.getItem("leaderboard")) || [];
  board.push({ name: playerName, score });
  board.sort((a,b) => b.score - a.score);
  board = board.slice(0,10);
  localStorage.setItem("leaderboard", JSON.stringify(board));
}

function showLeaderboard() {
  let board = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboardUI.innerHTML = "";
  board.forEach(p => {
    let li = document.createElement("li");
    li.innerText = `${p.name} — ${p.score}`;
    leaderboardUI.appendChild(li);
  });
}
