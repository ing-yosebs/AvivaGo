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
                    primary: '#0047AB', // Deep Corporate Blue
                    secondary: '#FF8C00', // Energetic Human Orange
                    navy: '#0F2137',    // Trust Navy (Official)
                    gold: '#C5A059',    // Premium Gold (Official)
                    text: '#111827',    // gray-900
                    subtext: '#4B5563', // gray-600
                    tag: '#F3F4F6',     // gray-100
                    border: '#E5E7EB',  // gray-200
                    bg: '#F9FAF8',      // Soft White Background
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                display: ['var(--font-outfit)'],
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
                'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.08)',
            }
        },
    },
    plugins: [],
};
export default config;
