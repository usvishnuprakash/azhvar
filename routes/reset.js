const { response } = require('express');
var express = require('express');
const { helpers } = require('handlebars');
var router = express.Router();
const { ObjectId, Db } = require('mongodb');
var session = require('express-session')
var resetHelpers = require('../helpers/resetHelpers');
const { render } = require('../app');
var db = require('../configure/connection')
var collections = require('../configure/collections')
const promise = require('promise')
var flash = require('express-flash')
var async = require('async')
var crypto = require('crypto')
var bcrypt = require('bcrypt')
var nodemailer = require('nodemailer');
const { REPL_MODE_STRICT } = require('repl');





router.get('/users', function (req, res) {
    res.render('forgotPassword/userForgotPassword')

})

router.post('/users', async function (req, res, next) {
    
    console.log(req.body)
    await resetHelpers.resetUserPassword(req).then((response) => {
        if (response.findError) {
           
            res.json({ status: false, err: response.findError })
        } else {
            
            console.log(response.result)
            res.json({ status: true, message: response.result })
        }
    })
})
router.get('/reset/:token', function (req, res) {
    resetHelpers.verifyToken(req.params.token, req.body).then((response) => {
        if (response.findError) {

            res.render('forgotPassword/notifier', { errMessage: response.findError })
        }
        else {
            res.render('forgotPassword/usersNewPassword', { token: req.params.token })
        }
    })
})
router.post('/resetPassword/:token', async function (req, res) {
    console.log('yes')
    await resetHelpers.setNewPassword(req.params.token, req).then((response) => {
        if (response.tokenError) {
            console.log('tokken err')
            res.json({tokenErr:response.tokenError})
        } else if (response.err) {
            console.log(mailErr)
            res.json({ mailErr: response.err })
        } else {
            console.log("all set")
           
            res.json( { message: response.user })
        }
    })

})
router.get('/notify',function (req,res){
    res.render('forgotPassword/notifier')
})
module.exports = router;
