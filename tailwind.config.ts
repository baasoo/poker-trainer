/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "poker-green": "#0B5E2E",
        "poker-dark": "#1a1a2e",
        "poker-gold": "#d4af37",
      },
    },
  },
  plugins: [],
};
