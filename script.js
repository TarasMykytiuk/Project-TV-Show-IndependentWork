const navBar = document.getElementById("navigation");
const rootElem = document.getElementById("root");

async function setup() {
  const allEpisodes = await getAllEpisodes("https://api.tvmaze.com/shows/82/episodes");
  populateSearchBar(allEpisodes);
  makePageForEpisodes(allEpisodes);
}

async function getAllEpisodes(api_url) {
  let episodes = [];
  try {
    const response = await fetch(api_url);
    const data = await response.json();
    episodes = Array.from(data);
    return episodes;
  } catch (error) {
    console.log(error);
  }
}

function populateSearchBar(allEpisodes) {
  createEpisodesSelector(allEpisodes);
  createEpisodesInput(allEpisodes);
  createCountArea(allEpisodes);
}

function createEpisodesSelector(allEpisodes) {
  const episodeSelector = document.createElement("select");
  episodeSelector.setAttribute("id", "episode-selector");
  episodeSelector.setAttribute("name", "episode-selector");
  episodeSelector.setAttribute("placeholder", "Chose episode");
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All episodes";
  episodeSelector.appendChild(defaultOption);

  const episodeSelectorDiv = document.createElement("div");
  episodeSelectorDiv.appendChild(episodeSelector);
  navBar.appendChild(episodeSelectorDiv);

  allEpisodes.forEach((episode) => {
    const episodeCode = getEpisodeCode(episode);
    optionText = episodeCode + " - " + episode.name;
    const option = document.createElement("option");
    option.value = optionText;
    option.textContent = optionText;
    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", () => {
    //selector with filtering
    const selectedEpisode = episodeSelector.value;
    if (selectedEpisode === "all") {
      rootElem.innerHTML = "";
      makePageForEpisodes(allEpisodes);
      countEpisodes(allEpisodes.length, allEpisodes.length);
    } else {
      const filteredEpisodes = allEpisodes.filter((episode) => {
        const episodeCode = getEpisodeCode(episode);
        const optionText = episodeCode + " - " + episode.name;
        return optionText === selectedEpisode;
      });
      countEpisodes(allEpisodes.length, filteredEpisodes.length);
      rootElem.innerHTML = "";
      makePageForEpisodes(filteredEpisodes);
    }
  });
}

function createEpisodesInput(allEpisodes) {
  const episodeInput = document.createElement("input");
  episodeInput.setAttribute("id", "episode-input");
  episodeInput.setAttribute("placeholder", "Please insert your text");
  episodeInput.setAttribute("type", "search");

  const episodeInputDiv = document.createElement("div");
  episodeInputDiv.appendChild(episodeInput);
  navBar.appendChild(episodeInputDiv);

  episodeInput.addEventListener("input", () => {
    const searchTerm = episodeInput.value;
    // Update the page to be empty before filteredEpisodes append
    rootElem.innerHTML = "";
    let searchMatch = [];
    for (const episode of allEpisodes) {
      if (episode.name.includes(searchTerm) || episode.summary.includes(searchTerm)) {
        searchMatch.push(episode);
      }
    }
    const episodeSelector = document.getElementById("episode-selector");
    episodeSelector.value = "all";

    makePageForEpisodes(searchMatch);
    countEpisodes(allEpisodes.length, searchMatch.length);
  });
}

function createCountArea(allEpisodes) {
  const countArea = document.createElement("div");
  countArea.setAttribute("id", "count-area");
  navBar.appendChild(countArea);
  countEpisodes(allEpisodes.length, allEpisodes.length);
}

function makePageForEpisodes(episodeList) {
  for (const episode of episodeList) {
    makeEpisodeCard(episode);
  }
}

function getEpisodeCode(episode) {
  return "S" + String(episode.season) + "E" + String(episode.number).padStart(2, "0");
}

function makeEpisodeCard(episode) {
  const episodeCode = getEpisodeCode(episode);
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

function countEpisodes(countAllEpisodes, countFilteredEpisodes) {
  const countElements = document.getElementById("count-area");
  if (countElements) {
    countElements.textContent = `Displaying  ${countFilteredEpisodes} / ${countAllEpisodes} episodes`;
  }
}

window.onload = setup;
