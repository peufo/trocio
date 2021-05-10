let express = require('express')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
let { TROCIO_DB, TROCIO_SECRET_STRING_COOKIE } = require('../config.js')
let { checkSuperAdmin } = require('./controllers/user_utils')
let session = require('express-session')
let mongoose = require('mongoose')
let MongoStore = require('connect-mongo')(session)
const compression = require('compression')
let createError = require('http-errors')

let catchError404 = (req, res, next) => next(createError(404))

//Connection database
try {
  mongoose.connect(TROCIO_DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
} catch (error) {
  console.log(error)
}

let app = express()

app.use(logger('dev'))
app.use(express.json({ limit: '2mb', extended: true }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    secret: TROCIO_SECRET_STRING_COOKIE,
    cookie: { maxAge: 72 * 60 * 60 * 1000 },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: true,
  })
)
app.use(compression({ threshold: 0 }))
app.use(express.static('../dist'))

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/user'), catchError404)
app.use('/articles', require('./routes/article'), catchError404)
app.use('/trocs', require('./routes/troc'), catchError404)
app.use('/payments', require('./routes/payment'), catchError404)
app.use('/subscribes', require('./routes/subscribe'), catchError404)
app.use(
  '/superadmin',
  checkSuperAdmin,
  require('./routes/admin'),
  catchError404
)

// error handler
app.use(function (err, req, res, next) {
  if (!err) return next()
  if (req.app.get('env') === 'development' || err.name == 'Error') {
    res.json({ error: true, message: err.message })
  } else {
    res.json({ error: true })
  }
})

module.exports = app
