import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // DSN Brand Colors
        navy: {
          DEFAULT: "#1B2B4D",
          50: "#E8EBF2",
          100: "#C5CEDE",
          200: "#9AAEC7",
          300: "#6F8EAF",
          400: "#4D739C",
          500: "#2B5889",
          600: "#1B2B4D",
          700: "#152240",
          800: "#0F1A32",
          900: "#0A1124",
        },
        teal: {
          DEFAULT: "#2A9D8F",
          50: "#E5F5F3",
          100: "#BFE7E3",
          200: "#96D8D1",
          300: "#6CC9BF",
          400: "#4DBDB3",
          500: "#2A9D8F",
          600: "#238B7E",
          700: "#1B796D",
          800: "#14675C",
          900: "#0D554B",
        },
        gold: {
          DEFAULT: "#E8B931",
          50: "#FDF8E8",
          100: "#FAEFC5",
          200: "#F6E49F",
          300: "#F2D979",
          400: "#EDD153",
          500: "#E8B931",
          600: "#D4A520",
          700: "#B88E1B",
          800: "#9C7716",
          900: "#806011",
        },
        // Semantic colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
        sans: ["Open Sans", "system-ui", "sans-serif"],
        heading: ["Montserrat", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)",
        "nav": "0 1px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        "hero": "0 20px 60px rgba(27,43,77,0.3)",
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #1B2B4D 0%, #2B4080 100%)",
        "gradient-teal": "linear-gradient(135deg, #2A9D8F 0%, #1B7A6E 100%)",
        "gradient-hero": "linear-gradient(135deg, #1B2B4D 0%, #1B3A6B 50%, #2A9D8F 100%)",
        "gradient-dark": "linear-gradient(180deg, #0F1A32 0%, #1B2B4D 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};

export default config;
