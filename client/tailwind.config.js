/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                crimson: ["'Crimson Text'", "serif"],
                opensans: ["'Open Sans'", "sans-serif"],
                thronesdb: ["'thronesdb'", "serif"]
            },
            colors: {
                baratheon: "#e3d852",
                greyjoy: "#1d7a99",
                lannister: "#c00106",
                martell: "#e89521",
                thenightswatch: "#7a7a7a",
                stark: "#cfcfcf",
                targaryen: "#1c1c1c",
                tyrell: "#509f16",
                neutral: "#a99560",
                income: "#ffd240",
                initiative: "#bb9570",
                claim: "#afafaf",
                reserve: "#f0623f"
            }
        }
    },
    plugins: []
};