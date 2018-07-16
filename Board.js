// The input is defined as { y1: [y1 x values], ..., yN: [yN x values] } where the
// specified X values are the "on" cells (column) for that corresponding Y (row)
//
// This input defines a basic glider + pulsar pattern (check the Wikipedia entry for more)
const defaultInputs = {
  1: [3],
  2: [1, 3, 42, 43, 44, 48, 49, 50],
  3: [2, 3],
  4: [40, 45, 47, 52],
  5: [40, 45, 47, 52],
  6: [40, 45, 47, 52],
  7: [42, 43, 44, 48, 49, 50],
  9: [42, 43, 44, 48, 49, 50],
  10: [40, 45, 47, 52],
  11: [40, 45, 47, 52],
  12: [40, 45, 47, 52],
  14: [42, 43, 44, 48, 49, 50],
};

export default class Board {
  constructor(container, startStopButton, timeoutInput, coordinateOutput, cellSize = 20) {
    // Assuming all valid inputs
    this.container = container;
    this.startStopButton = startStopButton;
    this.timeoutInput = timeoutInput;
    this.coordinateOutput = coordinateOutput;
    this.numColumns = Math.floor(container.clientWidth / cellSize);
    this.numRows = Math.floor(container.clientHeight / cellSize);

    this.cells = [];
    this.refreshTimeout = this.timeoutInput.value;

    this.bindRootListeners();
    this.refreshBoard(true);
  }

  bindRootListeners() {
    this.container.addEventListener('mouseleave', this.handleContainerMouseLeave.bind(this));
    this.startStopButton.addEventListener('click', this.handleStartStopClicked.bind(this));
    this.timeoutInput.addEventListener('change', this.handleTimeoutInputChange.bind(this));
  }

  handleContainerMouseLeave() {
    this.setCoordinateHTML();
  }

  handleStartStopClicked(evt) {
    if (!this.setBoardTimeoutId) {
      this.refreshBoard();
      evt.target.innerHTML = 'Stop';
    } else {
      window.clearTimeout(this.setBoardTimeoutId);
      this.setBoardTimeoutId = null;
      evt.target.innerHTML = 'Start';
    }
  }

  handleTimeoutInputChange(evt) {
    this.refreshTimeout = evt.target.value;
  }

  handleCellMouseover(evt) {
    const { x, y } = this.getCellXY(evt.target);
    this.coordinateOutput.innerHTML = `(${y}, ${x})`;
  }

  handleCellClick(evt) {
    const { x, y } = this.getCellXY(evt.target);
    this.cells[y][x].classList.toggle('on');
  }

  setCoordinateHTML(x, y) {
    if (!x || !y) {
      this.coordinateOutput.innerHTML = 'N/A';
      return;
    }
    this.coordinateOutput.innerHTML = `(${x}, ${y})`;
  }

  // getCellXY finds a cell elements index among its sibling cells and also its parent's (row)
  // index among its siblings
  getCellXY(cellEl) {
    const rowEl = cellEl.parentElement;
    const rowIndex = Array.from(rowEl.parentElement.children).indexOf(rowEl);
    const cellIndex = Array.from(rowEl.children).indexOf(cellEl);
    return { x: cellIndex, y: rowIndex };
  }

  // refreshBoard loops the number of rows and its columns, creating an HTML element for each if
  // they don't exist, or calculating their new on/off state if they do
  //
  // NOTE: Cells are not changed in place because if they were, the results of one operation would
  // alter the results of the very next operation; instead, cells that will be toggled are tracked
  // and toggled after every cell's new status has been calculated
  refreshBoard(setup = false) {
    const toToggle = [];
    let row;

    for (let i = 0; i < this.numRows; i++) {
      if (setup) {
        row = document.createElement('div');
        row.className = 'row';
        this.container.appendChild(row);

        this.cells[i] = [];
      }

      for (let j = 0; j < this.numColumns; j++) {
        if (setup) {
          // Prep work for first run by creating the necessary elements and attaching event handlers
          const cell = document.createElement('div');
          cell.className = 'cell';
          row.appendChild(cell);
          if (true && defaultInputs[i] && defaultInputs[i].includes(j)) {
            cell.classList.add('on');
          }
          cell.addEventListener('mouseover', this.handleCellMouseover.bind(this));
          cell.addEventListener('click', this.handleCellClick.bind(this));
          this.cells[i].push(cell);
        } else {
          const thisCell = this.cells[i][j];
          let isOn = thisCell.classList.contains('on');
          let numNeighborsOn = 0;
          this.getNeighborsOnOff(i, j).forEach(n => n && numNeighborsOn++);
          if ((isOn && (numNeighborsOn < 2 || numNeighborsOn > 3)) ||
              (!isOn && numNeighborsOn === 3)) {
            toToggle.push(thisCell);
          }
        }
      }
    }
    toToggle.forEach(el => el.classList.toggle('on'));

    // Skip starting on the setup execution to give the user the ability to start at their leisure
    if (!setup) {
      this.setBoardTimeoutId = setTimeout(this.refreshBoard.bind(this), this.refreshTimeout);
    }
  }

  // getNeighborsOnOff returns an array of the 8 neighboring cells on/off status given a coordinate
  // pair for the cell whose neighbors we want
  getNeighborsOnOff(y, x) {
    const results = [];
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        // When getting neighbors for the first or last row/column on a non-infinite board, many
        // neighbors are non-existent so for our purposes, assume they are off
        if (i < 0 || i >= this.numRows || j < 0 || j >= this.numColumns) {
          results.push(false);
          continue;
        }
        // Skip counting the current cell among its neighbors
        if (i !== y || j !== x) {
          results.push(this.cells[i][j].classList.contains('on'));
        }
      }
    }
    return results;
  }
}
