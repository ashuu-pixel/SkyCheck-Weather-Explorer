# ☁️ SkyCheck — Weather & City Explorer

SkyCheck is a responsive weather application that allows users to search for a city and view its current weather conditions using the free Open-Meteo API.

## ✨ Features

- Search for cities around the world.
- Fetch real weather data using asynchronous JavaScript.
- Display temperature, weather condition, apparent temperature, and wind information.
- Responsive design for desktop and mobile screens.
- Animated loading spinner.
- Specific error messages for different request failures.
- Retry button for failed requests.
- Duplicate-submission protection.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API and async/await
- Open-Meteo Geocoding API
- Open-Meteo Forecast API

## 🔄 Application States

### 1. Initial State
Displays "Search for a city to see the weather" before a search is performed.

### 2. Loading State
Displays an animated spinner while city coordinates and weather information are being requested.

### 3. Success State
Displays the city name, country, temperature, weather description, apparent temperature, wind speed, and wind direction.

### 4. Error State
Displays meaningful messages for different problems:
- City not found: the requested city could not be located.
- Network error: the browser cannot connect to the service.
- Server error: the weather service returns an HTTP 5xx response.
- Rate limiting: the service returns HTTP 429.
- Invalid response: the returned data is missing or unreadable.

## 🌐 API Documentation

This project uses Open-Meteo, which provides weather data without requiring an API key for eligible non-commercial use.

- Geocoding API: https://open-meteo.com/en/docs/geocoding-api
- Weather Forecast API: https://open-meteo.com/en/docs

The application first searches for the city's coordinates and then requests current weather conditions for those coordinates.

## 🚨 API Downtime and Rate Limiting

If the API is unavailable, the application displays an error message instead of remaining stuck on the loading screen. Network failures, HTTP server errors, and rate-limit responses are handled separately.

If the service is temporarily unavailable or rate-limited, users can wait and retry. The application does not automatically retry failed requests.

## 🚀 How to Run

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Install the Live Server extension if necessary.
4. Right-click `index.html` and select **Open with Live Server**.
5. Enter a city name and click **Explore**.
6. Keep an internet connection active to fetch live weather data.

## 🔐 Security

This application does not require a private API key. No `.env` file or `.env.example` file is necessary for the current implementation. The `.gitignore` file excludes local environment files and other private configuration files.

## 🧪 Testing

Test the following scenarios:

- Initial page load.
- Successful search using a valid city.
- Search using an invalid city name.
- Network failure by temporarily disconnecting the internet.
- Repeated clicks while a request is in progress.
- API errors using Chrome DevTools or mocked responses.

## 👩‍💻 Project Goal

SkyCheck demonstrates real API integration, asynchronous request handling, distinct UI states, responsive design, and meaningful error handling.

Created as an internship project.