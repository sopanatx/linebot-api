import express from 'express'
import logger from 'morgan'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import { errorHandler, errorNotFoundHandler } from './middlewares/errorHandler'

// Routes
import { index } from './routes/index'
import { api } from './routes/api'
// Create Express server
export const app = express()

// Express configuration
app.set('port', process.env.PORT || 5001)
app.set('views', path.join(__dirname, ''))
app.set('view engine', 'ejs')
//app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended: true }))
app.use(logger('dev'))

app.use('/static', express.static('public'))
app.use('/', index)
app.use('/api', api)

//app.use(errorNotFoundHandler)
//app.use(errorHandler)
