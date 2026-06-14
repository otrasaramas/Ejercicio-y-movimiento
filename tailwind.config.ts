import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta bold y divertida (rayas / bloques de color retro-modernos)
        cream: "#F4ECD8", // fondo papel cálido
        sand: "#EADFC2", // tarjeta neutra
        coffee: "#16150F", // negro tinta (botones / texto fuerte)
        espresso: "#16150F", // títulos
        ink: "#16150F",
        sage: "#3DA35D", // verde kelly
        sageDeep: "#2A7D45", // verde profundo (logros / done)
        clay: "#E84A2F", // rojo tomate / coral
        sky: "#2F55F0", // azul cobalto
        gold: "#F2C53D", // amarillo
        tan: "#E0A93B", // azafrán
        mist: "#E7DEC8", // neutro claro
        // Acentos vivos extra
        berry: "#8A1E33", // vino / cereza
        navy: "#1A2348", // azul noche
        pink: "#F39A95", // coral suave
        lemon: "#F0DE6E", // amarillo limón
        grass: "#4CA64C", // verde brillante
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
