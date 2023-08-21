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
