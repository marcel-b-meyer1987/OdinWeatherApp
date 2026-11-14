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

    init: () => {
        // 1st init on page load
        app.tempUnit = app.getLocaleTempUnit();
        console.log(`[DEV] Local Temperature Unit:`, app.tempUnit);

        // +++ GLOBAL EVENT LISTENERS: +++
        submit.addEventListener("click", (e) => {
            e.preventDefault();
            app.getWeatherData();
        });
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
                unitDisplay.innerHTML = this.tempUnit;
            } else {
                unitDisplay.innerHTML = "";
            }
        })
    },

    convertFahrenheitToCelsius: (degF) => {
        const degC = ((degF - 32) × 5 / 9);
        return degC;
    },

    convertCelsiusToFahrenheit: (degC) => {
        const degF = (degC * 9 / 5) + 32;
        return degF;
    },

    formatDate: (date) => {
        return date.toISOString().slice(0,10);
    },

    getWeatherData: async () => {
        
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

            console.log(`[DEV] Date1: `, fDate1);
            console.log(`[DEV] Date2: `, fDate2);
            
            const request = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${fDate1}/${fDate2}`;
            console.log(`[DEV] Request URL:`, request);

            const response = await fetch(request);
            const data = await response.json();

            console.log(data);

        }
        catch (error) {
            console.error(error);
        };
    }
}

// MAIN ENTRY POINT BELOW
app.init();




// ROBERT MEYER