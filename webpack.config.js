const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/Client/index.js',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),

  },
  mode: 'development',

  devServer: {
    host: 'localhost',
    historyApiFallback: true,
    port: 8080,
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:3000',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/Client/index.html' // Updated template path
    })
  ],

  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env'], ['@babel/preset-react']
            ]
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
            },
          },
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js','.jsx'] // Add .tsx and .ts to resolve extensions
  }
};