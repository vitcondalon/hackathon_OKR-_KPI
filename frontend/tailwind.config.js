/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 40px rgba(15, 23, 42, 0.08)'
      },
      colors: {
        brand: {
          50: '#edf4ff',
          100: '#dbe9ff',
          500: '#276ef1',
          600: '#1b5ad1',
          700: '#1348ab'
        }
      }
    }
  },
  plugins: []
};
