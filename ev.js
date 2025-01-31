class Model {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.blocks = [];
        this.moleQueue = []; 
        this.activeSnake = null;
        this.snakeInterval = null;
        this.gameInterval = null;
        this.timerInterval = null;
    }
    resetGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.moleQueue = []; 
        this.activeSnake = null;
        this.blocks = Array.from({ length: 12 }, (_, id) => ({ id, hasMole: false }));
    }
}

class View {
    constructor() {
        this.gameBoard = document.getElementById("game-board");
        this.scoreDisplay = document.getElementById("score");
        this.timerDisplay = document.getElementById("timer");
        this.startButton = document.getElementById("start-button");
    }
    renderBoard(blocks) {
        this.gameBoard.innerHTML = "";
        blocks.forEach(block => {
            const blockElement = document.createElement("div");
            blockElement.classList.add("block");
            blockElement.dataset.id = block.id;

            const mole = document.createElement("div");
            mole.classList.add("mole");
            if (block.hasMole) mole.style.display = "block";

            const snake = document.createElement("div");
            snake.classList.add("snake");
            snake.style.width = "100px";
            snake.style.height = "100px";
            snake.style.position = "absolute";
            snake.style.display = block.hasSnake ? "block" : "none";

            blockElement.appendChild(mole);
            blockElement.appendChild(snake);
            this.gameBoard.appendChild(blockElement);
        });
    }
    updateScore(score) {
        this.scoreDisplay.textContent = score;
    }
    updateTimer(timeLeft) {
        this.timerDisplay.textContent = timeLeft;
    }
    showGameOverMessage() {
        alert("Time is Over!");
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.view.startButton.addEventListener("click", () => this.startGame());
        this.view.gameBoard.addEventListener("click", (e) => this.handleClick(e));
        this.model.resetGame();
        this.view.renderBoard(this.model.blocks);
        this.view.updateScore(this.model.score);
        this.view.updateTimer(this.model.timeLeft);
        // this.startGame();
    }
    startGame() {
        this.model.resetGame();
        this.view.renderBoard(this.model.blocks);
        this.view.updateScore(this.model.score);
        this.view.updateTimer(this.model.timeLeft);
        clearInterval(this.model.gameInterval);
        clearInterval(this.model.timerInterval);
        clearInterval(this.model.snakeInterval);
        this.model.gameInterval = setInterval(() => this.spawnMole(), 1000);
        this.model.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.model.snakeInterval = setInterval(() => this.spawnSnake(), 2000);
    }
    updateTimer() {
        this.model.timeLeft--;
        this.view.updateTimer(this.model.timeLeft);
        if (this.model.timeLeft <= 0) {
           this.endGame()
        }
    }
    spawnMole() {
        let availableBlocks = this.model.blocks.filter(b => !b.hasMole);

        if (this.model.moleQueue.length > 3) {
            let oldestMoleId = this.model.moleQueue.shift(); 
            let oldestBlock = this.model.blocks.find(b => b.id == oldestMoleId);
            if (oldestBlock) {
                oldestBlock.hasMole = false;
            }
        }
    
        if (availableBlocks.length > 0) {
            let randomIndex = Math.floor(Math.random() * availableBlocks.length);
            let block = availableBlocks[randomIndex];
            block.hasMole = true;
            this.model.moleQueue.push(block.id);
    
            setTimeout(() => {
                block.hasMole = false;
                this.model.moleQueue = this.model.moleQueue.filter(id => id !== block.id); 
            }, 2000);
    
            this.view.renderBoard(this.model.blocks);
        }
    }
    spawnSnake() {
        if (this.model.activeSnake !== null) {
            this.model.blocks[this.model.activeSnake].hasSnake = false;
        }
        let randomIndex = Math.floor(Math.random() * this.model.blocks.length);
        this.model.activeSnake = randomIndex;
        this.model.blocks[randomIndex].hasSnake = true;
        this.view.renderBoard(this.model.blocks);
    }
    handleClick(event) {
        const blockId = event.target.closest(".block")?.dataset.id;
        if (blockId !== undefined) {
            let block = this.model.blocks[blockId];

            if (block.hasSnake) {
                this.triggerGameOver();
            } else if (block.hasMole) {
                block.hasMole = false;
                this.model.score++;
                this.view.updateScore(this.model.score);
                this.spawnMole();
            }
        }
    }
    triggerGameOver() {
        this.model.blocks.forEach(block => block.hasSnake = true);
        this.view.renderBoard(this.model.blocks);
        clearInterval(this.model.gameInterval);
        clearInterval(this.model.timerInterval);
        clearInterval(this.model.snakeInterval);
        alert("Game Over! You clicked the snake.");
    }
    endGame() {
        clearInterval(this.model.gameInterval);
        clearInterval(this.model.timerInterval);
        clearInterval(this.model.snakeInterval);
        this.view.showGameOverMessage();
    }
}

const model = new Model();
const view = new View();
new Controller(model, view);