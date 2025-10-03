const navBar = document.getElementById("navigation");
const rootElem = document.getElementById("root");
const loader = document.querySelector('#loader');

const fetchedShows = {};
const fetchedEpisodes = {};

async function getAllShows(api_url) {
  let shows = [];
  try {
    const response = await fetch(api_url);
    const data = await response.json();
    shows = Array.from(data);
    return shows;
  } catch (error) {
    console.log(error);
  }
}

async function getAllEpisodes(show_id) {
  const api_url = `https://api.tvmaze.com/shows/${show_id}/episodes`;
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
/*
async function fetchData() {
  const allShows = await getAllShows("https://api.tvmaze.com/shows");
  for (let i = 0; i < allShows.length; i++) {
    fetchedShows[allShows[i].id] = allShows[i];
    //const allEpisodes = await getAllEpisodes(allShows[i].id);
    //fetchedEpisodes[allShows[i].id] = allEpisodes;
  }
}
*/
async function fetchShows() {
  const allShows = await getAllShows("https://api.tvmaze.com/shows");
  for (let i = 0; i < allShows.length; i++) {
    fetchedShows[allShows[i].id] = allShows[i];
  }
}

async function setup() {
  await fetchShows();
  await renderPage("shows");
  loader.style.display = 'none';
}

async function renderPage(pageListing, shows = fetchedShows, selected_show_id = null) {
  navBar.innerHTML = "";
  if (pageListing === "shows") {
    createShowInput();
  }
  await createShowsSelector(pageListing, shows, selected_show_id);
}

function attachBackToShowListingButton() {
  if (document.getElementById("backToShowListingButton") != null) {
    document.getElementById("backToShowListingButton").remove();
  }
  const backToShowListingButton = document.createElement("button");
  backToShowListingButton.setAttribute("id", "backToShowListingButton");
  backToShowListingButton.textContent = "Shows listing";
  navBar.appendChild(backToShowListingButton);
  backToShowListingButton.addEventListener("click", () => {
    navBar.innerHTML = "";
    renderPage("shows");
  });
}

async function createShowsSelector(pageListing, shows, selected_show_id = null) {
  const showSelector = document.createElement("select");
  showSelector.setAttribute("id", "show-selector");
  showSelector.setAttribute("name", "show-selector");
  showSelector.setAttribute("placeholder", "Chose show");

  const showSelectorDiv = document.createElement("div");
  showSelectorDiv.setAttribute("id", "show-selector-div");
  showSelectorDiv.appendChild(showSelector);
  navBar.appendChild(showSelectorDiv);

  for (const [id, show] of Object.entries(shows)) {
    optionText = show.name;
    const option = document.createElement("option");
    option.value = id;
    option.textContent = optionText;
    showSelector.appendChild(option);
  }

  if (pageListing === "shows") {
    makePageForShows(shows);
    showSelector.addEventListener("change", async () => {
      const show_id = showSelector.value;
      await renderPage("episodes", shows, show_id);
    });
    const showsQuantityDomDom = document.createElement("p");
    showsQuantityDomDom.setAttribute("id", "displayed-shows-quantity")
    showsQuantityDomDom.textContent = `Found ${Object.keys(shows).length} shows`;
    navBar.insertBefore(showsQuantityDomDom, showSelectorDiv);
  }

  if (pageListing === "episodes") {
    if (selected_show_id != null) {
      showSelector.value = selected_show_id;
    }
    await showsEpisodesRender(showSelector.value);
    showSelector.addEventListener("change", async () => {
      const show_id = showSelector.value;
      await showsEpisodesRender(show_id);
    });
  }
}

function makePageForShows(shows) {
  rootElem.innerHTML = "";
  // to apply different positioning of show or episodes cards
  // new parent dom created
  const showCardsDom = document.createElement("div");
  showCardsDom.classList.add("show-cards-container");
  rootElem.appendChild(showCardsDom);
  for (const [id, show] of Object.entries(shows)) {
    makeShowCard(show, showCardsDom);
  }
}

async function showsEpisodesRender(show_id) {
  let allEpisodes;
  if (show_id in fetchedEpisodes) {
    allEpisodes = fetchedEpisodes[show_id];
  } else {
    allEpisodes = await getAllEpisodes(fetchedShows[show_id].id);
    fetchedEpisodes[show_id] = allEpisodes;
  }
  createEpisodesSelector(allEpisodes);
  createEpisodesInput(allEpisodes);
  createCountArea(allEpisodes);
  attachBackToShowListingButton();
  makePageForEpisodes(allEpisodes);
}

function createEpisodesSelector(allEpisodes) {
  if (document.getElementById("episode-selector-div") != null) {
    document.getElementById("episode-selector-div").remove();
  }
  const episodeSelector = document.createElement("select");
  episodeSelector.setAttribute("id", "episode-selector");
  episodeSelector.setAttribute("name", "episode-selector");
  episodeSelector.setAttribute("placeholder", "Chose episode");
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All episodes";
  episodeSelector.appendChild(defaultOption);

  const episodeSelectorDiv = document.createElement("div");
  episodeSelectorDiv.setAttribute("id", "episode-selector-div");
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
      makePageForEpisodes(allEpisodes);
      countEpisodes(allEpisodes.length, allEpisodes.length);
    } else {
      const filteredEpisodes = allEpisodes.filter((episode) => {
        const episodeCode = getEpisodeCode(episode);
        const optionText = episodeCode + " - " + episode.name;
        return optionText === selectedEpisode;
      });
      countEpisodes(allEpisodes.length, filteredEpisodes.length);
      makePageForEpisodes(filteredEpisodes);
    }
  });
}

function createEpisodesInput(allEpisodes) {
  if (document.getElementById("episode-input-div") != null) {
    document.getElementById("episode-input-div").remove();
  }
  const episodeInput = document.createElement("input");
  episodeInput.setAttribute("id", "episode-input");
  episodeInput.setAttribute("placeholder", "Please insert your text");
  episodeInput.setAttribute("type", "search");

  const episodeInputDiv = document.createElement("div");
  episodeInputDiv.setAttribute("id", "episode-input-div");
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

function createShowInput() {
  const beforeShowInputDom = document.createElement("p");
  beforeShowInputDom.textContent = "Filtering for"
  const showInputField = document.createElement("input");
  showInputField.setAttribute("id", "show-input");
  showInputField.setAttribute("placeholder", "Please insert your text");
  showInputField.setAttribute("type", "search");

  const showInputDiv = document.createElement("div");
  showInputDiv.setAttribute("id", "show-input-div");
  showInputDiv.appendChild(beforeShowInputDom);
  showInputDiv.appendChild(showInputField);
  navBar.appendChild(showInputDiv);

  showInputField.addEventListener("input", () => {
    let searchTerm = showInputField.value.toLowerCase();
    // Update the page to be empty before filteredShows append
    rootElem.innerHTML = "";
    const searchMatch = {};
    for (const [id, show] of Object.entries(fetchedShows)) {
      if (show.name.toLowerCase().includes(searchTerm) ||
        show.summary.toLowerCase().includes(searchTerm)) {
        searchMatch[id] = show;
      }
    }
    if (document.getElementById("displayed-shows-quantity") != null) {
      document.getElementById("displayed-shows-quantity").remove();
    }
    if (document.getElementById("show-selector-div") != null) {
      document.getElementById("show-selector-div").remove();
    }
    createShowsSelector("shows", searchMatch);
    makePageForShows(searchMatch);
    document.getElementById("displayed-shows-quantity").textContent = `Found ${searchMatch.length} shows`;
  });
}

function createCountArea(allEpisodes) {
  if (document.getElementById("count-area") != null) {
    document.getElementById("count-area").remove();
  }
  const countArea = document.createElement("div");
  countArea.setAttribute("id", "count-area");
  navBar.appendChild(countArea);
  countEpisodes(allEpisodes.length, allEpisodes.length);
}

function makePageForEpisodes(episodeList) {
  rootElem.innerHTML = "";
  const episodesCardsDom = document.createElement("div");
  episodesCardsDom.classList.add("episodes-cards-container");
  rootElem.appendChild(episodesCardsDom);
  for (const episode of episodeList) {
    makeEpisodeCard(episode, episodesCardsDom);
  }
}

function getEpisodeCode(episode) {
  return "S" + String(episode.season) + "E" + String(episode.number).padStart(2, "0");
}

function makeEpisodeCard(episode, parentDom) {
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
  parentDom.appendChild(cardDom);
}

function makeShowCard(show, parentDom) {
  const cardDom = document.createElement("div");
  cardDom.classList.add("show-card");

  const nameDom = document.createElement("h1");
  nameDom.textContent = show.name;
  // if show name clicked, episodes listing displayed
  nameDom.addEventListener("click", async () => {
    await renderPage("episodes", fetchedShows, show.id);
  });

  const contentDom = document.createElement("div");
  contentDom.classList.add("show-content");
  const imageDom = document.createElement("img");
  imageDom.src = show.image.medium;
  const summaryDom = document.createElement("p");
  // original summary contained "<p>" at start and "</p>" at the end
  summaryDom.innerHTML = show.summary.substring(3, show.summary.length - 4);

  const infoDom = document.createElement("div");
  infoDom.classList.add("show-info");
  const ratingDom = document.createElement("div");
  ratingDom.classList.add("show-info-item");
  const ratingNameDom = document.createElement("p");
  ratingNameDom.classList.add("info-item-name");
  ratingNameDom.textContent = "Rated:"
  const ratingValueDom = document.createElement("p");
  ratingValueDom.textContent = show.rating.average;
  ratingDom.appendChild(ratingNameDom);
  ratingDom.appendChild(ratingValueDom);

  const genresDom = document.createElement("div");
  genresDom.classList.add("show-info-item");
  const genresNameDom = document.createElement("p");
  genresNameDom.classList.add("info-item-name");
  genresNameDom.textContent = "Genres:"
  const genresValueDom = document.createElement("p");
  // add all genres to one string
  let genresStr = "";
  const genres = show.genres;
  for (let i = 0; i < genres.length; i++) {
    i != genres.length - 1 ? genresStr += genres[i] + " | " : genresStr += genres[i];
  }
  genresValueDom.textContent = genresStr;
  genresDom.appendChild(genresNameDom);
  genresDom.appendChild(genresValueDom);

  const statusDom = document.createElement("div");
  statusDom.classList.add("show-info-item");
  const statusNameDom = document.createElement("p");
  statusNameDom.classList.add("info-item-name");
  statusNameDom.textContent = "Status:"
  const statusValueDom = document.createElement("p");
  statusValueDom.textContent = show.status;
  statusDom.appendChild(statusNameDom);
  statusDom.appendChild(statusValueDom);

  const runtimeDom = document.createElement("div");
  runtimeDom.classList.add("show-info-item");
  const runtimeNameDom = document.createElement("p");
  runtimeNameDom.classList.add("info-item-name");
  runtimeNameDom.textContent = "Runtime:"
  const runtimeValueDom = document.createElement("p");
  runtimeValueDom.textContent = show.runtime;
  runtimeDom.appendChild(runtimeNameDom);
  runtimeDom.appendChild(runtimeValueDom);

  infoDom.appendChild(ratingDom);
  infoDom.appendChild(genresDom);
  infoDom.appendChild(statusDom);
  infoDom.appendChild(runtimeDom);

  cardDom.appendChild(nameDom);
  contentDom.appendChild(imageDom);
  contentDom.appendChild(summaryDom);
  contentDom.appendChild(infoDom);

  cardDom.appendChild(contentDom);
  parentDom.appendChild(cardDom);
}

function countEpisodes(countAllEpisodes, countFilteredEpisodes) {
  const countElements = document.getElementById("count-area");
  if (countElements) {
    countElements.textContent = `Displaying  ${countFilteredEpisodes} / ${countAllEpisodes} episodes`;
  }
}

window.onload = setup;
