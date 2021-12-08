require('dotenv').config()
import { Router } from 'express'
import * as controller from '../controllers/index'
import { middleware } from '@line/bot-sdk'
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

export const index = Router()
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
}
index.get('/', controller.index)
index.post('/webhook', middleware(config), controller.webhook)
index.get('/callback', middleware(config), controller.Callback)
index.get('/liff-apps', urlencodedParser, controller.liffApps)
index.get('/login', urlencodedParser, controller.LoginView)
