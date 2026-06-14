import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondo café + acentos pastel
        mocha: "#45342A", // fondo café (página)
        mochaDeep: "#35271F", // café más oscuro
        panel: "#F7EFDE", // superficie de tarjeta (crema clara)
        cream: "#EFE4CB", // elementos anidados (inputs / chips)
        sand: "#E7DABB", // filas neutras
        mist: "#EAE0CB", // neutro claro
        coffee: "#2A211A", // tinta oscura (botones / texto fuerte)
        espresso: "#241D16", // títulos sobre crema
        ink: "#241D16",
        // Acentos pastel
        sage: "#C3D5A8", // verde pastel
        sageDeep: "#8AAE6A", // verde para "hecho"
        grass: "#BDD79C", // verde menta
        clay: "#EBB1A2", // coral pastel
        sky: "#B6D2E6", // azul pastel
        gold: "#F0E1A0", // amarillo pastel
        tan: "#ECC9A2", // melocotón pastel
        berry: "#CBA3B0", // malva pastel
        navy: "#B9C0DD", // periwinkle pastel
        pink: "#F1CBCB", // rosa pastel
        lemon: "#F1E6A6", // limón pastel
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
