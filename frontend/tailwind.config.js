/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#DBEAFE",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["'DM Sans'", "ui-sans-serif", "system-ui"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
        "toast-in": "toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        skeleton: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
        toastIn: { from: { opacity: 0, transform: "translateY(8px) scale(0.96)" }, to: { opacity: 1, transform: "translateY(0) scale(1)" } },
      },
    },
  },
  plugins: [],
}
