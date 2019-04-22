var config = require('./config')
var utils = require('./utils')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var env = process.env.NODE_ENV === 'testing'
  ? require('./config/test.env')
  : config.build.env

var webpackConfig = merge(
  baseWebpackConfig,
  {
    module: {
      rules: utils.styleLoaders({ sourceMap: config.build.productionSourceMap, extract: true, usePostCSS: true })
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
      path: config.build.assetsRoot,
      filename: '[name].js',
      chunkFilename: '[name].bundle.js'
    },
    plugins: [
      // http://vuejs.github.io/vue-loader/en/workflow/production.html
      new webpack.DefinePlugin({
        'process.env': env
      }),
      // extract css into its own file
      new ExtractTextPlugin(utils.assetsPath('css/[name].[hash].css')),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'public/index.html',
        inject: true
      }),
      new HtmlWebpackPlugin({
        filename: 'simulate.html',
        template: 'public/index.html',
        inject: true
      }),
    ]
  })

module.exports = webpackConfig