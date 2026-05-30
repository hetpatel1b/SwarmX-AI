import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        destructive: "hsl(var(--destructive))",
        // Agent identity colors
        "agent-research": "#06b6d4",
        "agent-factcheck": "#10b981",
        "agent-insights": "#8b5cf6",
        "agent-summary": "#f59e0b",
        "agent-presentation": "#f43f5e"
      },
      boxShadow: {
        glow: "0 0 48px rgba(6, 182, 212, 0.28)",
        "glow-lg": "0 0 64px rgba(6, 182, 212, 0.35)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.42)",
        "glow-emerald": "0 0 48px rgba(16, 185, 129, 0.28)",
        "glow-violet": "0 0 48px rgba(139, 92, 246, 0.28)",
        "glow-amber": "0 0 48px rgba(245, 158, 11, 0.28)",
        "glow-rose": "0 0 48px rgba(244, 63, 94, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.08) 50%, transparent 100%)"
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        neuralPulse: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" }
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        pulseLine: "pulseLine 1.8s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "neural-pulse": "neuralPulse 2s ease-in-out infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "count-up": "countUp 0.4s ease-out"
      }
    }
  },
  plugins: [animate]
} satisfies Config;
