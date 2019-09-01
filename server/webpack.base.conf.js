var path = require('path')
var config = require('./config')
var utils = require('./utils')
var webpack = require('webpack')
var projectRoot = path.resolve(__dirname, '../')

var env = process.env.NODE_ENV == 'production' ? 'production' : 'development'
var cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap)
var cssSourceMapProd = (env === 'production' && config.build.productionSourceMap)
var useCssSourceMap = cssSourceMapDev || cssSourceMapProd

module.exports = {
  mode: env,
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
    globalObject: 'this' // FIXME temporary workaround: https://github.com/webpack/webpack/issues/6642
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts'],
    // modules: [path.join(__dirname, '../node_modules')],
    modules: ['node_modules'],
    alias: {
      'vue$': 'vue/dist/vue',
      'src': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components'),
      'dojo': path.resolve(__dirname, '../src/dojo'),
      'de': path.resolve(__dirname, '../src/de'),
      'common': path.resolve(__dirname, '../src/common'),
      'vommond': path.resolve(__dirname, '../src/vommond'),
      'views': path.resolve(__dirname, '../src/views'),
      'canvas': path.resolve(__dirname, '../src/canvas'),
      'user': path.resolve(__dirname, '../src/user'),
      'core': path.resolve(__dirname, '../src/core'),
      'dash': path.resolve(__dirname, '../src/dash'),
      'page': path.resolve(__dirname, '../src/page'),
      'public': path.resolve(__dirname, '../src/public'),
      'services': path.resolve(__dirname, '../src/services'),
      'themes': path.resolve(__dirname, '../src/themes'),
      'export': path.resolve(__dirname, '../src/export'),
      'examples': path.resolve(__dirname, '../src/examples'),
      'help': path.resolve(__dirname, '../src/help'),
      'player': path.resolve(__dirname, '../src/player')
    }
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.vue$/,
      loader: 'eslint-loader',
      include: projectRoot,
      exclude: /node_modules/
    },
    {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'eslint-loader',
      include: projectRoot,
      exclude: [/node_modules/, /dataframe/]
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      include: projectRoot,
      exclude: /node_modules/,
      options: {
        presets: ['env']
      }
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: utils.assetsPath('img/[name].[hash:7].[ext]')
      }
    },
    {
      test: /\.(mp4|ogg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
      }
    },
    {
      test: /\.css$/,
      loader: 'vue-style-loader!css-loader'
    },
    {
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        name: utils.assetsPath('workers/[name].[hash:7].js')
      }
    }]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        vue: {
          loaders: utils.cssLoaders({
            sourceMap: useCssSourceMap
          }),
          postcss: [
            require('autoprefixer')({
              browsers: ['last 2 versions']
            })
          ]
        }
      }
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        eslint: {
          formatter: require('eslint-friendly-formatter')
        }
      }
    })
  ]
}
