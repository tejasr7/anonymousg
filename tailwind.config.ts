import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B0B0D",
          elevated: "#141418",
          panel: "#1B1B21",
          sunken: "#070708",
        },
        ink: {
          DEFAULT: "#F5F5F5",
          muted: "#94949F",
          dim: "#5C5C66",
        },
        line: {
          DEFAULT: "#26262E",
          strong: "#34343D",
        },
        accent: {
          DEFAULT: "#C8FF3D",
          dim: "#9FCC2F",
        },
        purple: {
          DEFAULT: "#B89BFF",
          dim: "#8A6FE0",
        },
        danger: "#FF5A5A",
        warm: "#FFB454",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        chunky: "0 4px 0 0 #000",
        "chunky-sm": "0 2px 0 0 #000",
        glow: "0 0 24px -4px rgba(200,255,61,0.45)",
      },
      borderRadius: {
        chunk: "4px",
        toy: "14px",
      },
      keyframes: {
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%,100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-2px,1px)" },
          "40%": { transform: "translate(2px,-1px)" },
          "60%": { transform: "translate(-1px,2px)" },
          "80%": { transform: "translate(1px,-2px)" },
        },
        "anim-idle": {
          "0%,100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-4px) rotate(2deg)" },
        },
        "anim-typing": {
          "0%,100%": { transform: "translateY(0) rotate(0)" },
          "25%": { transform: "translateY(-2px) rotate(-1deg)" },
          "75%": { transform: "translateY(-2px) rotate(1deg)" },
        },
        "anim-laugh": {
          "0%,100%": { transform: "scale(1) rotate(0)" },
          "25%": { transform: "scale(1.06) rotate(-3deg)" },
          "50%": { transform: "scale(0.98) rotate(0)" },
          "75%": { transform: "scale(1.06) rotate(3deg)" },
        },
        "anim-shocked": {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
        },
        "anim-sleeping": {
          "0%,100%": { transform: "rotate(8deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "anim-celebrate": {
          "0%,100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-12px) rotate(6deg)" },
        },
        "anim-angry": {
          "0%,100%": { transform: "translateX(0) rotate(0)" },
          "25%": { transform: "translateX(-2px) rotate(-2deg)" },
          "75%": { transform: "translateX(2px) rotate(2deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.4s ease-in-out infinite",
        pop: "pop 0.3s ease-out",
        "scan-line": "scan-line 2.4s linear infinite",
        glitch: "glitch 0.2s steps(2) infinite",
        "anim-idle": "anim-idle 2.4s ease-in-out infinite",
        "anim-typing": "anim-typing 0.4s ease-in-out infinite",
        "anim-laugh": "anim-laugh 0.8s ease-in-out infinite",
        "anim-shocked": "anim-shocked 0.6s ease-in-out infinite",
        "anim-sleeping": "anim-sleeping 3s ease-in-out infinite",
        "anim-celebrate": "anim-celebrate 0.6s ease-in-out infinite",
        "anim-angry": "anim-angry 0.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
