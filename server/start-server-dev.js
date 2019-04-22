const fs = require('fs')
var config = require('./config')
var path = require('path')
var express = require('express')
var webpack = require('webpack')

var host = '0.0.0.0'
var port = 8081

var registry = {
  "rest": {
    "endpoint":"https://quant-ux.com",
    "proxy": "/rest/"
  },
  "examples": {
    "endpoint":"https://quant-ux.com",
    "proxy": "/examples/"
  }
}




// default port where dev server listens for incoming traffic
port = process.env.PORT || port || config.dev.port
host = process.env.HOST || host || config.dev.host

/**
 * Create express
 */
var app = express()

/**
 * init proxies
 */
app = require('./base-server')(app, registry)

/**
 * init webpack
 */
var webpackConfig = process.env.NODE_ENV === 'production'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./public'))

// Append HTTPS termination in case of 'secure' environment profile.
var http = require('http')
var server = http.createServer(app)


// Finish application create.
module.exports = server.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  let packageJs = JSON.parse(fs.readFileSync('package.json'))

  console.debug(' ______     __  __     ______     __   __     ______   __  __     __  __')
  console.debug('/\\  __ \\   /\\ \\/\\ \\   /\\  __ \\   /\\ "-.\\ \\   /\\__  _\\ /\\ \\/\\ \\   /\\_\\_\\_\\ ')
  console.debug('\\ \\ \\/\\_\\  \\ \\ \\_\\ \\  \\ \\  __ \\  \\ \\ \\-.  \\  \\/_/\\ \\/ \\ \\ \\_\\ \\  \\/_/\\_\\/_')
  console.debug(' \\ \\___\\_\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\\\"\\_\\    \\ \\_\\  \\ \\_____\\   /\\_\\/\\_\\ ')
  console.debug('  \\/___/_/   \\/_____/   \\/_/\\/_/   \\/_/ \\/_/     \\/_/   \\/_____/   \\/_/\\/_/ ')
  console.log(':: Quant-UX::  (' + packageJs['version'] + ')')
  console.log('Listening on ' + host + ':' + server.address().port)
})
