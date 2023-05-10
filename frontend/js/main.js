import "/css/style.css";
function detectWebGL() {
  // Check for the WebGL rendering context
  if (!!window.WebGLRenderingContext) {
    var canvas = document.createElement("canvas"),
      names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
      context = false;

    for (var i in names) {
      try {
        context = canvas.getContext(names[i]);
        if (context && typeof context.getParameter === "function") {
          // WebGL is enabled.
          return 1;
        }
      } catch (e) {
        hasWebGl = 0;
      }
    }

    // WebGL is supported, but disabled.
    return 0;
  }

  // WebGL not supported.
  return -1;
}

// disable welcome msg if webgl is on
const webGlStatus = detectWebGL();
const hasWebGl = webGlStatus === 1;
console.log(`webgl status: ${webGlStatus}`);

function enableGraphics() {
  // hide welcome msg
  let welcome = document.getElementById("welcome");
  welcome.hidden = true;
  (async () => {
    let three = await import("./3d.js");
    three.startAnimation();
  })();
  // disable secondary background
  let secondary = document.getElementById("bg-secondary");
  secondary.hidden = true;
}

function disableGraphics() {
  let canvas = document.getElementById("bg");
  let main = document.getElementById("main");
  canvas.hidden = true;
  main.style.top = 0;
  // enable secondary background
  let secondary = document.getElementById("bg-secondary");
  secondary.hidden = false;
  // hide section with disable graphics button
  let section = document.getElementById("disable-graphics-section");
  section.hidden = true;
}

if (hasWebGl) {
  enableGraphics();
} else {
  disableGraphics();
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
let running = false;

const hideScroll = async () => {
  if (!running) {
    running = true;
    Array.from(document.getElementsByClassName("scrollers")).forEach(function (
      element
    ) {
      element.hidden = true;
    });
    await delay(7000);

    if (window.scrollY < 600) {
      Array.from(document.getElementsByClassName("scrollers")).forEach(
        function (element) {
          element.hidden = false;
        }
      );
    }

    running = false;
  }
};

let ticking = false;
document.addEventListener("scroll", function (_e) {
  if (!ticking) {
    window.requestAnimationFrame(function () {
      hideScroll();
      ticking = false;
    });

    ticking = true;
  }
});

function disableGraphicsButtonClicked() {
  disableGraphics();
  // show welcome
  let welcome = document.getElementById("welcome");
  welcome.hidden = false;
}
document
  .getElementById("disable-graphics-button")
  .addEventListener("click", disableGraphicsButtonClicked);
