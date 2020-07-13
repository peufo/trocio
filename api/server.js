require('dotenv').config()
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var { DBPATH, SECRET_STRING_COOKIE } = require('../config.js')
var { checkSuperAdmin } = require('./controllers/user_utils')
var session = require('express-session')
var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')(session)
const compression = require('compression')
const { ssr } = require('@sveltech/ssr')
let createError = require('http-errors')


let { PORT, NODE_ENV } = process.env
PORT = PORT || 5000
let catchError404 = (req, res, next) => next(createError(404))

//Connection database
mongoose.connect(DBPATH, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})

var app = express()

app.set('secret', SECRET_STRING_COOKIE)

app.use(logger('dev'))
app.use(express.json({limit: '2mb', extended: true}))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
	secret: SECRET_STRING_COOKIE,
    cookie: {maxAge: 72*60*60*1000},
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    resave: false,
    saveUninitialized: true
}))
app.use(compression({ threshold: 0 }))
app.use(express.static('../dist'))
app.use('/',     	  require('./routes/index'))
app.use('/users',     require('./routes/user'), 	catchError404)
app.use('/articles',  require('./routes/article'), 	catchError404)
app.use('/trocs',     require('./routes/troc'), 	catchError404)
app.use('/payments',  require('./routes/payment'), 	catchError404)
app.use('/superadmin', checkSuperAdmin, require('./routes/admin'), catchError404)

// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
	next(createError(404))
})
*/

// error handler
app.use(function(err, req, res, next) {
	if (!err) return next()
	let status = 404
	if (err.message === 'BadRequest') status = 400
	if (err.message === 'Unauthorized') status = 401
  	if (req.app.get('env') === 'development' || err.name == 'Error'){
    	res.status(status).json({error: true, message: err.message})
  	}else{
    	res.status(status).json({error: true})
  	}
  
})


/*
app.listen(PORT, () => {
	console.log('Trocio listen on ' + PORT)
})
*/

module.exports = app
