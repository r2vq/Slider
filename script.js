const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 5;
const cellSize = Math.min(canvas.width, canvas.height) / gridSize;
const grid = [];
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

// Initialize grid, place circle, place blockers (same as before)
for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
        grid[row][col] = 0;
    }
}

grid[circleY][circleX] = 2;

const numBlockers = 5;
for (let i = 0; i < numBlockers; i++) {
    let row, col;
    do {
        row = Math.floor(Math.random() * gridSize);
        col = Math.floor(Math.random() * gridSize);
    } while (grid[row][col] !== 0);
    grid[row][col] = 1;
    blockers.push({ row, col });
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.strokeStyle = 'gray';
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

            if (grid[row][col] === 1) {
                ctx.fillStyle = 'red';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
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

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && grid[newY][newX] !== 1) {
            targetX = newX;
            targetY = newY;
        } else {
            break;
        }
    }
    animationProgress = 0;
    startTime = 0; // reset for next animation
    requestAnimationFrame(animateSlide); // Start the animation
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