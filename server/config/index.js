// see npm run devfor documentation.
var path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'public',
    assetsPublicPath: '/',
    productionSourceMap: true,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    host: 'localhost',
    port: 0,
    assetsSubDirectory: 'public',
    assetsPublicPath: '/',
    proxyTable: {},
    cssSourceMap: false
  }
}
