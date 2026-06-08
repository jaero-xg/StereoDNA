/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#12121a",
        "surface-light": "#1a1a2e",
        "surface-hover": "#1f1f2e",
        primary: "#1db954", // Spotify green
        accent: "#06b6d4", // Keep one accent only
        text: "#ffffff",
        "text-muted": "#a0a0a0",
        "text-dim": "#707070",
        border: "rgba(255,255,255,0.05)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
      },
      animation: {
        // Keep only essential, subtle animations
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
