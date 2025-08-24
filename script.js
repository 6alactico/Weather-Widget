const API_KEY = "464405fd6b5f9a81a78032826a9fe99f";
const lat = 32.7755;
const lon = -96.7955;

async function getCurrentWeather() {
    const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;

    try {
        // Get observation station from lat/lon
        const pointRes = await fetch(pointUrl);
        if (!pointRes.ok) throw new Error(`Point fetch error: ${pointRes.status}`);
        const pointData = await pointRes.json();
        const stationUrl = pointData.properties.observationStations;
        console.log("Point Data:", pointData);

        // Step 2: Get station list, pick first, get latest observation
        const stationsRes = await fetch(stationUrl);
        if (!stationsRes.ok) throw new Error(`Stations fetch error: ${stationsRes.status}`);
        const stationsData = await stationsRes.json();
        const stationId = stationsData.features[0].properties.stationIdentifier;

        const obsUrl = `https://api.weather.gov/stations/${stationId}/observations/latest`;
        const obsRes = await fetch(obsUrl);
        if (!obsRes.ok) throw new Error(`Observation fetch error: ${obsRes.status}`);
        const obsData = await obsRes.json();
        console.log("Observation Data:", obsData);
        getCurrentWeatherData(pointData, obsData);
    } catch (error) {
        console.error(error.message);
    }
}

function getCurrentWeatherData(pointData, obsData) {
    const cityName = document.getElementById('city-name');
    cityName.textContent = pointData.properties.relativeLocation.properties.city;

    const currentTemp = document.getElementById("current-temp");
    const icon = document.querySelector(".current-weather-icon");

    const description = obsData.properties.textDescription;

    const weatherType = document.getElementById("weather-type");
    weatherType.innerText = description;
    getWeatherIcons(description, icon);
    setBackgroundColor(description);
    
    const tempC = obsData.properties.temperature.value;
    const tempF = tempC !== null ? ((tempC * 9) / 5 + 32).toFixed(1) : "N/A";
    currentTemp.innerText = `${Math.round(tempF)}°`;
}

async function getHourlyForecast() {
    const url = `https://api.weather.gov/gridpoints/FWD/89,104/forecast/hourly`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Reponse status: ${response.status}`);
        }

        const weatherForecast = await response.json();
        console.log("Weather forecast", weatherForecast);
        getHourlyForecastData(weatherForecast);
    } catch (error) {
        console.error(error.message);
    }
}

function getHourlyForecastData(weatherForecast) {
    const weatherEl = document.getElementById('weather-forecast');
    const currentDateEl = document.getElementById('current-date');

    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // +24 hours
    const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Chicago"
    };

    const currentDateStr = currentDate.toLocaleString("en-US", options);
    currentDateEl.textContent = currentDateStr;

    const periods = weatherForecast.properties.periods;

    periods.forEach(period => {
        const periodStart = new Date(period.startTime);

        if (currentDate <= periodStart && periodStart <= endDate) {
            const formattedTime = periodStart.toLocaleTimeString("en-US", {
                hour: 'numeric',
                hour12: true,
                timeZone: "America/Chicago"
            });

            const item = document.createElement("li");
            item.className = "flex-column forecast-item";

            const time = document.createElement("span");
            const temp = document.createElement("span");
            const icon = document.createElement("span");

            const shortForecast = period.shortForecast;

            time.innerText = formattedTime;
            temp.innerText = `${period.temperature}°`;
            // image.src = period.icon;
            
            getWeatherIcons(shortForecast, icon);
            console.log(shortForecast);

            item.append(time, icon, temp);
            weatherEl.append(item);
        }
    });
}

function getWeatherIcons(forecast, iconEl) {
    if (forecast === "Slight Chance Showers And Thunderstorms") {
        iconEl.innerText = "⛈️";
        document.body.classList.add("slight-chance");
    } else if (forecast === "Sunny") {
        iconEl.innerText = "☀️";
    } else if (forecast === "Clear" || forecast === "Mostly Clear") {
        iconEl.innerText = "☁️";
    } else if (forecast === "Mostly Sunny") {
        iconEl.innerText = "🌤️";
    } else if (forecast === "Partly Cloudy"){
        iconEl.innerText = "⛅️";
    } else if (forecast === "Mostly Cloudy") {
        iconEl.innerText = "🌥️";
    } else {
        iconEl.innerText = "🌡️";
    }
}

function setBackgroundColor(description) {
    const body = document.body;
    body.classList.remove("slight-chance");

    if (description === "Slight Chance Showers And Thunderstorms") {
        body.classList.add("slight-chance");
    } else if (description === "Sunny") {
        body.classList.add("sunny");
    } else if (description === "Clear" || description === "Mostly Clear") {
        body.classList.add("mostly-clear");
    } else if (description === "Mostly Sunny") {
        body.classList.add("mostly-sunny");
    } else if (description === "Partly Cloudy"){
        body.classList.add("partly-cloudy");
    } else if (description === "Mostly Cloudy") {
        body.classList.add("mostly-cloudy");
    } else {
        body.classList.add("default-bg");
    } 
}

getCurrentWeather();
getHourlyForecast();