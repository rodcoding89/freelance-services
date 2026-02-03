/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        unset: 'unset',
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        thirty: 'var(--color-thirty)',
        fifty: 'var(--color-fifty)',
        link: 'var(--color-link)'
      },
      fontFamily:{
        regular: 'var(--family-poppins-regular)',
        black: 'var(--family-poppins-black)',
        bold: 'var(--family-poppins-bold)',
        extratlight: 'var(--family-poppins-extratlight)',
        light: 'var(--family-poppins-light)',
        medium: 'var(--family-poppins-medium)',
        thin: 'var(--family-poppins-thin)',
        extrabold: 'var(--family-poppins-extrabold)'
      },
      screens: {
        'max-1085':{'max': '1085px'},
        'max-920':{'max': '920px'},
        'max-810':{'max': '810px'},
        'max-792':{'max': '792px'},
        'max-485':{'max': '485px'},
        'max-420':{'max': '420px'},
        'max-330':{'max': '330px'},
        'max-520':{'max': '520px'},
        'max-640':{'max': '640px'},
      }
    },
  },
  plugins: [],
}

