const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridsGrass = [
    [
        [0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 1],
        [0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 0, 0, 0],
        [2, 0, 0, 0, 0, 1, 1],
    ],
    [
        [1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 1],
        [2, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0],
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 1, 1, 0, 0],
        [1, 0, 0, 1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 1],
        [0, 0, 1, 0, 1, 1, 1, 0, 1],
        [0, 1, 1, 0, 1, 1, 1, 0, 1],
        [0, 1, 1, 0, 0, 1, 1, 0, 1],
        [0, 1, 1, 1, 0, 0, 0, 0, 0],
        [2, 0, 0, 1, 0, 1, 1, 0, 0],
        [1, 1, 0, 0, 0, 1, 1, 1, 0],
    ],
];

const grid = gridsGrass[Math.floor(Math.random() * 3)];

const gridWidth = grid[0].length;
const gridHeight = grid.length;
const cellSize = Math.min(canvas.width, canvas.height) / Math.max(gridWidth, gridHeight); // Adjust cellSize

const wallColor = '#52bb44';
const groundColor = '#8f5829';

let circleX = 0;
let circleY = 0;
const blockers = [];

// Animation variables
let targetX = circleX;
let targetY = circleY;
let animationProgress = 0;
const animationDuration = 300;
let startTime = 0;

// Load image
const playerImage = new Image();
playerImage.src = 'pokeball.png';

for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === 1) {
            blockers.push( { row, col });
        } else if (grid[row][col] === 2) {
            circleX = col;
            circleY = row;
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            if (grid[row][col] === 1) {
                ctx.fillStyle = wallColor;
                ctx.fillRect(col * cellSize, row * cellSize, cellSize + 1, cellSize + 1);
            } else {
                ctx.fillStyle = groundColor;
                ctx.fillRect(col * cellSize, row * cellSize, cellSize + 1, cellSize + 1);
            }
        }
    }

    const animatedX = circleX * cellSize + (targetX - circleX) * animationProgress * cellSize;
    const animatedY = circleY * cellSize + (targetY - circleY) * animationProgress * cellSize;

    ctx.drawImage(
        playerImage,
        animatedX,
        animatedY,
        cellSize,
        cellSize
    );
}

function moveCircle(dx, dy) {
    if (animationProgress > 0 && animationProgress < 1) return;
    targetX = circleX;
    targetY = circleY;

    while (true) {
        const newX = targetX + dx;
        const newY = targetY + dy;

        if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight && grid[newY][newX] !== 1) {
            targetX = newX;
            targetY = newY;
        } else {
            break;
        }
    }
    animationProgress = 0;
    startTime = 0;
    requestAnimationFrame(animateSlide);
}

function animateSlide(timestamp) {
    if (!startTime) {
        startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    animationProgress = Math.min(elapsed / animationDuration, 1);

    drawGrid();

    if (animationProgress < 1) {
        requestAnimationFrame(animateSlide);
    } else {
        circleX = targetX;
        circleY = targetY;
        grid[circleY][circleX] = 2;
        grid[circleY - (targetY - circleY)][circleX - (targetX - circleX)] = 0;
        animationProgress = 1;
        startTime = 0;
        requestAnimationFrame(update);
    }
}

function update() {
    drawGrid();
    requestAnimationFrame(update);
}

playerImage.onload = () => {
    update();
};

// Handle swipe events
const hammer = new Hammer(canvas);
hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

hammer.on('swipeleft', () => moveCircle(-1, 0));
hammer.on('swiperight', () => moveCircle(1, 0));
hammer.on('swipeup', () => moveCircle(0, -1));
hammer.on('swipedown', () => moveCircle(0, 1));

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js');
    });
}