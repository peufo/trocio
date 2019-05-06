var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var config = require('./config')
var uuid = require('uuid/v4')
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var passport = require('passport')
var LocalSrategy = require('passport-local').Strategy


var mongoose = require('mongoose')
var db = mongoose.connect(config.database, {useNewUrlParser: true})

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user)
	})
})

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var articlesRouter = require('./routes/articles')
var trocsRouter = require('./routes/trocs')

var app = express()
app.listen(3000)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('secret', config.secret)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/work', session({
	genid: (req) => {
		return uuid() // use UUIDs for session IDs
	},
	store: new FileStore(),
	secret: config.secret,
	resave: false,
	saveUninitialized: true
}))
app.use('/work', passport.initialize())
app.use('/work', passport.session())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/articles', articlesRouter)
app.use('/trocs', trocsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
