var dev = process.env.NODE_ENV == 'development'
var pkg = require('./package.json')

module.exports = {
  apps : [{
    name   : !dev ? pkg.name : `${pkg.name}-dev`,
    script : "./app.js",
    watch: dev,
    ignore_watch: ['./src', './public/assets/*']
  }]
}
