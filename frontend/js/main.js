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
  if (document.getElementById("spinner").style.display == "block") {
    return;
  }

  document.getElementById("spinner").style.display = "block";
  // create json with prompt values
  let doc = document.getElementById("docString").value;
  let sig = document.getElementById("functionSignature").value.split("...")[0];
  let prompt = doc + "\n" + sig;
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
    console.log(data);
    // update html and remove hidden attr
    let el = document.getElementById("outputCode");
    document.getElementById("outputCode").innerHTML = generated;
    hljs.highlightBlock(el);
    if (el.hasAttribute("hidden")) {
      el.removeAttribute("hidden");
    }
  } catch (e) {
    console.log(e);
  }
  document.getElementById("spinner").style.display = "none";
  return;
};
