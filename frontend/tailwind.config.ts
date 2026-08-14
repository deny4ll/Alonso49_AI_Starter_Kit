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
        // Brand accent (Regatta orange) — remaps the literal `red-*`
        // utility classes used across the app so existing pages pick up
        // the new palette without a page-by-page rewrite.
        red: {
          50: "#FEF3F0",
          100: "#FEE3DD",
          200: "#FCC6BA",
          300: "#FC9D88",
          400: "#FF7A5C",
          500: "#FF5D38",
          600: "#F93F15",
          700: "#DA310B",
          800: "#AC2D11",
          900: "#852914",
          950: "#571C0F",
        },
      },
    },
  },
  plugins: [],
}
export default config
