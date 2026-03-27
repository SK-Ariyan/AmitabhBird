// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 124;
let birdHeight = 70;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg = new Image();

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// sounds (FIXED PATHS)
let bgMusic = new Audio("static/sound/pan1.wav");
bgMusic.loop = true;
bgMusic.volume = 0.5;

let hitSound = new Audio("static/sound/aaag.wav");
hitSound.volume = 0.9;

// start music on first key press
document.addEventListener("keydown", () => {
    bgMusic.play().catch(() => {});
});

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg = new Image();
let bottomPipeImg = new Image();

// physics
let velocityX = -3;
let velocityY = 1;
let gravity = 0.3;

let gameOver = false;
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // load images (FIXED PATHS)
    birdImg.src = "static/images/AmitFace.png";
    topPipeImg.src = "static/images/fire.png";
    bottomPipeImg.src = "static/images/fireBottom.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBird);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    // bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    // draw bird ONLY if loaded
    if (birdImg.complete) {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        // draw pipes safely
        if (pipe.img.complete) {
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // remove old pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);

        bgMusic.pause();
        bgMusic.currentTime = 0;

        hitSound.play().catch(() => {});
    }
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        velocityY = -6;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    let padding = 44;
    let paddingBase = 55;

    return (
        a.x < b.x + b.width - paddingBase &&
        a.x + a.width > b.x + paddingBase &&
        a.y < b.y + b.height - padding &&
        a.y + a.height > b.y + padding
    );
}
