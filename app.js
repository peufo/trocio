var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var { PORT, DBPATH, SECRET_STRING_COOKIE } = require('./config')
var { checkSuperAdmin } = require('./controllers/user_utils')
var session = require('express-session')
var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')(session)
import compression from 'compression'
import * as sapper from '@sapper/server'

//Connection database
mongoose.connect(DBPATH, {useNewUrlParser: true, useCreateIndex: true})

var app = express()
app.listen(PORT, () => {
	console.log('Trocio listen on ' + PORT)
})

app.set('secret', SECRET_STRING_COOKIE)
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json({limit: '2mb', extended: true}))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'node_modules', '@material'))) //TODO: check if util
app.use(session({
	secret: SECRET_STRING_COOKIE,
	cookie: {maxAge: 72*60*60*1000},
  	store: new MongoStore({mongooseConnection: mongoose.connection}),
	resave: false,
	saveUninitialized: true
}))
app.use(sapper.middleware())



//Routage Vues
//app.use('/', require('./routes/index'))
//app.use('/superadmin', checkSuperAdmin, require('./routes/admin'))

//Routage REST
app.use('/users',     require('./routes/user'))
app.use('/articles',  require('./routes/article'))
app.use('/trocs',     require('./routes/troc'))
app.use('/payments',  require('./routes/payment'))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {

  if (req.app.get('env') === 'development' || err.name == 'Error'){
    console.log(err.name)
    console.log(err)
    res.json({success: false, message: err.message})
  }else{
    res.json({success: false})
  }
  
})

module.exports = app
