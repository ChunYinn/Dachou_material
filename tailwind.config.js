/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./src/**/*.{html,js,jsx,tsx}",
  "./node_modules/tailwind-datepicker-react/dist/**/*.js",],
  plugins: [
    // ...
    require('@tailwindcss/forms'),
  ],
  theme: {
    extend: {
      height:{
        '26':'6.5rem',
      }
    },
  },
}
