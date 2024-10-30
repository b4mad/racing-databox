const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new webpack.DefinePlugin({
      'process': { env: {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        REACT_APP_USE_MOCK_DATA: JSON.stringify(process.env.REACT_APP_USE_MOCK_DATA || 'false'),
        REACT_APP_API_BASE_URL: JSON.stringify(process.env.REACT_APP_API_BASE_URL || 'https://b4mad.racing/api')
      }},
    }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'https://b4mad.racing',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
      },
    },
  },
};
