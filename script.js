//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  for (const episode of episodeList) {
    makeEpisodeCard(episode, rootElem);
  }
}

function makeEpisodeCard(episode, rootElem) {
  const episodeCode = "S" + String(episode.season) + "E" + String(episode.number).padStart(2, "0");
  const cardDom = document.createElement("div");
  cardDom.classList.add("card");
  const nameDom = document.createElement("h2");
  nameDom.textContent = episode.name + " - " + episodeCode;
  const imageDom = document.createElement("img");
  imageDom.src = episode.image.medium;
  const summaryDom = document.createElement("p");
  // original summary contained "<p>" at start and "</p>" at the end
  summaryDom.textContent = episode.summary.substring(3, episode.summary.length - 4);
  cardDom.appendChild(nameDom);
  cardDom.appendChild(imageDom);
  cardDom.appendChild(summaryDom);
  rootElem.appendChild(cardDom);
}

window.onload = setup;
