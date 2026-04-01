import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Mona Sans Variable", "system-ui", "sans-serif"],
        display: ["var(--font-instrument-serif)", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        stripe: {
          orange: "hsl(var(--stripe-orange))",
          "red-orange": "hsl(var(--stripe-red-orange))",
          red: "hsl(var(--stripe-red))",
          magenta: "hsl(var(--stripe-magenta))",
          plum: "hsl(var(--stripe-plum))",
        },
        olive: {
          50:  "oklch(98.8% 0.003 106.5)",
          100: "oklch(96.6% 0.005 106.5)",
          200: "oklch(93%   0.007 106.5)",
          300: "oklch(88%   0.011 106.6)",
          400: "oklch(73.7% 0.021 106.9)",
          500: "oklch(58%   0.031 107.3)",
          600: "oklch(46.6% 0.025 107.3)",
          700: "oklch(39.4% 0.023 107.4)",
          800: "oklch(28.6% 0.016 107.4)",
          900: "oklch(22.8% 0.013 107.4)",
          950: "oklch(15.3% 0.006 107.1)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'vibrate': 'vibrate 0.3s ease-in-out infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        vibrate: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
