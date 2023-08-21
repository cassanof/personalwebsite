let currWidth = window.innerWidth;
let currHeight = window.innerHeight;

let colors = ["#fb6a16", "#81d8d0", "#9f83a9"];

let ants = [];

class Ant {
  constructor() {
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.size = Math.floor(Math.random() * 15) + 5;
    this.x = Math.floor(Math.random() * currWidth);
    this.y = Math.floor(Math.random() * currHeight);
    this.direction = Math.floor(Math.random() * 360);
  }

  move() {
    this.x += Math.cos((this.direction * Math.PI) / 180);
    this.y += Math.sin((this.direction * Math.PI) / 180);

    // Left or Right boundaries
    if (this.x < 0 || this.x > currWidth) {
      this.direction = 180 - this.direction;
    }

    // Top or Bottom boundaries
    if (this.y < 0 || this.y > currHeight) {
      this.direction = 360 - this.direction;
    }

    // Ensure the direction stays within [0, 360)
    this.direction = (this.direction + 360) % 360;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate((this.direction * Math.PI) / 180);
    fill(this.color);
    ellipse(this.size * 0.2, 0, this.size, this.size * 0.7); // main body
    ellipse(this.size * 0.6, 0, this.size * 0.5, this.size * 0.4); // head

    stroke(this.color);
    strokeWeight(2);
    let antennaLength = this.size * 0.7;
    line(
      this.size * 0.6,
      0,
      this.size * 0.6 + cos(PI / 4) * antennaLength,
      0 - sin(PI / 4) * antennaLength
    );
    line(
      this.size * 0.6,
      0,
      this.size * 0.6 + cos(-PI / 4) * antennaLength,
      0 - sin(-PI / 4) * antennaLength
    );
    pop();
  }
}

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
  ants = new Array(40).fill(0).map(() => new Ant());
}

function draw() {
  resizeBgIfNeeded();
  clear();

  ants.forEach((ant) => {
    ant.display();
    ant.move();
  });
}
