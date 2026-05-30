import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        paper: "#f7f3ec",
        accent: "#0f766e",
        coral: "#e4572e"
      }
    }
  },
  plugins: []
};

export default config;
