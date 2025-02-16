const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './js/script.js',
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, ''),
  },
  plugins: [
    new Dotenv(),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
};
