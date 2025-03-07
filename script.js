// Define your API key and base URL
const apiKey = "0cc510fa93b8708f7ef25610cf03692b"; // Replace with your OpenWeather API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

// Fetch and display main weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`${apiUrl}?q=${city}&units=metric&appid=${apiKey}`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();

        // Update main weather info
        document.getElementById("city-name").textContent = data.name;
        document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById("description").textContent = data.weather[0].description;
        document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
        document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;

        // Weather icon
        const iconCode = data.weather[0].icon;
        document.getElementById("weather-icon").innerHTML = `
            <img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${data.weather[0].description}">
        `;

        // Fetch UV Index (requires separate API call)
        const uvResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`
        );
        const uvData = await uvResponse.json();
        document.getElementById("uv-index").textContent = uvData.value;
    } catch (error) {
        console.error(error.message);
        document.getElementById("description").textContent = "City not found or an error occurred.";
    }
}

// Fetch and display hourly forecast
async function fetchHourlyForecast(city) {
    try {
        const response = await fetch(`${apiUrl}?q=${city}&units=metric&appid=${apiKey}`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        // Fetch hourly forecast
        const hourlyResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        const forecastData = await hourlyResponse.json();

        // Update hourly forecast
        const hourlyCards = document.getElementById("forecast-cards");
        hourlyCards.innerHTML = ""; // Clear previous data
        forecastData.list.slice(0, 6).forEach((hour) => {
            const card = document.createElement("div");
            card.classList.add("forecast-card");
            const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            card.innerHTML = `
                <h4>${time}</h4>
                <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}">
                <p>${Math.round(hour.main.temp)}°C</p>
                <p>${hour.weather[0].description}</p>
            `;
            hourlyCards.appendChild(card);
        });
    } catch (error) {
        console.error(error.message);
    }
}
const popularCities = ['New York', 'London', 'Tokyo', 'Paris', 'Dubai', 'Sydney', 'Moscow', 'Mumbai'];

async function fetchPopularCitiesWeather() {
    const cityContainer = document.getElementById('popular-cities');
    cityContainer.innerHTML = ''; // Clear previous data
    for (const city of popularCities) {
        try {
            const response = await fetch(`${apiUrl}?q=${city}&units=metric&appid=${apiKey}`);
            if (!response.ok) throw new Error(`Weather data for ${city} not found`);
            const data = await response.json();

            // Create a weather card for the city
            const cityCard = document.createElement('div');
            cityCard.classList.add('city-card');
            cityCard.innerHTML = `
                <h3>${data.name}</h3>
                <p><strong>${Math.round(data.main.temp)}°C</strong></p>
                <p>${data.weather[0].description}</p>
                <p>Feels Like: ${Math.round(data.main.feels_like)}°C</p>
            `;
            cityContainer.appendChild(cityCard);
        } catch (error) {
            console.error(`Error fetching weather for ${city}: ${error.message}`);
        }
    }
}

// Fetch default city weather and popular cities on load
fetchWeather('London');
fetchHourlyForecast("London");
fetchPopularCitiesWeather();
// On load, fetch weather and hourly forecast for the default city



// Handle search button click
document.getElementById("search-button").addEventListener("click", () => {
    const city = document.getElementById("city-input").value.trim();
    if (city) {
        fetchWeather(city);
        fetchHourlyForecast(city);
    } else {
        alert("Please enter a city name.");
    }
});
