/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f7f4ef",
        ink: "#24211d",
        accent: "#a8927a",
        panel: "#f4f1ec",
        line: "#d6ccc0",
      },
      fontFamily: {
        heading: ["Carlito", "system-ui", "sans-serif"],
        body: ["Caladea", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
