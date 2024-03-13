import "/css/style.css";

function boldName() {
  let pubs = document.getElementById("pubs");
  for (let i = 0; i < pubs.children.length; i++) {
    let li = pubs.children[i];
    let content = li.children[0].innerHTML;
    li.children[0].innerHTML = content.replace(
      "Federico Cassano",
      "<b>Federico Cassano</b>"
    );
  }
}

boldName();

document.getElementById("generateButton").onclick = async function () {
  // if the spinner is already spinning, don't do anything
  let spinner = document.getElementById("spinner");
  if (spinner.style.display == "block") {
    return;
  }
  let outputCode = document.getElementById("outputCode");
  outputCode.setAttribute("hidden", "");

  spinner.style.display = "block";
  // create json with prompt values
  let doc = document.getElementById("docString").value.trim();
  if (doc === "") {
    spinner.style.display = "none";
    return;
  }
  // for each newline, add comment
  doc = doc
    .split("\n")
    .map((line) => ";; " + line)
    .join("\n");
  let prompt = doc + "\n(define (";
  let json = {
    prompt: prompt,
  };
  console.log(json);
  // send json to backend
  // TOOD: change to /generate
  try {
    let response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
    // get response
    let data = await response.json();
    let generated = data.generated;
    if (generated === undefined) {
      throw "Error: generated is undefined";
    }
    console.log(data);
    // update html and remove hidden attr
    let outputCode = document.getElementById("outputCode");
    outputCode.innerHTML = generated;
    // set maxheight to the height of the codegen section / 1.75
    let codegen = document.getElementById("codegen");
    outputCode.style.maxHeight = (codegen.clientHeight / 1.75) + "px";
    if (outputCode.hasAttribute("data-highlighted")) {
      outputCode.removeAttribute("data-highlighted");
    }
    hljs.highlightBlock(outputCode);
    if (outputCode.hasAttribute("hidden")) {
      outputCode.removeAttribute("hidden");
    }
  } catch (e) {
    console.log(e);
  }
  spinner.style.display = "none";
  return;
};
