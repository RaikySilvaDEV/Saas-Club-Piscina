/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eef9fb",
          100: "#d7f0f6",
          200: "#afe2ee",
          300: "#78cbe0",
          400: "#3da9c6",
          500: "#2386a1",
          600: "#1a6a81",
          700: "#165566",
          800: "#154855",
          900: "#123c48"
        },
        sand: {
          50: "#fff7ec",
          100: "#ffefd8",
          200: "#ffdbad",
          300: "#ffc174",
          400: "#ff9e3a",
          500: "#f57c0f",
          600: "#d85f06",
          700: "#b14a07",
          800: "#8e3b0c",
          900: "#74320d"
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};