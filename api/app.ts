import express, { ErrorRequestHandler, RequestHandler } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import config from '../config'
import { checkSuperAdmin } from './controllers/user_utils'
import session from 'express-session'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import compression from 'compression'
import createError from 'http-errors'
import swaggerUI from 'swagger-ui-express'

import type { User } from '../types'
import { initOptions } from './controllers/option'

import routesArticle from './routes/article'
import routesIndex from './routes/index'
import routesPayment from './routes/payment'
import routesRoot from './routes/root'
import routesSubscribe from './routes/subscribe'
import routesTroc from './routes/troc'
import routesUser from './routes/user'
import routesMessage from './routes/message'

declare module 'express-session' {
  interface SessionData {
    user: User
  }
}

//Connection database
try {
  mongoose.connect(config.TROCIO_DB).then(initOptions)
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
    store: MongoStore.create({ mongoUrl: config.TROCIO_DB }),
    resave: false,
    saveUninitialized: true,
  })
)
app.use(compression({ threshold: 0 }))

app.use('/doc', express.static('api/doc'))
app.use('/doc-swagger', swaggerUI.serve)
app.use('/doc-swagger', swaggerUI.setup(null, { swaggerUrl: '/doc/index.yml' }))

app.use('/', routesIndex)
app.use('/users', routesUser)
app.use('/articles', routesArticle)
app.use('/trocs', routesTroc)
app.use('/payments', routesPayment)
app.use('/subscribes', routesSubscribe)
app.use('/messages', routesMessage)
app.use('/root', checkSuperAdmin, routesRoot)

const catchError404: RequestHandler = (req, res, next) => {
  res.status(404)
  next(createError(404, `Not found: ${req.path}`))
}
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (req.app.get('env') === 'development' || err.message.match(/^public: /)) {
    const message = err.message?.replace(/^public: /, '') || err
    res.json({ error: true, message })
    console.log(err)
  } else {
    res.json({ error: true })
  }
}

app.use(catchError404)
app.use(errorHandler)

export default app
