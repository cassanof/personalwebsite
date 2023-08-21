let currWidth = window.innerWidth;
let currHeight = window.innerHeight;

function resizeBgIfNeeded() {
  if (currWidth != window.innerWidth || currHeight != window.innerHeight) {
    currWidth = window.innerWidth;
    currHeight = window.innerHeight;
    resizeCanvas(currWidth, currHeight);
  }
}

function setup() {
  // full screen canvas
  let canvas = createCanvas(currWidth, currHeight);
  canvas.parent("body");
}

function draw() {
  resizeBgIfNeeded();
}
