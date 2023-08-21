let currWidth = window.innerWidth;
let currHeight = window.innerHeight;

function resizeBgIfNeeded() {
  if (currWidth != window.innerWidth || currHeight != window.innerHeight) {
    currWidth = window.innerWidth;
    currHeight = window.innerHeight;
    resizeCanvas(currWidth / 5, currWidth / 5);
    noStroke();
    background(20);
  }
}

function setup() {
  // full screen canvas
  let canvas = createCanvas(currWidth / 5, currWidth / 5);
  canvas.parent("chess");
  // make it relative to the parent
  canvas.style("position", "relative");
  noStroke();
  background(20);
}

function drawBoard() {
  const size = 5;
  for (let i1 = 0, d = 1; i1 < size; i1++) {
    for (let i2 = 0; i2 <= 10; i2++) {
      if (i2 % 2 != 0) {
        fill(255);
        rect(
          i1 * (height / size),
          i2 * (height / size) - d * (height / size),
          height / size,
          height / size
        );
      }
    }
    if (i1 % 2 != 0) {
      d = 1;
    } else {
      d = 0;
    }
  }
}

function draw() {
  resizeBgIfNeeded();
  drawBoard();
}
