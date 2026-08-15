import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Brand accent (SAILVEX blue, from the sail mark in the logo) —
        // remaps the literal `red-*` utility classes used across the app
        // so existing pages pick up the new palette without a page-by-page
        // rewrite.
        red: {
          50: "#EFF7FF",
          100: "#DBEDFF",
          200: "#B3DAFF",
          300: "#7EC1FF",
          400: "#3FA0F5",
          500: "#1E88E5",
          600: "#0D6FCB",
          700: "#0A57A0",
          800: "#0A4680",
          900: "#0D3A66",
          950: "#081F3D",
        },
      },
    },
  },
  plugins: [],
}
export default config
