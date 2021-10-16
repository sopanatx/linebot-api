import express from 'express'
import logger from 'morgan'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import { errorHandler, errorNotFoundHandler } from './middlewares/errorHandler'
var session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')

// Routes
import { index } from './routes/index'
import { api } from './routes/api'
import { admin } from './routes/admin'
import passport from 'passport'
// Create Express server
export const app = express()
//app.use(helmet())
app.use(cookieParser())
app.use(
    session({
        secret: 'RaeDCUjDrrxB6CZhtJhz6JNpW',
        resave: true,
        saveUninitialized: true,
    })
)

app.use(passport.initialize())
app.use(passport.session())
const oneDay = 1000 * 60 * 60 * 24

// Express configuration
app.set('port', process.env.PORT || 5001)
app.set('views', path.join(__dirname, ''))
app.set('view engine', 'ejs')
app.use(logger('dev'))

app.use('/static', express.static('public'))
app.use('/', index)
app.use('/api', api)
app.use('/admin', admin)

app.use(errorNotFoundHandler)
app.use(errorHandler)
