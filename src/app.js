// Define the statuses array
let statuses = [];

// Append a <title> element to each <path> element in the SVG
appendTitles();

// Set the initial UI
updateUI();

// Update the UI every 10 seconds
setInterval(() => {
  updateUI();
}, 1000);

// Function that updates the UI
async function updateUI() {
  // Fetch the list of enabled regions from the server
  const dataChanged = await fetchData();

  // If the data has not been changed, return
  if (!dataChanged) {
    return;
  }

  // Get all the paths that correspond to the map regions
  const pathArray = document.querySelectorAll('body svg path');

  // Loop through each of the paths
  pathArray.forEach((path) => {
    // Get the name of the region
    const name = path.getAttribute('name');

    // Find the region in the statuses array
    const region = statuses.find(
      (region) => region.name === convertRegionName(name, 'uk')
    );

    // If the region is enabled, add the enabled class
    if (region?.alert) {
      path.classList.add('enabled');
      // If the region is not enabled, remove the enabled class
    } else {
      path.classList.remove('enabled');
    }
  });

  // Sort the regions
  sortRegions();
}

// Function that appends a <title> element to each <path> element in the SVG
function appendTitles() {
  // Set the default title
  updateTitle('', true);

  // Get all the paths in the SVG
  const pathArray = document.querySelectorAll('body svg path');

  // Loop through all the paths
  pathArray.forEach((path) => {
    updateTitle('', true);

    // Get the name attribute of each path
    const name = path.getAttribute('name');

    // Convert the name to Ukrainian
    const ukrainianName = convertRegionName(name, 'uk');

    // Add event listeners to each path
    path.addEventListener('mouseover', () => updateTitle(ukrainianName));
    path.addEventListener('touchstart', () => updateTitle(ukrainianName));
    path.addEventListener('mouseout', () => updateTitle('', true));
    path.addEventListener('touchend', () => updateTitle('', true));
  });
}

// Function that fetches data from the API and returns an array of enabled regions
async function fetchData() {
  // API endpoint and key in Base64
  const ENDPOINT = 'https://alerts.com.ua/api/states';
  const KEY = 'ODRhMzNhOTY5YmY5Y2IzMGU0MzA0ODAzNGI1NjQyZDJjMDg3MjE5Yg==';

  // Fetch the data from the API
  const response = await fetch(ENDPOINT, {
    headers: {
      'X-API-Key': atob(KEY),
    },
  });

  // Check if the response is ok
  if (!response.ok) {
    throw new Error('Something went wrong with the request');
  }

  // Parse the response as JSON
  const data = await response.json();

  // Get the states from the response
  const states = data.states;

  // Empty an array to store statuses
  const _statuses = [];

  // Loop through the states
  states.forEach((state) => {
    // Add it to the array
    _statuses.push({
      alert: state.alert,
      name: state.name,
      changed: state.changed,
    });
  });

  // Check if the data has changed
  let changed = false;
  _statuses.forEach((status, index) => {
    if (status.changed !== statuses[index]?.changed) {
      changed = true;
    }
  });

  // If the data has not changed, return
  if (!changed) {
    return false;
  }

  // Update the statuses array
  statuses = _statuses;

  // Return that flag that indicates whether the data has been changed
  return true;
}

// Function that converts the Ukrainian name of a region to English, and vice versa.
// It takes two arguments: name and language.
// The name argument is a string that contains the name of the region.
// The language argument is a string that contains the language code.
// The function returns a string that contains the name of the region in the specified language.
function convertRegionName(name, language = 'uk') {
  // If the language is not 'uk' or 'en', throw an Error
  if (language !== 'uk' && language !== 'en') {
    throw new Error('Language must be either "uk" or "en"');
  }

  // Array of Ukrainian and English region names
  const TRANSLATIONS = [
    ['АР Крим', 'Crimea'],
    ['Вінницька область', 'Vinnytsya'],
    ['Волинська область', 'Volyn'],
    ['Дніпропетровська область', "Dnipropetrovs'k"],
    ['Донецька область', "Donets'k"],
    ['Житомирська область', 'Zhytomyr'],
    ['Закарпатська область', 'Transcarpathia'],
    ['Запорізька область', 'Zaporizhzhya'],
    ['Івано-Франківська область', "Ivano-Frankivs'k"],
    ['Київська область', 'Kyiv'],
    ['Кіровоградська область', 'Kirovohrad'],
    ['Луганська область', "Luhans'k"],
    ['Львівська область', "L'viv"],
    ['Миколаївська область', 'Mykolayiv'],
    ['Одеська область', 'Odessa'],
    ['Полтавська область', 'Poltava'],
    ['Рівненська область', 'Rivne'],
    ['Сумська область', 'Sumy'],
    ['Тернопільська область', "Ternopil'"],
    ['Харківська область', 'Kharkiv'],
    ['Херсонська область', 'Kherson'],
    ['Хмельницька область', "Khmel'nyts'kyy"],
    ['Черкаська область', 'Cherkasy'],
    ['Чернівецька область', 'Chernivtsi'],
    ['Чернігівська область', 'Chernihiv'],
    ['м. Київ', 'Kyiv City'],
    ['м. Севастополь', 'Sevastopol'],
  ];

  // Find the translation array with the specified name in the TRANSLATIONS array.
  const translation = TRANSLATIONS.find(
    (translation) => translation[0] === name || translation[1] === name
  );

  // If the translation isn't found, throw an error.
  if (!translation) {
    throw new Error('Region not found');
  }

  // If the language is 'uk', return the first element of the translation array.
  if (language === 'uk') {
    return translation[0];
  } else if (language === 'en') {
    // If the language is 'en', return the second element of the translation array.
    return translation[1];
  }
}

// Function that updates the title of the map
function updateTitle(title, remove = false) {
  // Get the title element
  const titleElement = document.querySelector('body .footer__title');
  const descriptionElement = document.querySelector('body .footer__text');

  // If the remove flag is true, set the title to the default value and return
  if (remove) {
    titleElement.textContent = 'Карта повітряних тривог';
    descriptionElement.textContent = 'Дані оновлюються щосекунди';
    return;
  }

  // Find the region in the statuses array
  const region = statuses.find(
    (region) => region.name === convertRegionName(title, 'uk')
  );

  // Convert the date to a string
  const changedString = region?.changed
    ? new Date(region?.changed).toLocaleString('uk-UA')
    : undefined;

  // Check if the region has an alert
  if (region?.alert) {
    // Set the text of the description element to the string with the date of the last change.
    descriptionElement.textContent = changedString
      ? `Тривоги з: ${changedString}`
      : 'Дані про цю область відсутні';
  } else {
    // Set the text of the description element to the string with the date of the last change.
    descriptionElement.textContent = changedString
      ? `Тривоги немає з: ${changedString}`
      : `Дані про ${
          title.startsWith('м.') ? 'це місто' : 'цю область'
        } відсутні`;
  }

  // Set the text of the title element
  titleElement.textContent = title;
}

// Function that sorts the regions in the svg element so that the enabled regions are on top
function sortRegions() {
  // Get the svg element
  const svg = document.querySelector('svg');

  // Get paths without the 'enabled' class
  const paths = svg.querySelectorAll('path:not(.enabled)');

  // Get paths with the 'enabled' class
  const enabledPaths = svg.querySelectorAll('path.enabled');

  // Append not enabled paths to the svg element
  paths.forEach((path) => svg.appendChild(path));

  // Append enabled paths to the svg element
  enabledPaths.forEach((path) => svg.appendChild(path));
}
