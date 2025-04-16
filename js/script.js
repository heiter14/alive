//?apikey=&startdate=2022-02-24T00:04:21Z&bruder=4-14&muter=11-14&schwester=7-10
const defaultCountries = ["Poland", "Switzerland", "Germany"];
const defaultStartDate = "2022-02-24T00:04:21Z";
const defaultBirth = {
  Bruder: { month: 4, day: 14 },
  Muter: { month: 11, day: 14 },
  Schwester: { month: 7, day: 10 },
};
const nameClassBlock = ".allcounters";

// Parse URL params and use defaults if missing
function getBirthFromParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const birth = {};
  let hasAnyParam = false;

  for (const [key, value] of urlParams.entries()) {
      if (value && /^\d{1,2}-\d{1,2}$/.test(value)) {
          const [month, day] = value.split("-").map(Number);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              birth[key] = { month, day };
              hasAnyParam = true;
          }
      }
  }

  // Fallback to defaultBirth if no valid URL entries were found
  if (!hasAnyParam) {
      Object.assign(birth, defaultBirth);
  }

  // Handle startDate param
  const startDate = urlParams.get("startdate") || defaultStartDate;

  const apikey = urlParams.get("apikey") || "";

  const countriesParam = urlParams.get("countries");
  const countries = countriesParam
        ? countriesParam.split(",").map(c => c.trim()).filter(Boolean)
        : [];

  return { apikey, countries, birth, startDate };
}

const urlInitParams = getBirthFromParams();
const birth = urlInitParams.birth;
const startDate = new Date(urlInitParams.startDate || defaultStartDate);
const countries = urlInitParams.countries || defaultCountries

// Update current date and time
function updateCurrentDateTime() {
  const now = new Date();
  document.getElementById("currentDateTime").textContent = now.toLocaleString();
}

// Timer since startDate
function updateTimer() {
  const now = new Date();
  const diff = now - startDate;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById(
    "timer"
  ).textContent = `${days} days, ${hours}h ${minutes}m ${seconds}s`;
}

// Count how many times a birthday occurred between startDate and now
function missedYears(month, day) {
  const end = new Date();
  let count = 0;

  for (let year = startDate.getFullYear(); year <= end.getFullYear(); year++) {
    const checkDate = new Date(year, month - 1, day);
    if (checkDate >= startDate && checkDate <= end) {
      count++;
    }
  }

  return count;
}

// Render counters and update shareable URL
function calculateMissedBirthdays() {
  const container = document.querySelector(nameClassBlock);
  container.innerHTML = "";

  const params = new URLSearchParams();

  for (const key in birth) {
    const { month, day } = birth[key];
    const count = missedYears(month, day);
    const div = document.createElement("div");
    div.className = "counter";
    div.innerHTML = `${key}: <span id="${key}">${count}</span>`;
    container.appendChild(div);

    params.set(key, `${month}-${day}`);
  }

  params.set("startdate", startDate.toISOString());

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const shareableUrl = `${baseUrl}?${params.toString()}`;

  const urlBox = document.getElementById("shareable-url");
  if (urlBox) urlBox.textContent = shareableUrl;
}

// Optional: fetch running time from server
async function updateRunningTime() {
  try {
    const response = await fetch("/uptime");
    const data = await response.json();
    document.getElementById("runningTime").textContent = data.uptime;
  } catch (error) {
    console.error("Error fetching uptime:", error);
  }
}

const images = [];
const descriptions = [];
async function fetchImages(country) {
  const response = await fetch(
    `https://pixabay.com/api/?key=${urlInitParams.apikey}&q=${country}+landscape&per_page=10`
  );
  const data = await response.json();
  return data.hits.map((hit) => ({
    url: hit.webformatURL,
    description: hit.tags,
  }));
}

function setRandomBackground() {
  if (images.length) {
    const randomIndex = Math.floor(Math.random() * images.length);
    document.body.style.backgroundImage = `url(${images[randomIndex]})`;

    const uniqueTags = Array.from(
      new Set(descriptions[randomIndex].split(", "))
    ).join(", ");
    document.getElementById(
      "image-description"
    ).innerText = `Background: ${uniqueTags}`;
  } else {
    console.error("No images to set as background");
  }
}

// Auto-refresh timers
setInterval(updateCurrentDateTime, 1000);
setInterval(updateTimer, 1000);
setInterval(calculateMissedBirthdays, 1000);

async function initialize() {
  updateCurrentDateTime();
  updateTimer();
  calculateMissedBirthdays();
  //updateRunningTime(); // enable if needed
  Promise.all(countries.map(fetchImages)).then((results) => {
    results.flat().forEach((item) => {
      images.push(item.url);
      descriptions.push(item.description);
    });
    setRandomBackground();
  });
}
// Initial run
window.onload = initialize;
