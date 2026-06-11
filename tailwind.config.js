/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mac: {
          blue: "#007AFF",
          indigo: "#5856D6",
          purple: "#AF52DE",
          pink: "#FF2D55",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          green: "#34C759",
          teal: "#30B0C7",
          gray: {
            50: "#F5F5F7",
            100: "#E8E8ED",
            200: "#D2D2D7",
            300: "#AEAEB2",
            400: "#8E8E93",
            500: "#636366",
            600: "#48484A",
            700: "#3A3A3C",
            800: "#2C2C2E",
            900: "#1C1C1E",
            950: "#0F0F10",
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "PingFang SC",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["SF Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        mac: "0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.06)",
        "mac-lg": "0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.08)",
        "mac-dark": "0 4px 24px -4px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
