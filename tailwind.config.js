/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // La Dispute — a duelling chamber at night. Dark stone ground; your side
        // burns warm (parchment + brass), the opponent runs cold (steel + crimson).
        chamber: {
          DEFAULT: "#14110f", // deep stone black
          panel: "#1d1916", // raised panel
          line: "#322b25", // hairlines / borders
          mist: "#48403a", // muted text on dark
        },
        // YOUR side — la défense. Warm, lit, human.
        mine: {
          DEFAULT: "#f4d58d", // brass / candlelight
          deep: "#d8a93f",
          ink: "#3a2c12",
          wash: "#2a2113",
        },
        // THE OPPONENT — la contrepartie. Cool, sharp, adversarial.
        foe: {
          DEFAULT: "#e8473f", // crimson
          steel: "#7fa6c4", // cold steel-blue
          deep: "#b5302a",
          wash: "#26181a",
        },
        // Verdict tags
        survive: "#5bb98c", // a survécu
        dent: "#e0a82e", // ébranlé
        fell: "#d6584f", // est tombé
        parchment: "#f3ece0",
      },
      fontWeight: {
        // numeric aliases used across the UI (e.g. font-700)
        400: "400",
        500: "500",
        600: "600",
        700: "700",
        800: "800",
      },
      fontFamily: {
        // Anton: a heavy condensed display — banner/verdict drama.
        display: ['"Anton"', "Impact", "sans-serif"],
        // Libre Franklin: a clean, sturdy grotesque for UI + the user's voice.
        sans: ['"Libre Franklin"', "system-ui", "sans-serif"],
        // Spectral: a reading serif — the considered argument prose.
        serif: ['"Spectral"', "Georgia", "serif"],
      },
      boxShadow: {
        lift: "0 10px 30px -12px rgba(0,0,0,0.7)",
        "lift-sm": "0 4px 14px -6px rgba(0,0,0,0.6)",
        mine: "0 0 0 1px rgba(216,169,63,0.35), 0 12px 28px -16px rgba(216,169,63,0.45)",
        foe: "0 0 0 1px rgba(232,71,63,0.30), 0 12px 28px -16px rgba(232,71,63,0.40)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideMine: {
          "0%": { opacity: "0", transform: "translateX(-22px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideFoe: {
          "0%": { opacity: "0", transform: "translateX(22px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        thinkPulse: {
          "0%, 100%": { opacity: "0.25", transform: "scaleY(0.6)" },
          "50%": { opacity: "1", transform: "scaleY(1)" },
        },
        sweepIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glint: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        slideMine: "slideMine 0.45s cubic-bezier(0.16,1,0.3,1) both",
        slideFoe: "slideFoe 0.45s cubic-bezier(0.16,1,0.3,1) both",
        thinkPulse: "thinkPulse 1s ease-in-out infinite",
        sweepIn: "sweepIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        glint: "glint 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
