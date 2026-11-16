import { FormValidator } from "./FormValidatorLibrary/FormValidator.js";

// +++ DOM References: +++

// input form
const locationInp = document.querySelector("#place");
const submit = document.querySelector("input[type='submit']");
const form = document.forms[0];
const validator = new FormValidator(form);

// output elements
const unitDisplays = document.querySelectorAll(".temp-unit");
const tempNow = document.querySelector("#today #temp");


// global app variables
const app = {
    tempUnit: "°C", // standard
    weatherData: {
        days: []
    },

    init: () => {
        // 1st init on page load
        app.tempUnit = app.getLocaleTempUnit();
        console.log(`[DEV] Local Temperature Unit:`, app.tempUnit);

        // +++ GLOBAL EVENT LISTENERS: +++
        submit.addEventListener("click", (e) => validator.handleSubmit(e, app.getWeatherData));
    },

    getLocaleTempUnit: () => {
        // extract temp unit from Locale API
        
        // the user's primary locale (e. g. "en-US")
        const localeString = navigator.languages?.[0] || navigator.language || "en-US";

        // extract region code
        const locale = new Intl.Locale(localeString);
        const region = locale.maximize().region; // e. g. "US", "DE" etc.

        // countries/territories that primarily use Fahrenheit
        const fahrenheitRegions = new Set([
            "US",
            "BS", // Bahamas
            "KY", // Cayman Islands
            "LR", // Liberia
            "PW", // Palau
            "FM", // Micronesia
            "MH" // Marshall Islands
        ]);

        return fahrenheitRegions.has(region) ? "°F" : "°C";
    },

    toggleTempUnit: () => {
        // swap temp units
        app.tempUnit = app.tempUnit === "°C" ? "°F" : "°C";
        app.displayTempUnits();
    },

    displayTempUnits: () => {
        // display the temperature unit after each field which has its temp value populated
        const tempDisplays = document.querySelectorAll(".temp");

        tempDisplays.forEach((temp) => {
            const unitDisplay = temp.nextSibling;

            if (temp.innerHTML != "") {
                unitDisplay.innerHTML = app.tempUnit;
            } else {
                unitDisplay.innerHTML = "";
            }
        })
    },

    convertFahrenheitToCelsius: (degF) => {
        const degC = ((degF - 32) * 5 / 9);
        return degC;
    },

    convertCelsiusToFahrenheit: (degC) => {
        const degF = (degC * 9 / 5) + 32;
        return degF;
    },

    formatDate: (date) => {
        return date.toISOString().slice(0,10);
    },

    formatLocaleDate: (dateEpoch) => {
        const dateMs = new Date(dateEpoch);
        const options  = {
            weekday: "short",
            year: "numeric",
            month: "numeric",
            day: "numeric",

            // 'Mo., 16.11.2026'
        };

        return dateMs.toLocaleDateString((navigator.languages?.[0] || navigator.language || "en-US"), options)
    },

    getWeatherData: async (e) => {
        
        e.preventDefault(); // prevent basic submitting + reloading of the page
        const location = locationInp.value;
        
        try {
            if (location === "") {
                throw new Error("Cannot get weather data without a location");
            }
            
            // calculate + format date1 and date2
            const date1 = new Date(Date.now());
            const date2 = new Date(date1.valueOf() + (5 * 24 * 60 * 60 * 1000)); // date1 + 5 days 
            const fDate1 = app.formatDate(date1);
            const fDate2 = app.formatDate(date2);

            // console.log(`[DEV] Date1: `, fDate1);
            // console.log(`[DEV] Date2: `, fDate2);
            
            const request = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${fDate1}/${fDate2}`;
            console.log(`[DEV] Request URL:`, request);

            const response = await fetch(request);
            const data = await response.json();
            // console.log(data);

            app.weatherData.days = data.days;
            console.log(`[DEV] app.weatherData.days`, app.weatherData.days);

            if (app.weatherData.days.length > 0) app.displayWeatherData();
        }
        catch (error) {
            console.error(error);
        };
    },

    displayWeatherData: () => {
        // Loop over app.weatherData.days, take the data of each and 
        // populate the respective container with the data

        /********

        <div id="plus-0" class="daily-weather-display">
            <span class="date-display"></span>
            <span class="temp">7</span><span class="temp-unit">°C</span>
            <span class="weather">Sunny</span>
            <span class="humidity-icon"></span><span class="humidity">55</span>
            <span class="feels-like temp">5</span><span class="temp-unit2">°C</span>
        </div>

        *********/

        app.weatherData.days.forEach((day, index) => {

            const container = document.querySelector(`#plus-${index}`);
            console.log(container);

            const date = container.querySelector(".date-display");
            const temp = container.querySelector(".temp");
            const tempUnit = container.querySelector(".temp-unit");
            const icon = container.querySelector(".weather");
            const humidityIcon = container.querySelector(".humidity-icon");
            const humidity = container.querySelector(".humidity");
            const feelsLike = container.querySelector(".feels-like");
            const temp2 = container.querySelector(".temp-unit2");

            // update each field in turn
            date.innerHTML = app.formatLocaleDate(day.datetimeEpoch);
            temp.innerHTML = day.temperature;
            // map weahter condition to icon + display in UI
            // humidityIcon.innerHTML = humidityIcon;
            humidity.innerHTML = day.humidity;
            feelsLike.innerHTML = day.feelsLike;
        });
        
        // display temp units where needed throughout the UI
        app.displayTempUnits();
    }
}

// MAIN ENTRY POINT BELOW
app.init();




// ROBERT MEYER
