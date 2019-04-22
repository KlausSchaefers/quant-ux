var compression = require('compression')
var proxyMiddleware = require('http-proxy-middleware')

function makeServer (app, registry) {
  registry = registry || {}
  app.use(compression())
  // Ensure that the JSON objects received from the client get parsed correctly.
  for (var serviceID in registry) {
    let service = registry[serviceID]
    if (service.proxy && service.endpoint) {
      let options = {
        target: service.endpoint,
        changeOrigin: true
      }
      if (service.ws) {
        options.ws = true
      }        
      app.use(service.proxy, proxyMiddleware(options))
    }
  }
  app.use(require('connect-history-api-fallback')())
  return app
}

module.exports = function (app, registry) {
  return makeServer(app, registry)
}
