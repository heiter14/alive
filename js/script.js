function updateCurrentDateTime() {
    const now = new Date();
    document.getElementById("currentDateTime").textContent = now.toLocaleString();
}

function updateTimer() {
    const startDate = new Date("2022-02-24T02:04:21+02:00"); // Timer since 24.02.2022 04:21
    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("timer").textContent = `${days} days, ${hours}h ${minutes}m ${seconds}s`;
}

function calculateMissedBirthdays() {
    const startYear = 2022;
    const today = new Date();
    const missedYears = today.getFullYear() - startYear;

    document.getElementById("bruder").textContent = missedYears;
    document.getElementById("muter").textContent = missedYears;
    document.getElementById("schwester").textContent = missedYears;
}

async function updateRunningTime() {
    try {
        const response = await fetch("/uptime");
        const data = await response.json();
        document.getElementById("runningTime").textContent = data.uptime;
    } catch (error) {
        console.error("Error fetching uptime:", error);
    }
}

function getApiKey() {
    const urlParams = new URLSearchParams(window.location.search);
    const apikeylocal = urlParams.get('apikey');
    return  process.env.PIXABAY_API_KEY || apikeylocal;
}

const apiKey = getApiKey();
const countries = ['Poland', 'Switzerland', 'Germany'];
const images = [];
const descriptions = [];

async function fetchImages(country) {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${country}+landscape&per_page=10`);
    const data = await response.json();
    return data.hits.map(hit => ({ url: hit.webformatURL, description: hit.tags }));
}

// Set random background image and update description
function setRandomBackground() {
    if (images.length) {
        const randomIndex = Math.floor(Math.random() * images.length);
        document.body.style.backgroundImage = `url(${images[randomIndex]})`;

        // Process description to remove duplicates
        const uniqueTags = Array.from(new Set(descriptions[randomIndex].split(', '))).join(', ');
        document.getElementById('image-description').innerText = `Background: ${uniqueTags}`;
    } else {
        console.error('No images to set as background');
    }
}

Promise.all(countries.map(fetchImages)).then(results => {
    results.flat().forEach(item => {
        images.push(item.url);
        descriptions.push(item.description);
    });
    setRandomBackground();
});

// Auto-refresh timers
setInterval(updateCurrentDateTime, 1000);
setInterval(updateTimer, 1000);
setInterval(calculateMissedBirthdays, 1000);
// setInterval(setRandomBackground, 10000);
// setInterval(updateRunningTime, 5000);

window.onload = () => {
    updateCurrentDateTime();
    updateTimer();
    calculateMissedBirthdays();
    // updateRunningTime();
};
