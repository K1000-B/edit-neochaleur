/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif']
      },
      colors: {
        ink: {
          900: '#1b2428',
          800: '#243138',
          700: '#2f3f47'
        },
        sand: {
          50: '#f9f5ef',
          100: '#f2ebe0',
          200: '#e6dccb'
        },
        clay: {
          500: '#c86b45',
          600: '#b35b3a'
        },
        teal: {
          500: '#2f6c6b',
          600: '#255b5a'
        }
      },
      boxShadow: {
        soft: '0 20px 50px rgba(25, 35, 40, 0.12)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      },
      borderRadius: {
        xl: '1.25rem'
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        floatIn: 'floatIn 0.7s ease-out both'
      }
    }
  },
  plugins: []
};
