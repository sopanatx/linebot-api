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
api.get('/test', async (req, res) => {
    console.log(req.signedCookies)
    res.send('test')
})
