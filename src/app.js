// Append a <title> element to each <path> element in the SVG
appendTitles();

// Set the initial UI
updateUI();

// Update the UI every 10 seconds
setInterval(() => {
  updateUI();
}, 10000);

// Function that updates the UI
async function updateUI() {
  // Fetch the list of enabled regions from the server
  const enabledRegions = await fetchData();

  // Get all the paths that correspond to the map regions
  const pathArray = document.querySelectorAll('body svg path');

  // Loop through each of the paths
  pathArray.forEach((path) => {
    // Get the name of the region
    const name = path.getAttribute('name');

    // If the region is enabled, add the enabled class
    if (enabledRegions.includes(name)) {
      path.classList.add('enabled');
      // If the region is not enabled, remove the enabled class
    } else {
      path.classList.remove('enabled');
    }
  });
}

// Function that appends a <title> element to each <path> element in the SVG
function appendTitles() {
  // Get all the paths in the SVG
  const pathArray = document.querySelectorAll('body svg path');

  // Loop through all the paths
  pathArray.forEach((path) => {
    // Get the name attribute of each path
    const name = path.getAttribute('name');

    // Convert the name to Ukrainian
    const ukrainianName = convertRegionName(name, 'uk');

    // Create a <title> element
    const title = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'title'
    );
    // Add the Ukrainian name as text content to the <title> element
    title.textContent = ukrainianName;
    // Append the <title> element to the <path> element
    path.appendChild(title);
  });
}

// Function that fetches data from the API and returns an array of enabled regions
async function fetchData() {
  // API endpoint and key in Base64
  const ENDPOINT =
    'https://alerts.com.ua/api/states';
  const KEY = 'ODRhMzNhOTY5YmY5Y2IzMGU0MzA0ODAzNGI1NjQyZDJjMDg3MjE5Yg==';

  // Fetch the data from the API
  const response = await fetch(ENDPOINT, {
    headers: {
      'X-API-Key': atob(KEY)
    }
  });

  // Check if the response is ok
  if (!response.ok) {
    throw new Error('Something went wrong with the request');
  }

  // Parse the response as JSON
  const data = await response.json();

  // Get the states from the response
  const states = data.states;

  // Create an empty array to store the enabled regions
  const enabledRegions = [];

  // Loop through the states
  states.forEach(state => {
    // If the state is enabled
    if (state.alert) {
      // Add it to the array
      enabledRegions.push(convertRegionName(state.name, 'en'));
    }
  });

  // Return the array of enabled regions
  return enabledRegions;
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
    ['Дніпропетровська область', 'Dnipropetrovs\'k'],
    ['Донецька область', 'Donets\'k'],
    ['Житомирська область', 'Zhytomyr'],
    ['Закарпатська область', 'Transcarpathia'],
    ['Запорізька область', 'Zaporizhzhya'],
    ['Івано-Франківська область', 'Ivano-Frankivs\'k'],
    ['Київська область', 'Kyiv'],
    ['Кіровоградська область', 'Kirovohrad'],
    ['Луганська область', 'Luhans\'k'],
    ['Львівська область', 'L\'viv'],
    ['Миколаївська область', 'Mykolayiv'],
    ['Одеська область', 'Odessa'],
    ['Полтавська область', 'Poltava'],
    ['Рівненська область', 'Rivne'],
    ['Сумська область', 'Sumy'],
    ['Тернопільська область', 'Ternopil\''],
    ['Харківська область', 'Kharkiv'],
    ['Херсонська область', 'Kherson'],
    ['Хмельницька область', 'Khmel\'nyts\'kyy'],
    ['Черкаська область', 'Cherkasy'],
    ['Чернівецька область', 'Chernivtsi'],
    ['Чернігівська область', 'Chernihiv'],
    ['м. Київ', 'Kyiv City'],
    ['м. Севастополь', 'Sevastopol']
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
