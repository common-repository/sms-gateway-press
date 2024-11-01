/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/js/**/*.jsx"],
  prefix: 'smsgp-',
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light"],
  },
}

