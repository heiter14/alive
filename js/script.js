//?apikey=&startdate=2022-02-24T00:04:21Z&bruder=4-14&muter=11-14&schwester=7-10
const countries = ["Poland", "Switzerland", "Germany"];
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
  let startDate = defaultStartDate;

  for (const key in defaultBirth) {
    const value = urlParams.get(key);
    if (value) {
      const [month, day] = value.split("-").map(Number);
      birth[key] = { month, day };
    } else {
      birth[key] = defaultBirth[key];
    }
  }

  const startDateParam = urlParams.get("startdate");
  if (startDateParam) {
    startDate = startDateParam;
  }

  const apikey = urlParams.get("apikey") || "";

  return { apikey, birth, startDate };
}

const urlInitParams = getBirthFromParams();
const birth = urlInitParams.birth;
const startDate = new Date(urlInitParams.startDate || defaultStartDate);

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
