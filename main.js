import { FormValidator } from "./FormValidatorLibrary/FormValidator.js";

// DOM References:

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
}

// MAIN ENTRY POINT BELOW
app.init();



// ROBERT MEYER