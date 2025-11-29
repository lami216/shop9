/** @type {import('tailwindcss').Config} */
export default {
        content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
        theme: {
                extend: {
                        colors: {
                                "payzone-navy": "#0E2748",
                                "payzone-white": "#FFFFFF",
                                "payzone-gold": "#D29C4A",
                                "payzone-indigo": "#4B4ACF",
                                "ali-bg": "#f8fafc",
                                "ali-card": "#f3f4f6",
                                "ali-ink": "#111827",
                                "ali-muted": "#374151",
                                "ali-red": "#e11d48",
                                "ali-rose": "#fb7185",
                                "ali-orange": "#fb923c",
                        },
                },
        },
        plugins: [],
};
