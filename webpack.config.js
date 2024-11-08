import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
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
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: true,
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.use(bodyParser.json());
      return middlewares;
    },
    proxy: {
      '/api': {
        target: 'https://b4mad.racing',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req) => {
          console.log(`[API Proxy] ${req.method} ${req.url}`);
        },
        onProxyRes: (proxyRes, req) => {
          console.log(`[API Proxy] ${proxyRes.statusCode} ${req.method} ${req.url}`);
        },
      },
      '/graphql': {
        target: 'http://telemetry.b4mad.racing:30050',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req) => {
          console.log(`[GraphQL Proxy] ${req.method} ${req.url}`);
          if (req.method === 'POST' && req.body) {
            console.log('[GraphQL Query]', req.body.query);
            console.log('[GraphQL Variables]', req.body.variables);

            // Restream body data
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        onProxyRes: (proxyRes, req) => {
          console.log(`[GraphQL Proxy] ${proxyRes.statusCode} ${req.method} ${req.url}`);
        },
      },
    },
  },
};
