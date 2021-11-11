import express from 'express'
import logger from 'morgan'
import * as path from 'path'
import { errorHandler, errorNotFoundHandler } from './middlewares/errorHandler'
var session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// Routes
import { index } from './routes/index'
import { api } from './routes/api'
import { admin } from './routes/admin'
import { checkPublish, getTime } from './service/notifyService'
// Create Express server
const schedule = require('node-schedule')
export const app = express()
const port = process.env.PORT || 5001

// Express configuration0
app.set('port', process.env.PORT || 5001)
app.set('views', path.join(__dirname, ''))
app.set('view engine', 'ejs')
app.use(logger('dev'))

app.use(cookieParser())
app.use(
    session({
        secret: 'RaeDCUjDrrxB6CZhtJhz6JNpW',
        resave: true,
        saveUninitialized: true,
    })
)
app.use('/static', express.static('public'))
app.use('/', index)
app.use('/api', api)
app.use('/admin', admin)

app.use(errorNotFoundHandler)
app.use(errorHandler)

// const job = schedule.scheduleJob('10 * * * * *', function () {
//     console.log('[TASK] : --> Running DB Query')
//     checkPublish()
// })
