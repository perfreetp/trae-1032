/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        railway: {
          50: '#E8F3FF',
          100: '#BEDAFF',
          200: '#94C2FF',
          300: '#6AA8FF',
          400: '#408EFF',
          500: '#165DFF',
          600: '#0E42D2',
          700: '#0A2BA6',
          800: '#061A7A',
          900: '#030F4E',
        },
        warning: {
          50: '#FFF7E8',
          100: '#FFE7BA',
          200: '#FFD68C',
          300: '#FFC55E',
          400: '#FFB430',
          500: '#FF7D00',
          600: '#CC6400',
          700: '#994B00',
          800: '#663200',
          900: '#331900',
        },
        success: {
          50: '#E8FFEE',
          100: '#BAFFCC',
          200: '#8CFFAA',
          300: '#5EFF88',
          400: '#30FF66',
          500: '#00B42A',
          600: '#009022',
          700: '#006C19',
          800: '#004811',
          900: '#002409',
        },
        danger: {
          50: '#FFE8E8',
          100: '#FFBABA',
          200: '#FF8C8C',
          300: '#FF5E5E',
          400: '#FF3030',
          500: '#F53F3F',
          600: '#CB2634',
          700: '#A11229',
          800: '#77071F',
          900: '#4D0314',
        },
        neutral: {
          50: '#F7F8FA',
          100: '#F2F3F5',
          200: '#E5E6EB',
          300: '#C9CDD4',
          400: '#86909C',
          500: '#4E5969',
          600: '#272E3B',
          700: '#1D2129',
        }
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
