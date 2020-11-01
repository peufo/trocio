const { TROCIO_FRONT_PORT, TROCIO_API_HOST } = require('./config.js')
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
	before: app => app.use('/api', createProxyMiddleware({pathRewrite: {'^/api': '/'}, target: TROCIO_API_HOST, changeOrigin: true})),
	https: true,
	key: 'c:/users/jonas/.ssl/localhost.key',
	cert: 'c:/users/jonas/.ssl/localhost.crt',
	hot: true,
	contentBase: 'dist',
	publicPath: 'build',
	historyApiFallback: '__app.html',
	port: TROCIO_FRONT_PORT
}