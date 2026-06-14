import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta moderna y cálida (estilo app de Apple) inspirada en el referente
        cream: "#F5F3EE", // fondo papel
        sand: "#ECE8DF", // tarjeta neutra
        coffee: "#26241F", // casi negro (botones / texto fuerte)
        espresso: "#1C1B19", // títulos
        sage: "#A9B79E", // verde salvia
        sageDeep: "#7E9072", // verde más profundo (logros)
        clay: "#C08475", // terracota / rosa arcilla
        sky: "#A9C0D4", // azul suave
        gold: "#E2A75A", // ámbar
        ink: "#1C1B19",
        tan: "#D9BD97", // arena cálida
        mist: "#E4E3DD", // gris claro
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
