import $ from "jquery"

let gameOver: boolean = false;
let gameStarted: boolean = false;
let seconds: number = 0;
let sec: string, min: string, hours: string;
let timerId: number | undefined;
let revealedCells: number = 0;
let flags: number = 0;
let green_cell: HTMLDivElement | null = null;

function reset_vars(): void {
    gameOver = false;
    gameStarted = false;
    seconds = 0;
    revealedCells = 0;
    flags = 0;
    green_cell = null;

    if (timerId) {
        clearInterval(timerId);
        timerId = undefined;
    }
    $("#timer").html(`00:00:00`);
    $('#lossMassege1').hide();
    $('#lossMassege2').hide();
    $('#winningMassege').hide();
    const board: HTMLDivElement | null = <HTMLDivElement>document.getElementById('board');
    board.remove();
}

export function restartGame() {
    reset_vars();
    $("#timer").hide();
    $("#entry-screen").show();
    $('#flags').hide();
    $('#mines').hide();
    $("#restart-buttons").hide()
}

export function resetGame(size: number, minesAmount: number) {
    reset_vars();
    startGame(size, minesAmount);
}


export function startGame(size: number, minesAmount: number): Array<Array<HTMLDivElement>> {

    $("#entry-screen").hide();
    $('#timer').show();
    $('#flags').show();
    $('#mines').show();
    $('#mines').html(`💣${minesAmount}`);
    $('#restart-buttons').show();
    $("#invalid-input").hide()


    const mines: number[] = generateMines(minesAmount, size);

    const board: HTMLDivElement | null = <HTMLDivElement>document.createElement('div');
    board.id = 'board'
    board.style.marginTop = '10px'
    const container: HTMLDivElement | null = <HTMLDivElement>document.getElementById('container');
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.insertAdjacentElement('beforeend', board);


    const cells: Array<Array<HTMLDivElement>> = [];

    for (let i = 0; i < size; i++) {
        cells.push([]);
        for (let j = 0; j < size; j++) {
            const cell: HTMLDivElement = document.createElement('div');
            const index = i * size + j;

            cell.classList.add('cell', 'close');
            board.insertAdjacentElement("beforeend", cell);

            if (!green_cell && !mines.includes(i * size + j) && !getMinesAround(i, j, size, mines)) {
                green_cell = cell;
                green_cell.classList.add('green-cell');
                cell.style.backgroundColor = "rgb(64, 198, 28)";
            }

            cells[i].push(cell);
            if (mines.includes(index)) {
                cell.classList.add('mine');
            }
            cell.addEventListener('click', () => {
                handleCellLeftClick(cells, i, j, mines, size);
            }
            )

            cell.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                handleCellRightClick(cell, index, mines);
            })

            cell.addEventListener("dblclick", () => {
                doubleClick(cells, i, j, mines, size);
            })
        }
    }

    return cells;
}


export function generateMines(minesAmount: number, size: number): Array<number> {
    const mines: Array<number> = [];

    for (let i = 0; i < minesAmount; i++) {
        let num = Math.floor(Math.random() * size * size);

        while (mines.includes(num)) {
            num = Math.floor(Math.random() * size * size);
        }

        mines.push(num);

    }

    return mines;
}

function setCellColor(cell: HTMLDivElement, mines_around: number) {
    switch (mines_around) {
        case 1:
            cell.style.color = "blue";
            break;

        case 2:
            cell.style.color = "green";
            break;
        case 3:
            cell.style.color = "red";
            break;
        case 4:
            cell.style.color = "rgb(0, 0, 139)";
            break;
    }

}

function gameLost() {
    const board: HTMLDivElement | null = <HTMLDivElement>document.getElementById('board');
    clearInterval(timerId);
    timerId = undefined;
    board.classList.add('loss');
    gameOver = true;
    $('#lossMassege1').fadeIn(500);
    $('#lossMassege1').fadeOut(4000);
    $('#lossMassege2').fadeIn(4000);
    gameStarted = false;

}

function gameWon() {
    clearInterval(timerId);
    timerId = undefined;
    gameOver = true;
    $('#winningMassege').fadeIn(4000);
    const board: HTMLDivElement | null = <HTMLDivElement>document.getElementById('board');
    board.classList.add('winning');
}

function doubleClick(cells: Array<Array<HTMLDivElement>>, row: number, col: number, mines: number[], size: number): void {
    if (cells[row][col].classList.contains("revealed")) {
        const mines_around = getMinesAround(row, col, size, mines);
        const flags_around = getflagsAround(cells, row, col, size);
        if (mines_around === flags_around) {


            const a = Math.max(0, row - 1)
            const b = Math.min(row + 2, size)
            const c = Math.max(0, col - 1)
            const d = Math.min(col + 2, size)

            for (let i = a; i < b; i++) {
                for (let j = c; j < d; j++) {
                    handleCellLeftClick(cells, i, j, mines, size);
                }

            }
        }
    }
}


function handleCellLeftClick(cells: Array<Array<HTMLDivElement>>, row: number, col: number, mines: number[], size: number): void {
    if (gameOver) {
        return
    }

    if (!gameStarted) {
        gameStarted = true;
        timerId = setInterval(startTimer, 1000);

    }

    if (row < 0 || row >= size || col < 0 || col >= size) {
        return
    }

    const cell = cells[row][col];

    if (cell.classList.contains("revealed") || cell.classList.contains("flag")) {
        return
    }


    if (!green_cell || cell.classList.contains("green-cell") || green_cell.classList.contains("revealed")){
        const index = row * size + col;

    if (mines.includes(index)) {
        gameLost();
    }

    else {
        cell.classList.add('revealed');
        cell.style.boxShadow = "0px 0px 0px"
        console.log(cell.style.boxShadow)



        const mines_around = getMinesAround(row, col, size, mines);
        cell.style.backgroundColor = "rgb(191, 192, 171)";
        if (!mines_around) {
            handleCellLeftClick(cells, row - 1, col, mines, size);
            handleCellLeftClick(cells, row + 1, col, mines, size);
            handleCellLeftClick(cells, row, col - 1, mines, size);
            handleCellLeftClick(cells, row, col + 1, mines, size);
            handleCellLeftClick(cells, row - 1, col - 1, mines, size);
            handleCellLeftClick(cells, row - 1, col + 1, mines, size);
            handleCellLeftClick(cells, row + 1, col - 1, mines, size);
            handleCellLeftClick(cells, row + 1, col + 1, mines, size);
        }
        else {
            setCellColor(cell, mines_around)
            cell.innerText = String(mines_around);
        }

        revealedCells++;
        if (revealedCells === size ** 2 - mines.length) {
            gameWon();
        }

    }}
}


function handleCellRightClick(cell: HTMLDivElement, index: number, mines: number[]): void {
    if (gameOver) {
        return
    }

    if (!gameStarted) {
        gameStarted = true;
        timerId = setInterval(startTimer, 1000);
    }

    if (!cell.classList.contains("revealed")) {
        if (cell.classList.contains("flag")) {
            cell.classList.remove('flag');
            flags--;
        }
        else {
            cell.classList.add('flag');
            flags++
        }
    }

    $('#flags').html(`🚩${flags}`)
    $('#mines').html(`💣${mines.length - flags}`)

}


function getMinesAround(cell_row: number, cell_coll: number, size: number, mines: Array<number>): number {
    let mines_around: number = 0;
    const a = Math.max(0, cell_row - 1)
    const b = Math.min(cell_row + 2, size)
    const c = Math.max(0, cell_coll - 1)
    const d = Math.min(cell_coll + 2, size)

    for (let i = a; i < b; i++) {
        for (let j = c; j < d; j++) {
            if (i !== cell_row || j !== cell_coll) {
                if (mines.includes(i * size + j)) {
                    mines_around++;
                }
            }

        }
    }

    return mines_around;
}

function getflagsAround(cells: Array<Array<HTMLDivElement>>, cell_row: number, cell_coll: number, size: number): number {
    let flagsAround: number = 0;
    const a = Math.max(0, cell_row - 1)
    const b = Math.min(cell_row + 2, size)
    const c = Math.max(0, cell_coll - 1)
    const d = Math.min(cell_coll + 2, size)

    for (let i = a; i < b; i++) {
        for (let j = c; j < d; j++) {
            if (i !== cell_row || j !== cell_coll) {
                if (cells[i][j].classList.contains("flag")) {
                    flagsAround++;
                }
            }

        }
    }

    return flagsAround;
}

export function addTimer(): void {
    const startButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("startButton");
    const timerDisplay: HTMLDivElement = <HTMLDivElement>document.getElementById("timer");
    let timerInterval: number;
    let startTime: Date;

    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const currentTime: Date = new Date();
        const elapsedTime: Date = new Date(Number(currentTime) - Number(startTime));

        const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');

        timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }


}

function startTimer(): void {
    seconds++;
    sec = String(seconds % 60).padStart(2, '0');
    min = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
    $("#timer").html(`${hours}:${min}:${sec}`);

}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


















