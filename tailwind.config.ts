import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en las imágenes de referencia
        cream: "#F3EDE0",
        sand: "#EAE1CE",
        coffee: "#5A3A22",
        espresso: "#3D2616",
        sage: "#C6D6A8",
        sageDeep: "#9CB07A",
        clay: "#C97B4A",
        sky: "#A9CCE8",
        gold: "#E6B655",
        ink: "#2B2118",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
