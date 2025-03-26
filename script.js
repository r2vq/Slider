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
let animationProgress = 1;
const animationSpeed = 0.1;

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

    ctx.beginPath();
    ctx.arc(animatedX + cellSize / 2, animatedY + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
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
}

function animateSlide() {
    if (animationProgress < 1) {
        animationProgress += animationSpeed;
        drawGrid();
        requestAnimationFrame(animateSlide);
    } else {
        circleX = targetX;
        circleY = targetY;
        grid[circleY][circleX] = 2;
        grid[circleY - (targetY - circleY)][circleX - (targetX - circleX)] = 0;
        animationProgress = 1;
        drawGrid();
        requestAnimationFrame(update);
    }
}

function update() {
    drawGrid();
    if (animationProgress < 1) {
        animateSlide();
    } else {
        requestAnimationFrame(update);
    }
}

update();

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