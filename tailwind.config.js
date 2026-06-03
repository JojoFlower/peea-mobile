/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // PEEA brand tokens (mirrors peea-app/styles.css :root)
        bg: "#f5f1e8",
        "bg-soft": "#faf8f2",
        card: "#ffffff",
        fg: "#3b2102",
        "fg-muted": "#996933",
        "fg-soft": "#af8f6a",
        border: "#e8e0d1",
        "border-soft": "#f0ebe0",
        primary: "#eeaf01",
        "primary-soft": "#fef3d4",
        "primary-dark": "#a16a02",
        accent: "#7d3403",
        "gold-light": "#fcb917",
      },
      // Each weight is its own loaded family (see app/_layout.tsx). React Native
      // doesn't synthesize bold for custom fonts on Android, so we map each
      // weight to the matching Poppins variant instead of relying on fontWeight.
      fontFamily: {
        sans: ["Poppins_400Regular", "system-ui", "sans-serif"],
        "poppins-medium": ["Poppins_500Medium", "system-ui", "sans-serif"],
        "poppins-semibold": ["Poppins_600SemiBold", "system-ui", "sans-serif"],
        "poppins-bold": ["Poppins_700Bold", "system-ui", "sans-serif"],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};
