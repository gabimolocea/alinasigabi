import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          DEFAULT: "#9B8557",
          light: "#B8A67A",
          dark: "#7A6B42",
        },
        cream: {
          DEFAULT: "#F5F0EA",
          dark: "#EDE8E1",
          deeper: "#E5DFD6",
        },
      },
      fontFamily: {
        playfair: ["'Playfair Display'", "serif"],
        lato: ["'Lato'", "sans-serif"],
        greatvibes: ["'Great Vibes'", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
