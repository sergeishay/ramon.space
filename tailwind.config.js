/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'main-background': "url('../public/app_background2.webp')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'blacks': '#000000',
        'whites': '#ffffff', 
        'light-pr': '#6B39FA',
        'dark-pr': '#5800B0',
        'light-sec': '#8034C5',
        'my-orange': '#FF6C3D',
      },
      fontFamily: {
        primary: "CriqueGrotesk-Regular",
        secondary: "CriqueGrotesk-light",
        tertiary: "CriqueGrotesk-bold",
        italic: "CriqueGrotesk-italic",
        medItalic: "CriqueGrotesk-mediumItalic",
        mid: "CriqueGrotesk-med"
      },
      boxShadow: {
        'boxtest': '4px 4px 8px 0px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
