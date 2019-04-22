require('babel-register')({
    presets: [ 'env' ]
})

// Import the rest of our application.
var dojo2Vue= require('./dojo2Vue.js')

const root = '/Users/Klaus/git/matc6/src/main/resources/webroot'

const mapping = {
    replace: {
        'dojo/dom-class': 'dojo/css',
        'dojo/dom-attr': 'dojo/domAttr',
        'de/vommond':'common',
        'dojo/io-query': 'dojo/ioQuery',
        'dijit/registry': 'dojo/registry'
    },
    rewrite: {
        'de/vommond': 'common'
    },
    cut: ['de/vommond/matc/']
}

// dojo2Vue.run(root, 'de/vommond/matc/App', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/aspect/User', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/aspect/Apps', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/aspect/Public', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/aspect/Test', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/aspect/Analylics', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/aspect/Examples', process.cwd() + '/generated/', mapping)
// dojo2Vue.run(root, 'de/vommond/matc/public/Test', process.cwd() + '/generated/', mapping)
dojo2Vue.run(root, 'de/vommond/matc/public/Share2', process.cwd() + '/generated/', mapping)