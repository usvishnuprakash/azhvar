var db = require('../configure/connection')
var collections = require('../configure/collections')
var promise = require('promise')
const { response } = require('express')
const { resolve, reject } = require('promise')
var objectId = require('mongodb').ObjectID
var bcrypt = require('bcrypt')
var session = require('express-session')

var flash = require('express-flash')
var async = require('async')
var crypto = require('crypto')

var nodemailer = require('nodemailer')
var xoauth2 = require('xoauth2');




module.exports = {
    resetUserPassword: (req) => {
        return new promise((resolve, reject) => {
        
            let response = {}
            async.waterfall([
                function (done) {
                    crypto.randomBytes(20, function (err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);

                    });

                },
                function (token, done) {
                    db.get().collection(collections.USERS).findOne({ email: req.body.email }, (err, user) => {
                 
                        if (!user) {
                            
                            response.findError = "email address does not exist please singnup"
                            resolve(response)

                        } else {
                          
                            resetPasswordToken = token;
                            var resetPasswordExpires = Date.now() + 3600000; // 1 hour

                            db.get().collection(collections.USERS).updateMany({ _id: objectId(user._id) }, {
                                $set: {
                                    resetPasswordToken: token,
                                    resetPasswordExpires: resetPasswordExpires
                                }
                            }, (err) => {
                                done(err, token, user)
                        
                            })

                        }
                    })
                },
                function (token, user, done) {
                    
                    var smtpTransport = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        auth: {
                            type: "login",
                            user: "Azhvargroup@gmail.com",
                            pass: "sakundhala23"

                        }
                    })
                    var mailOptions = {
                        to: user.email,
                        from: 'azhvargroup@gmail.com',
                        subject: 'Node.js Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'http://' + req.headers.host + '/forgot/reset/' + token + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                        var result = 'An e-mail has been sent to ' + user.email + ' with further instructions.'

                        if (err) {
                           
                        }
                        done(err, 'done')
                        response.result = result
                        resolve(response)

                             
                    });
                }

            ]).catch((err, done) => {
                console.log(err)
            })

        })
    },
    verifyToken: (token, data) => {
        return new promise((resolve, reject) => {
            var response = {}
            db.get().collection(collections.USERS).findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }).then((user) => {
                if (!user) {
                    response.findError = 'this link is invaild or link time is expired'
                    resolve(response)
                } else {
                    response.user = user
                    resolve(response)
                }

            })

        })
    },
    setNewPassword: (token, req) => {
        return new promise((resolve, reject) => {
            var response = {}
            async.waterfall([
                function (done) {
                    db.get().collection(collections.USERS).findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },async  function (err, user) {
                        if (!user) {
                           console.log('yes error')
                            response.tokenError = 'Link is invalid or expired'
                            resolve(response)
                        }
                        var password=await bcrypt.hash(req.body.password,10)
                        db.get().collection(collections.USERS).updateMany({ _id: objectId(user._id) }, {

                            $set: {
                               password:password,
                               resetPasswordExpires:'',
                               resetPasswordToken:''
                            }
                        
                        } ,function (err) {
                            done(err, user)
                            console.log("no")
                            response.user='New password is updated'
                            resolve(response)
                        })



                    })

                },
                function (user, done) {
                    var smtpTransport = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        auth: {
                            type: "login",
                            user: "Azhvargroup@gmail.com",
                            pass: "sakundhala23"

                        }
                    });
                    console.log(user.email)
                    var mailOptions = {
                        
                        to: user.email,
                        from: "Azhvargroup@gmail.com",
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                        if(err){
                            console.log(err)
                            response.err=err
                            resolve(response)
                        }
                     response.result= 'Success! Your password has been changed.'
                        done(err)
                        console.log('finish')
                        resolve(response)
                        
                    });
                }
            ]).catch((err)=>{
                console.log(err)
            })
        })
    }
}