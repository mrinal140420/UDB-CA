/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "Roboto", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        brand: {
          50: "#eef9f3",
          100: "#d5f0e0",
          500: "#20a15f",
          700: "#176f45",
          900: "#0a2f1d",
        },
        ink: {
          900: "#11131a",
          700: "#2f3545",
          500: "#5c6580",
          200: "#dce1f0",
          100: "#edf0f8",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17,19,26,0.08)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 10% 20%, #e9fff0 0%, transparent 40%), radial-gradient(circle at 90% 10%, #dcecff 0%, transparent 35%), linear-gradient(140deg, #f6fbff 0%, #fefdf9 60%, #f2fff6 100%)",
      },
    },
  },
  plugins: [],
};
