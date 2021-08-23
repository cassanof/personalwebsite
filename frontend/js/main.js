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
let hasWebGl = detectWebGL();
console.log(`webgl status: ${hasWebGl}`);

if (hasWebGl == 1) {
  let welcome = document.getElementById("welcome");
  welcome.remove();
  (async () => {
    let three = await import("./3d.js");
    three.startAnimation();
  })();
} else {
  let canvas = document.getElementById("bg");
  let main = document.getElementById("main");
  canvas.remove();
  main.style.top = 0;
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
document.addEventListener("scroll", function (e) {
  if (!ticking) {
    window.requestAnimationFrame(function () {
      hideScroll();
      ticking = false;
    });

    ticking = true;
  }
});
