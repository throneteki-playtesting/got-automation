import { heroui } from "@heroui/react";
import { thronesColors } from "../common/utils";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                crimson: ["'Crimson Text'", "serif"],
                opensans: ["'Open Sans'", "sans-serif"],
                thronesdb: ["'thronesdb'", "serif"]
            },
            colors: {
                ...thronesColors
            }
        },
        container: {
            center: true
        }
    },
    plugins: [
        heroui({
            defaultTheme: "dark"
        })
    ]
};