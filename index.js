import Board from './Board.js';

const CELL_SIZE_PIXELS = 20;
const container = document.getElementById('app');
const startStopButton = document.getElementById('start-stop');
const timeoutInput = document.getElementById('timeout');
const coordinateOutput = document.getElementById('coords');

new Board(container, startStopButton, timeoutInput, coordinateOutput, CELL_SIZE_PIXELS);
