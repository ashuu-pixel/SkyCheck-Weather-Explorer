

const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const buttonText = document.getElementById("buttonText");
const retryButton = document.getElementById("retryButton");

const initialState = document.getElementById("initialState");
const loadingState = document.getElementById("loadingState");
const successState = document.getElementById("successState");
const errorState = document.getElementById("errorState");

const errorTitle = document.getElementById("errorTitle");
const errorMessage = document.getElementById("errorMessage");
const errorIcon = document.getElementById("errorIcon");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const feelsLike = document.getElementById("feelsLike");
const windSpeed = document.getElementById("windSpeed");
const windDirection = document.getElementById("windDirection");
const lastUpdated = document.getElementById("lastUpdated");

// 2. API URLS

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

// 3. REQUEST CONTROL

let isLoading = false;
let lastSearchedCity = "";

// 4. WEATHER CONDITION CODES

function getWeatherDescription(code) {
    const conditions = {
        0: { description: "Clear sky", icon: "☀️" },
        1: { description: "Mainly clear", icon: "🌤️" },
        2: { description: "Partly cloudy", icon: "⛅" },
        3: { description: "Overcast", icon: "☁️" },
        45: { description: "Foggy", icon: "🌫️" },
        48: { description: "Depositing rime fog", icon: "🌫️" },
        51: { description: "Light drizzle", icon: "🌦️" },
        53: { description: "Moderate drizzle", icon: "🌦️" },
        55: { description: "Dense drizzle", icon: "🌧️" },
        56: { description: "Light freezing drizzle", icon: "🌧️" },
        57: { description: "Dense freezing drizzle", icon: "🌧️" },
        61: { description: "Slight rain", icon: "🌦️" },
        63: { description: "Moderate rain", icon: "🌧️" },
        65: { description: "Heavy rain", icon: "🌧️" },
        66: { description: "Light freezing rain", icon: "🌧️" },
        67: { description: "Heavy freezing rain", icon: "🌧️" },
        71: { description: "Slight snowfall", icon: "🌨️" },
        73: { description: "Moderate snowfall", icon: "❄️" },
        75: { description: "Heavy snowfall", icon: "❄️" },
        77: { description: "Snow grains", icon: "🌨️" },
        80: { description: "Slight rain showers", icon: "🌦️" },
        81: { description: "Moderate rain showers", icon: "🌧️" },
        82: { description: "Violent rain showers", icon: "⛈️" },
        85: { description: "Slight snow showers", icon: "🌨️" },
        86: { description: "Heavy snow showers", icon: "❄️" },
        95: { description: "Thunderstorm", icon: "⛈️" },
        96: { description: "Thunderstorm with hail", icon: "⛈️" },
        99: { description: "Thunderstorm with heavy hail", icon: "⛈️" }
    };

    return conditions[code] || {
        description: "Weather conditions unavailable",
        icon: "🌍"
    };
}

// 5. WIND DIRECTION

function getWindDirection(degrees) {
    if (!Number.isFinite(degrees)) {
        return "Unavailable";
    }

    const directions = [
        "N", "NE", "E", "SE",
        "S", "SW", "W", "NW"
    ];

    return directions[
        Math.round(degrees / 45) % 8
    ];
}

// 6. SHOW ONLY ONE UI STATE

function showState(state) {
    initialState.classList.add("hidden");
    loadingState.classList.add("hidden");
    successState.classList.add("hidden");
    errorState.classList.add("hidden");

    if (state === "initial") {
        initialState.classList.remove("hidden");
    } else if (state === "loading") {
        loadingState.classList.remove("hidden");
    } else if (state === "success") {
        successState.classList.remove("hidden");
    } else if (state === "error") {
        errorState.classList.remove("hidden");
    }
}

// 7. DISPLAY SPECIFIC ERRORS

function showError(title, message, icon = "⚠️") {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorIcon.textContent = icon;

    showState("error");
}

// 8. FETCH JSON WITH ERROR HANDLING

async function fetchJSON(url) {
    let response;

    try {
        response = await fetch(url);
    } catch (error) {
        // Network failures and browser-level fetch failures
        throw new Error(
            "NETWORK_ERROR: Check your internet connection and try again."
        );
    }

    // Fetch does not automatically reject for HTTP 4xx or 5xx.
    if (!response.ok) {
        if (response.status === 429) {
            throw new Error(
                "RATE_LIMIT: Too many requests. Please wait a little and try again."
            );
        }

        if (response.status >= 500) {
            throw new Error(
                "SERVER_ERROR: The weather service is temporarily unavailable."
            );
        }

        throw new Error(
            `HTTP_ERROR: The service returned status ${response.status}. Please try again.`
        );
    }

    try {
        return await response.json();
    } catch (error) {
        throw new Error(
            "INVALID_RESPONSE: The weather service returned unreadable data."
        );
    }
}

// 9. FIND CITY COORDINATES

async function getCityCoordinates(city) {
    const params = new URLSearchParams({
        name: city,
        count: "1",
        language: "en",
        format: "json"
    });

    const data = await fetchJSON(
        `${GEOCODING_API}?${params.toString()}`
    );

    if (!Array.isArray(data.results) || data.results.length === 0) {
        throw new Error(
            "CITY_NOT_FOUND: We couldn't find that city. Check the spelling and try again."
        );
    }

    const location = data.results[0];

    if (
        !Number.isFinite(location.latitude) ||
        !Number.isFinite(location.longitude)
    ) {
        throw new Error(
            "INVALID_LOCATION: We couldn't get coordinates for this city."
        );
    }

    return location;
}

// 10. FETCH CURRENT WEATHER

async function getCurrentWeather(location) {
    const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m"
        ].join(","),
        timezone: "auto"
    });

    const data = await fetchJSON(
        `${WEATHER_API}?${params.toString()}`
    );

    if (!data.current) {
        throw new Error(
            "INVALID_RESPONSE: Current weather data is unavailable."
        );
    }

    const current = data.current;

    if (
        !Number.isFinite(current.temperature_2m) ||
        !Number.isFinite(current.weather_code)
    ) {
        throw new Error(
            "INVALID_RESPONSE: The weather data is incomplete."
        );
    }

    return data;
}

// 11. DISPLAY WEATHER DATA

function displayWeather(location, data) {
    const current = data.current;
    const weather = getWeatherDescription(current.weather_code);

    cityName.textContent = location.name;

    countryName.textContent = [
        location.admin1,
        location.country
    ].filter(Boolean).join(", ");

    weatherIcon.textContent = weather.icon;

    // Differentiate night and daytime for clear weather.
    if (current.is_day === 0 && current.weather_code <= 1) {
        weatherIcon.textContent = "🌙";
    }

    temperature.textContent =
        Math.round(current.temperature_2m);

    weatherCondition.textContent = weather.description;

    feelsLike.textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°C`;

    windSpeed.textContent =
        Number.isFinite(current.wind_speed_10m)
            ? `${current.wind_speed_10m} km/h`
            : "Unavailable";

    windDirection.textContent =
        getWindDirection(current.wind_direction_10m);

    lastUpdated.textContent = current.time
        ? `Local observation time: ${current.time.replace("T", " ")}`
        : "Current weather retrieved successfully.";

    showState("success");
}

// 12. MAIN SEARCH FUNCTION

async function searchWeather(city) {
    // Prevent duplicate rapid submissions.
    if (isLoading) {
        return;
    }

    const searchCity = city.trim();

    if (!searchCity) {
        showError(
            "City name required",
            "Please enter a city name before searching.",
            "✏️"
        );
        cityInput.focus();
        return;
    }

    isLoading = true;
    lastSearchedCity = searchCity;

    searchButton.disabled = true;
    retryButton.disabled = true;
    buttonText.textContent = "Loading...";

    showState("loading");

    try {
        // First request: find city coordinates.
        const location = await getCityCoordinates(searchCity);

        // Second request: get current weather.
        const weatherData = await getCurrentWeather(location);

        // Display the successful result.
        displayWeather(location, weatherData);

    } catch (error) {
        console.error("SkyCheck request failed:", error);

        const message = error.message || "";

        if (message.startsWith("CITY_NOT_FOUND:")) {
            showError(
                "City not found",
                `We couldn't find "${searchCity}". Check the spelling or try another city.`,
                "🔎"
            );

        } else if (message.startsWith("NETWORK_ERROR:")) {
            showError(
                "Connection problem",
                "We couldn't connect to the weather service. Check your internet connection and retry.",
                "📡"
            );

        } else if (message.startsWith("RATE_LIMIT:")) {
            showError(
                "Too many requests",
                "The weather service is receiving too many requests. Please wait before trying again.",
                "⏳"
            );

        } else if (message.startsWith("SERVER_ERROR:")) {
            showError(
                "Weather service unavailable",
                "The weather server may be down temporarily. Please try again later.",
                "🌩️"
            );

        } else if (message.startsWith("INVALID_RESPONSE:")) {
            showError(
                "Weather data unavailable",
                "The service returned incomplete or unreadable data. Please retry later.",
                "⚠️"
            );

        } else {
            showError(
                "Something went wrong",
                "We couldn't retrieve the weather right now. Please try again.",
                "⚠️"
            );
        }

    } finally {
        // Always restore the controls, even if the request fails.
        isLoading = false;
        searchButton.disabled = false;
        retryButton.disabled = false;
        buttonText.textContent = "Explore";
    }
}

// 13. FORM SUBMISSION

weatherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    await searchWeather(cityInput.value);
});

// 14. RETRY BUTTON

retryButton.addEventListener("click", async function () {
    if (lastSearchedCity && !isLoading) {
        await searchWeather(lastSearchedCity);
    }
});

// 15. INITIAL STATE

showState("initial");

console.log("SkyCheck initialized successfully.");
