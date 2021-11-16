import { json } from 'body-parser'
import { Router } from 'express'
import * as controller from '../controllers/api'
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

export const api = Router()
api.get('/', controller.ApiHello)
api.get('/auth', controller.ApiAuth)
api.get('/get-liff-id', jsonParser, controller.ApiLiffId)
api.post('/login', jsonParser, controller.ApiLogin)
api.post('/check-login', jsonParser, controller.ApiCheckLogin)
api.get('/getstudentinfo', jsonParser, controller.getStudentInfo)
api.post('/auth/admin', jsonParser, controller.authAdmin)
api.get('/genUser', jsonParser, controller.GenerateTestUser)
api.post('/token', urlencodedParser, controller.DecryptToken)
api.get('/export-backup', jsonParser, controller.ExportBackup)
api.post('/getmyclass', urlencodedParser, controller.getAllMyClass)
api.post('/send-message', jsonParser, controller.sendMessage)
api.post('/getStudent', jsonParser, controller.getStudent)

api.post('/update-class', jsonParser, controller.updateClass)
api.get('/getserverinfo', jsonParser, controller.getServerInfo)
api.post('/adduser', jsonParser, controller.AdminAddUser)
api.get('/get-all-user', jsonParser, controller.getUser)
api.post('/addstudent', jsonParser, controller.addStudent)
api.post('/addclass', jsonParser, controller.addClass)
api.get('/getmyaccountinfo', jsonParser, controller.getMyAccountInfo)
api.post('/update-my-account', jsonParser, controller.updateMyAccountInfo)
api.post('/update-user-account', jsonParser, controller.AdminUpdateAccount)
api.post('/add-student-to-class', jsonParser, controller.AddStudentToClass)
api.post('/update-student-grade', jsonParser, controller.updateStudentGrade)
