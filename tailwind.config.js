/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class
  theme: {
    extend: {
      colors: {
        background: {
          dark: 'hsl(220, 40%, 10%)',
          light: 'hsl(220, 20%, 97%)'
        },
        foreground: {
          dark: 'hsl(0, 0%, 98%)',
          light: 'hsl(220, 25%, 10%)'
        },
        card: {
          dark: 'rgba(15, 23, 42, 0.95)',
          light: 'rgba(255, 255, 255, 0.95)'
        },
        border: {
          dark: 'rgba(30, 41, 59, 0.5)',
          light: 'rgba(203, 213, 225, 0.5)'
        },
        muted: {
          dark: 'hsl(223, 47%, 11%)',
          light: 'hsl(220, 20%, 94%)'
        },
        button: {
          dark: 'rgba(30, 41, 59, 0.4)',
          light: 'rgba(241, 245, 249, 0.8)'
        },
        buttonHover: {
          dark: 'rgba(51, 65, 85, 0.5)',
          light: 'rgba(226, 232, 240, 0.9)'
        }
      }
    },
  },
  plugins: [],
}
