const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    'postcss-preset-env',
    'tailwindcss/nesting',
    tailwindcss,
    autoprefixer
  ],
};