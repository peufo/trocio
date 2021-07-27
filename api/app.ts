import express, { ErrorRequestHandler, RequestHandler } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import config from '../config'
import { checkSuperAdmin } from './controllers/user_utils'
import session from 'express-session'
import mongoose from 'mongoose'
import connectMongo from 'connect-mongo'
import compression from 'compression'
import createError from 'http-errors'
import swaggerUI from 'swagger-ui-express'
import path from 'path'

import type { User } from '../types'

import routesArticle from './routes/article'
import routesIndex from './routes/index'
import routesPayment from './routes/payment'
import routesRoot from './routes/root'
import routesSubscribe from './routes/subscribe'
import routesTroc from './routes/troc'
import routesUser from './routes/user'

declare module 'express-session' {
  interface SessionData {
    user: User
  }
}

const MongoStore = connectMongo(session)
const catchError404: RequestHandler = (req, res, next) => next(createError(404))

//Connection database
try {
  mongoose.connect(config.TROCIO_DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
} catch (error) {
  console.log(error)
}

const app = express()

app.use(logger('dev'))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    secret: config.TROCIO_SECRET_STRING_COOKIE,
    cookie: { maxAge: 72 * 60 * 60 * 1000 },
    // @ts-ignore
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: true,
  })
)
app.use(compression({ threshold: 0 }))

app.use('/doc', express.static('api/doc'))
app.use('/doc-swagger', swaggerUI.serve)
app.use('/doc-swagger', swaggerUI.setup(null, { swaggerUrl: '/doc/index.yml' }))

app.use('/', routesIndex)
app.use('/users', routesUser, catchError404)
app.use('/articles', routesArticle, catchError404)
app.use('/trocs', routesTroc, catchError404)
app.use('/payments', routesPayment, catchError404)
app.use('/subscribes', routesSubscribe, catchError404)
app.use('/root', checkSuperAdmin, routesRoot, catchError404)

// error handler

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (!err) return next()
  if (req.app.get('env') === 'development' || err.message.match(/^public: /)) {
    const message = err.message.replace(/^public: /, '')
    res.json({ error: true, message })
    console.log(err)
  } else {
    res.json({ error: true })
  }
}

app.use(errorHandler)

export default app
