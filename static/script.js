const CELL_SIZE = 30;
const MAZE_SIZE = 13;
let player = { x: 0, y: 0 };
let timer;
let timeLeft = 30;
let maze;
let exitPos;
let gameActive;

function generateMaze() {
    maze = Array(MAZE_SIZE)
        .fill()
        .map(() =>
            Array(MAZE_SIZE)
                .fill()
                .map(() => ({
                    walls: { top: true, right: true, bottom: true, left: true },
                    visited: false,
                }))
        );

    let stack = [];
    let current = { x: 0, y: 0 };
    maze[0][0].visited = true; 

    while (true) {
        let neighbors = [];
        if (current.x > 0 && !maze[current.y][current.x - 1].visited)
            neighbors.push("left");
        if (current.x < MAZE_SIZE - 1 && !maze[current.y][current.x + 1].visited)
            neighbors.push("right");
        if (current.y > 0 && !maze[current.y - 1][current.x].visited)
            neighbors.push("top");
        if (current.y < MAZE_SIZE - 1 && !maze[current.y + 1][current.x].visited)
            neighbors.push("bottom");

        if (neighbors.length > 0) {
            let direction = neighbors[Math.floor(Math.random() * neighbors.length)];
            let next = { x: current.x, y: current.y };

            switch (direction) {
                case "left":
                    maze[current.y][current.x].walls.left = false;
                    maze[current.y][current.x - 1].walls.right = false;
                    next.x--;
                    break;
                case "right":
                    maze[current.y][current.x].walls.right = false;
                    maze[current.y][current.x + 1].walls.left = false;
                    next.x++;
                    break;
                case "top":
                    maze[current.y][current.x].walls.top = false;
                    maze[current.y - 1][current.x].walls.bottom = false;
                    next.y--;
                    break;
                case "bottom":
                    maze[current.y][current.x].walls.bottom = false;
                    maze[current.y + 1][current.x].walls.top = false;
                    next.y++;
                    break;
            }

            maze[next.y][next.x].visited = true;
            stack.push(current);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }

   let side, exitX, exitY;
   do {
    side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0:
            exitY = 0;
            exitX = Math.floor(Math.random() * MAZE_SIZE);
            break;
        case 1:
            exitX = MAZE_SIZE - 1;
            exitY = Math.floor(Math.random() * MAZE_SIZE);
            break;
        case 2:
            exitY = MAZE_SIZE - 1;
            exitX = Math.floor(Math.random() * MAZE_SIZE);
            break;
        case 3:
            exitX = 0;
            exitY = Math.floor(Math.random() * MAZE_SIZE);
            break;
    }
   } while (exitX === 0 && exitY === 0);

  exitPos = { x: exitX, y: exitY };

 switch (side) {
    case 0:
        maze[exitY][exitX].walls.top = false;
        break;
    case 1:
        maze[exitY][exitX].walls.right = false;
        break;
    case 2:
        maze[exitY][exitX].walls.bottom = false;
        break;
    case 3:
        maze[exitY][exitX].walls.left = false;
        break;
  }
}

function renderMaze() {
    const container = document.getElementById("maze");
    container.style.gridTemplateColumns = `repeat(${MAZE_SIZE}, ${CELL_SIZE}px)`;
    container.innerHTML = "";

    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            const cell = document.createElement("div");
            cell.className = "cell" + (x === exitPos.x && y === exitPos.y ? " exit" : "");
            cell.style.width = CELL_SIZE + "px";
            cell.style.height = CELL_SIZE + "px";

            Object.entries(maze[y][x].walls).forEach(([dir, exists]) => {
                 if (exists) {
            const wall = document.createElement("div");
            
            // Vi lagrer retningen i en egen attributt så movePlayer kan lese den senere!
            wall.dataset.direction = dir; 
            
            // Her bestemmer vi at det er 15% sjanse for at en vegg blir hemmelig/gjennomsiktig!
            if (Math.random() < 0.15) {
                wall.className = `wall ${dir} secret`;
            } else {
                wall.className = `wall ${dir}`;
            }
            
            cell.appendChild(wall);
        }
            });

            container.appendChild(cell);
        }
    }


    updatePlayerPosition();
}

function updatePlayerPosition() {
    const playerElem = document.getElementById("player");
    playerElem.style.width = CELL_SIZE * 0.6 + "px";
    playerElem.style.height = CELL_SIZE * 0.6 + "px";
    playerElem.style.left = player.x * CELL_SIZE + CELL_SIZE * 0.2 + "px";
    playerElem.style.top = player.y * CELL_SIZE + CELL_SIZE * 0.2 + "px";

    if (player.x === exitPos.x && player.y === exitPos.y) {
        showMessage("Winner!");
         saveScore(timeLeft);
    }
}

function movePlayer(direction) {
    if (!gameActive) return;
    
    const x = player.x;
    const y = player.y;
    const walls = maze[y][x].walls;
    
    // Henter HTML-elementene for cellen du står i, og cellene rundt deg
    const currentCell = document.querySelector(`#maze .cell:nth-child(${y * MAZE_SIZE + x + 1})`);
    
    switch (direction) {
        case "up":
            // Henter nabocellen over deg for å sjekke om veggen derfra er hemmelig
            const nextCellUp = y > 0 ? document.querySelector(`#maze .cell:nth-child(${(y - 1) * MAZE_SIZE + x + 1})`) : null;
            const topWall = currentCell ? currentCell.querySelector(".wall.top") : null;
            const nextBottomWall = nextCellUp ? nextCellUp.querySelector(".wall.bottom") : null;
            
            // ELITE-HACKET: Du kan gå hvis det ikke er vegg, ELLER hvis veggen på en av sidene er secret!
            if (!walls.top || (topWall && topWall.classList.contains("secret")) || (nextBottomWall && nextBottomWall.classList.contains("secret"))) {
                player.y--;
            }
            break;
            
        case "down":
            const nextCellDown = y < MAZE_SIZE - 1 ? document.querySelector(`#maze .cell:nth-child(${(y + 1) * MAZE_SIZE + x + 1})`) : null;
            const bottomWall = currentCell ? currentCell.querySelector(".wall.bottom") : null;
            const nextTopWall = nextCellDown ? nextCellDown.querySelector(".wall.top") : null;
            
            if (!walls.bottom || (bottomWall && bottomWall.classList.contains("secret")) || (nextTopWall && nextTopWall.classList.contains("secret"))) {
                player.y++;
            }
            break;
            
        case "left":
            const nextCellLeft = x > 0 ? document.querySelector(`#maze .cell:nth-child(${y * MAZE_SIZE + (x - 1) + 1})`) : null;
            const leftWall = currentCell ? currentCell.querySelector(".wall.left") : null;
            const nextRightWall = nextCellLeft ? nextCellLeft.querySelector(".wall.right") : null;
            
            if (!walls.left || (leftWall && leftWall.classList.contains("secret")) || (nextRightWall && nextRightWall.classList.contains("secret"))) {
                player.x--;
            }
            break;
            
        case "right":
            const nextCellRight = x < MAZE_SIZE - 1 ? document.querySelector(`#maze .cell:nth-child(${y * MAZE_SIZE + (x + 1) + 1})`) : null;
            const rightWall = currentCell ? currentCell.querySelector(".wall.right") : null;
            const nextLeftWall = nextCellRight ? nextCellRight.querySelector(".wall.left") : null;
            
            if (!walls.right || (rightWall && rightWall.classList.contains("secret")) || (nextLeftWall && nextLeftWall.classList.contains("secret"))) {
                player.x++;
            }
            break;
    }
    updatePlayerPosition();
}

function showMessage(text) {
    gameActive = false;
    clearInterval(timer);
    document.getElementById("message-text").textContent = text;
    document.getElementById("message").style.display = "block";
}

function initGame() {
    clearInterval(timer);
    gameActive = true;
    timeLeft = 30;
    document.getElementById("timer").textContent = `Timer: ${timeLeft}`;
    document.getElementById("message").style.display = "none";
    player = { x: 0, y: 0 };
    generateMaze();
    renderMaze();

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            showMessage("Time Up!");
        }
    }, 1000);


}

document.addEventListener("keyup", (e) => {
    const directions = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
    };
    if (directions[e.key]) {
        const buttonId = directions[e.key];
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove("hover-effect");
        }
    }
});

initGame();

document.addEventListener("keyup", (e) => {
    // Sjakktrekk: Vi legger inn BÅDE piltastene og WASD i mønsteret!
    const directions = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right"
    };
    
    // Hvis tasten du trykket på finnes i listen vår:
    if (directions[e.key]) {
        const direction = directions[e.key];
        
        // DETTE MANGLA: Nå flytter vi faktisk den grønne prikken på brettet!
        movePlayer(direction); 
        
        // Dette fjerner hover-effekten på skjermknappene dine
        const button = document.getElementById(direction);
        if (button) {
            button.classList.remove("hover-effect");
        }
    }
});

function saveName() {
    const nameInput = document.getElementById("username-input").value;
    const displayName = document.getElementById("display-name");
    const nameScreen = document.getElementById("name-screen");

    // Sjekker om brukeren faktisk har skrevet inn et navn i boksen
    if (nameInput.trim() !== "") {
        displayName.textContent = "Spiller: " + nameInput;
        displayName.style.display = "block"; // Viser navnet over mazen
        nameScreen.style.display = "none";   // Skjuler navneboksen så spillet kan starte
        
        // Sjakktrekket: Nå som navnet er lagret, starter vi selve spillet!
        initGame(); 
    } else {
        alert("Du må skrive inn et navn først");
    }
}

// Henter topp 5 fra MariaDB via Flask og viser tabellen
async function showLeaderboardScreen() {
    const nameScreen = document.getElementById("name-screen");
    if (nameScreen) nameScreen.style.display = "none";
    document.getElementById("message").style.display = "none";
    document.getElementById("maze-container").style.display = "none";
    document.getElementById("controls").style.display = "none";
    document.getElementById("timer").style.display = "none";
    document.getElementById("leaderboard-screen").style.display = "block";

    const tableBody = document.getElementById("leaderboard-table-body");
    tableBody.innerHTML = "";

    const response = await fetch("/api/scores");
    const topFiveScores = await response.json();

    topFiveScores.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #333";
        row.style.background = index === 0 ? "rgba(76, 175, 80, 0.2)" : "transparent";
        row.style.fontWeight = index === 0 ? "bold" : "normal";

        row.innerHTML = `
            <td style="padding: 12px; color: ${index === 0 ? '#4caf50' : '#fff'};">#${index + 1}</td>
            <td style="padding: 12px;">${entry.name}</td>
            <td style="padding: 12px; text-align: right; color: #4caf50;">${entry.time}s</td>
        `;
        tableBody.appendChild(row);
    });
}

// Funksjon som kalles når du trykker på "Spill Igjen"-knappen i tabellen
function backToGame() {
    document.getElementById("leaderboard-screen").style.display = "none";
    document.getElementById("maze-container").style.display = "block";
    document.getElementById("controls").style.display = "flex";
    document.getElementById("timer").style.display = "block";
    initGame(); // Starter en helt ny, frisk tidslinje!
}

// Sender vinnertiden til MariaDB via Flask
async function saveScore(playerTime) {
    const playerName = document.getElementById("username-input")?.value || "Anonym Utvikler";

    await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, time: playerTime })
    });

    setTimeout(() => {
        showLeaderboardScreen();
    }, 1000);
}