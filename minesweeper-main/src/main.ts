import './style.css';
import { startGame } from './game'
import { resetGame } from './game'
import { restartGame } from './game';
import $ from "jquery"


const app: HTMLElement | null = document.getElementById('app');

if (app === null) {
  throw new Error('The app element was not found.');
}

// const title: HTMLHeadingElement = document.createElement('h1');
// title.textContent = 'שולה המוקשים';

// const introduction: HTMLParagraphElement = document.createElement('p');
// introduction.textContent = 'סביבת העבודה מוכנה. קראי את README.md וממשי את המשחק.';

// app.append(title, introduction);

const start_button: HTMLButtonElement = <HTMLButtonElement>document.getElementById("start_button");
const restert_button: HTMLButtonElement = <HTMLButtonElement>document.getElementById("restart");
const reset_button: HTMLButtonElement = <HTMLButtonElement>document.getElementById("reset");
let cells: Array<Array<HTMLDivElement>> = [];
const sizeInput: HTMLInputElement = document.getElementById('size_input') as HTMLInputElement;
const minesAmountInput: HTMLInputElement = document.getElementById('mines_amount_input') as HTMLInputElement;

let size: number;
let minesAmount: number;


start_button?.addEventListener("click", () => {
  try {
    size = Number(sizeInput.value);
    minesAmount = Number(minesAmountInput.value);
  } catch (error) {
    $("#invalid-input").show();
  }


  if (size < 2 || minesAmount < 1 || minesAmount > size ** 2) {
    $("#invalid-input").show();
  }

  else {
    cells = startGame(size, minesAmount);
  }

})

restert_button?.addEventListener("click", () => {
  restartGame();
}
)

reset_button?.addEventListener("click", () => {
  resetGame(size, minesAmount);
}
)





