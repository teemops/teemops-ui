const path=require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports={
  entry: './app/scripts/app.js',
  plugins: [    
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './app/index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin({ filename: "[name]-[hash].css", chunkFilename: "[name]-[chunkhash].css" }),
    new CopyPlugin([
      {from: './app/images', to:'images/'},
      './app/private.html',
      './app/public.html',
      './app/favicon.ico',
      './app/404.html',
      './app/robots.txt',
      {from: './app/styles/fonts', to:'styles/fonts/'},
  ])
  ],
  devtool: 'source-map',
  module:{
    rules:[
      // {
      //   test: /\.s[ac]ss$/i,
      //   loader: [
      //     'style-loader',
      //     'css-loader',
      //     'sass-loader'
      //     // {
      //     //   loader: 'sass-loader',
      //     //   options: {
      //     //     sassOptions: {
      //     //       indentWidth: 4,
      //     //       includePaths: ['./app/styles'],
      //     //     },
      //     //   },
      //     // },
      //   ]
      // },
      // {
      //   test: /\.css$/,
      //   loader: [
      //       {
      //           loader: "style-loader",
      //           options: {
      //               singleton: true,
      //           },
      //       },
      //       "css-loader",
      //   ],
      // }
      /**
       * Extract CSS files from node_modules and the assets directory to external CSS file
       */
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      /**
       * Extract and compile SCSS files from .node_modules and the assets directory to external CSS file
       */
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/'),
  },
};