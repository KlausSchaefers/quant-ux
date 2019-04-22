const fs = require('fs')
var config = require('./config')
var http = require('http')
var express = require('express')

/**
 * Some config stuff
 */
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
port = process.env.PORT || port || config.dev.port
host = process.env.HOST || host || config.dev.host

console.log('Will listen on ' + host + ':' + port)

/**
 * 
 * Init express
 */
var app = express()

/**
 * init proxies
 */
app = require('./base-server')(app, registry)

/**
 * Setup static to serve all html, js and images from server/dist
 */
app.use(express.static(config.build.assetsRoot))


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
  let packageJs = JSON.parse(fs.readFileSync('package.json'))
  console.log(':: Quant-UX ::  (' + packageJs['version'] + ')')
  console.log('Listening on ' + host + ':' + server.address().port)
})
