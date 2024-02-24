const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './Client/index.js',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),

  },
  mode: 'development',
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
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
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

  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './Client/index.html' // Updated template path
    })
  ],
  devServer: {
    // static: [
    //   {
    //     directory: path.join(__dirname, './Client'),
    //     publicPath: '/'
    //   }
    // ],
    host: 'localhost',
    historyApiFallback: true,
    port: 8080,
    proxy: [{
      '/': {
        target: 'http://localhost:3000',
        secure: false,
      },
    }],
  }

};