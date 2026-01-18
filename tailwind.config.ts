import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                aviva: {
                    primary: '#1E3A5F', // Primary Buttons & Actions
                    text: '#2E2E2E',    // Main Text
                    tag: '#F4F6F8',     // Tag Backgrounds
                    border: '#E5E7EB',  // Card Borders
                    primaryHover: '#162d4b',
                }
            },
            boxShadow: {
                'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
            }
        },
    },
    plugins: [],
};
export default config;
