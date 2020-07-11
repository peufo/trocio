let api = require('./api/server') 

module.exports = {
    before: app => app.use(api),
    hot: true,
    contentBase: 'dist',
    publicPath: 'build',
    historyApiFallback: '__app.html',
    port: 5000
    // proxy: {    '/': 'http://localhost:5000'  } legacy. Needs spassr running.
  }