/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#f2f2f7",
        card: "#ffffff",
        sheet: "#f2f2f7",
        ink: "#000000",
        muted: "#8e8e93",
        border: "#e5e5ea",
        secondary: "#e5e5ea",
        primary: {
          DEFAULT: "#007aff",
          10: "rgba(0,122,255,0.1)",
        },
        destructive: {
          DEFAULT: "#ff3b30",
          10: "rgba(255,59,48,0.1)",
        },
        chart: {
          1: "#ff9500",
          2: "#34c759",
          3: "#5856d6",
          4: "#ff2d55",
          5: "#5ac8fa",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
        extrabold: ["Inter_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
