/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // A restrained teal accent — deliberately not the default
        // indigo/purple SaaS-starter look. Used for the brand mark,
        // active nav state, primary actions, and focus rings.
        brand: {
          50: "#effcf9",
          100: "#c9f6ec",
          200: "#94ecda",
          300: "#5cdcc4",
          400: "#2fc4ab",
          500: "#16a891",
          // Darkened from the original #0f8875 to clear WCAG AA (4.5:1)
          // for white text at small sizes — this color is used as a solid
          // background behind white text (active filters, buttons, the
          // header avatar), so it needs to pass on its own merits.
          600: "#0d7a6c",
          700: "#0e6d5f",
          800: "#0f574c",
          900: "#0f4841",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
