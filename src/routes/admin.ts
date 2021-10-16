require('dotenv').config()
import { Router } from 'express'
import * as controller from '../controllers/admin'
import { middleware } from '@line/bot-sdk'
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

var urlencodedParser = bodyParser.urlencoded({ extended: false })

export const admin = Router()

admin.get('/login', urlencodedParser, controller.AdminLoginView)
admin.get('/dashboard', urlencodedParser, controller.AdminMainView)
admin.get('/logout', controller.AdminLogout)
admin.get('/class', urlencodedParser, controller.AdminManageSubject)
admin.get('/sendmessage', urlencodedParser, controller.AdminTeacherSendMessage)
admin.get('/edit-class', urlencodedParser, controller.AdminEditClass)
admin.get('/system', urlencodedParser, controller.getSystemStatus)
