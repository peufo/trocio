var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var { PORT, DBPATH, SECRET } = require('./config')
var session = require('express-session')
var mongoose = require('mongoose')
var MongoStore = require('connect-mongo')(session)

//Connection database
mongoose.connect(DBPATH, {useNewUrlParser: true, useCreateIndex: true})


var app = express()
app.listen(PORT, () => {
	console.log('Trocio listen on ' + PORT)
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('secret', SECRET)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
	secret: SECRET,
	cookie: {maxAge: 72*60*60*1000},
  store: new MongoStore({mongooseConnection: mongoose.connection}),
	resave: false,
	saveUninitialized: true
}))


//Routage	
app.use('/', 			    require('./routes/index'))
app.use('/users', 		require('./routes/user'))
app.use('/articles', 	require('./routes/article'))
app.use('/trocs', 		require('./routes/troc'))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  if (req.app.get('env') === 'development') console.log(err)

  res.json({success: false, message: err.message})
})

module.exports = app
