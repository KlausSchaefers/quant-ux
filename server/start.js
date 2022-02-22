const http = require('http')
const express = require('express')
const path = require('path')
const compression = require('compression')
const proxyMiddleware = require('http-proxy-middleware')


let config = {
  index: path.resolve(__dirname, '../dist/index.html'),
  assetsRoot: path.resolve(__dirname, '../dist'),
  assetsSubDirectory: 'public',
  assetsPublicPath: '/',
  productionSourceMap: true,
  productionGzip: false,
  productionGzipExtensions: ['js', 'css'],
}
/**
 * Some config stuff
 */
var host = '0.0.0.0'
var port = 8082
/**
 *
 * Init express
 */
var app = express()

/** 
 * Add compression
 */
app.use(compression())

/**
 * init proxies. Change here to you server
 */
let proxyUrl = process.env.QUX_PROXY_URL ?  process.env.QUX_PROXY_URL : 'https://v1.quant-ux.com'
app.use('/rest/', proxyMiddleware({
    target: proxyUrl,
    changeOrigin: true
}))


/**
 * Setup static to serve all html, js and images from server/dist
 */
app.use(express.static(config.assetsRoot))


/**
 * Create the server
 */
var server = http.createServer(app)


// Finish application create.
module.exports = server.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.debug(' ______     __  __     ______     __   __     ______   __  __     __  __')
  console.debug('/\\  __ \\   /\\ \\/\\ \\   /\\  __ \\   /\\ "-.\\ \\   /\\__  _\\ /\\ \\/\\ \\   /\\_\\_\\_\\ ')
  console.debug('\\ \\ \\/\\_\\  \\ \\ \\_\\ \\  \\ \\  __ \\  \\ \\ \\-.  \\  \\/_/\\ \\/ \\ \\ \\_\\ \\  \\/_/\\_\\/_')
  console.debug(' \\ \\___\\_\\  \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\\\"\\_\\    \\ \\_\\  \\ \\_____\\   /\\_\\/\\_\\ ')
  console.debug('  \\/___/_/   \\/_____/   \\/_/\\/_/   \\/_/ \\/_/     \\/_/   \\/_____/   \\/_/\\/_/ ')
  console.log('Listening on ' + host + ':' + server.address().port)
  console.log('Backend : ' + proxyUrl)
})







