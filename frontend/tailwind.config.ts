import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d8ebff",
          500: "#2f79ff",
          700: "#1854c7",
          900: "#0f2d63"
        },
        slate: {
          950: "#0b1220"
        }
      },
      boxShadow: {
        panel: "0 18px 40px rgba(15, 45, 99, 0.12)"
      }
    },
  },
  plugins: [],
};

export default config;
