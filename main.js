import { FormValidator } from "./FormValidatorLibrary/FormValidator.js";

// +++ DOM References: +++

// input form
const locationInp = document.querySelector("#place");
const unitSelector = document.querySelector(".segmented-control");
const submit = document.querySelector("input[type='submit']");
const form = document.forms[0];
const validator = new FormValidator(form);

// output elements
const unitDisplays = document.querySelectorAll(".temp-unit");
const tempNow = document.querySelector("#today #temp");


// global app variables
const app = {
    tempUnit: "°C", // standard
    lang: "en", // standard
    unitGroup: "us", // standard
    weatherData: {
        days: []
    },

    icons: {
        "humidity": "💧",
        "clear-day": "☀️",
        "clear-night": "🌙",
        "partly-cloudy-day": "🌤️",
        "partly-cloudy-night": "☁️",
        "cloudy": "☁️",
        "rain": "🌧️",
        "snow": "❄️",
        "wind": "💨",
        "fog": "🌁",
    },

    init: () => {
        // 1st init on page load
        app.lang = app.getUserLang();
        app.unitGroup = app.setUnitGroup();
        app.tempUnit = app.getLocaleTempUnit();
        console.log(`[DEV] Local Temperature Unit:`, app.tempUnit);
        console.log(`[DEV] App language:`, app.lang);
        console.log(`[DEV] App unit group:`, app.unitGroup);

        // +++ GLOBAL EVENT LISTENERS: +++
        unitSelector.addEventListener("change", (e) => app.toggleTempUnit(e));
        submit.addEventListener("click", (e) => validator.handleSubmit(e, app.getWeatherData));
    },

    getUserLang: () => {
        // the user's primary locale (e. g. "en-US")
        const localeString = navigator.languages?.[0] || navigator.language || "en-US";
        const lang = localeString.slice(0,2);
        return lang;
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

    setUnitGroup: (unitGroup) => {
        // if a unitGroup has been passed in as argument, set that one directly
        if (unitGroup) return unitGroup;

        // if no argument has been passed in, set unitGoup based on browser language and Locale
        
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

        return fahrenheitRegions.has(region) ? "us" : "metric";
    },

    toggleTempUnit: (e) => {
        console.log(`[DEV] Gewählte Einheit:`, e.target.value);

        
        // swap temp units
        const oldUnit = app.tempUnit;
        app.tempUnit = oldUnit === "°C" ? "°F" : "°C";
        console.log(`[DEV] App Einheit:`, app.tempUnit);
        
        // update unitGroup based on new temp unit, to align temp values from responses with the temp unit
        app.unitGroup = app.tempUnit === "°C" ? "metric" : "us";

        // if there are data already, update UI display
        // of values and units
        if (app.weatherData) {

            // get references to all tempereature values
            const tempValues = document.querySelectorAll(".temp");

            // update values:
            // 1. loop over every value
            // 2. cast value to number type
            // 3. convert number based on formula
            // 4. update value in UI

            switch(oldUnit) {

                // case 1: from US to metric
                case "°F":
                    // get values + convert and update each
                    tempValues.forEach(element => {
                        const numberValue = Number(element.innerHTML);
                        if (Number.isNaN(numberValue)) {
                            console.log(`[DEV] Fehler: Keine Zahl im Element:`, element);
                            return;
                        };
                        const convertedToCelsius = app.convertFahrenheitToCelsius(numberValue);
                        if (! Number.isNaN(convertedToCelsius)) element.innerHTML = convertedToCelsius; 
                    });
                    break;

                // case 2: from metric to US
                case "°C":
                    // get values + convert and update each
                    tempValues.forEach(element => {
                        const numberValue = Number(element.innerHTML);
                        if (Number.isNaN(numberValue)) {
                            console.log(`[DEV] Fehler: Keine Zahl im Element:`, element);
                            return;
                        };
                        const convertedToFahrenheit = app.convertCelsiusToFahrenheit(numberValue);
                        if (! Number.isNaN(convertedToFahrenheit)) element.innerHTML = convertedToFahrenheit; 
                    });
                    break;

                // if the former unit is neither °C nor °F, something went wrong
                default:
                    console.log(`[DEV] Error with converting temperature unit - old unit is invalid:`, oldUnit);
                    break;
            }

            // update tempUnit display
            app.displayTempUnits();
        }
        
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
        return Math.round(degC);
    },

    convertCelsiusToFahrenheit: (degC) => {
        const degF = (degC * 9 / 5) + 32;
        return Math.round(degF);
    },

    formatDate: (date) => {
        return date.toISOString().slice(0,10);
    },

    formatLocaleDate: (datetime) => {
        const dateMs = Date.parse(datetime);
        const options  = {
            weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",

            // 'Montag, 16.11.2026'
        };

        const dateObj = new Date(dateMs);
        return dateObj.toLocaleDateString((navigator.languages?.[0] || navigator.language || "en-US"), options);
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
            
            const request = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${fDate1}/${fDate2}?include=days&lang=${app.lang}&unitGroup=${app.unitGroup}`;
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

        const outerContainer = document.getElementById("weather-display-container");
        outerContainer.innerHTML = ""; // reset

        app.weatherData.days.forEach((day, index) => {

            // create a new inner Container based on the above template
            // and fill it with date from the response

            const innerContainer = document.createElement("div");
            innerContainer.setAttribute("id", `plus-${index}`);
            innerContainer.className = "daily-weather-display";
            innerContainer.innerHTML = `
                <span class="date-display">${app.formatLocaleDate(day.datetime)}</span>
                <span class="temp">${day.temp}</span><span class="temp-unit"></span>
                <span class="weather">${app.icons[day.icon] ?? day.conditions}</span>
                <span class="humidity">${day.humidity}%</span><span class="humidity-icon">${app.icons.humidity}</span>
                <span class="feels">${app.lang === "de" ? "Fühlt sich an wie:" : "Feels like:"}</span><span class="feels-like temp">${day.feelslike}</span><span class="temp-unit2 temp-unit"></span>
            `;
            innerContainer.querySelector(".weather").setAttribute("title", day.conditions ?? "");
            console.log(innerContainer);
            outerContainer.appendChild(innerContainer);
        });
        
        // display temp units where needed throughout the UI
        app.displayTempUnits();
    }
}

// MAIN ENTRY POINT BELOW
app.init();




// ROBERT MEYER
