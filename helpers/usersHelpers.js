var db = require('../configure/connection')
var collections = require('../configure/collections')
var promise = require('promise')
const { response } = require('express')
const { resolve, reject } = require('promise')
var objectId = require('mongodb').ObjectID
var bcrypt = require('bcrypt')
const { PromiseProvider } = require('mongoose')
const Razorpay = require('razorpay')
const { exists, statSync } = require('fs')
const { ObjectID } = require('mongodb')
const { time } = require('console')
var instance = new Razorpay({
    key_id: 'rzp_test_mpNY30MHx7HsC8',
    key_secret: 'gXhkfA2pSl4rWVxKeu7sZrPA',
});


module.exports = {
    findExistData: (data) => {
        return new promise(async (resolve, reject) => {
            var response = {}
            var existEmail = await db.get().collection(collections.USERS).findOne({ email: data.email })
            console.log(existEmail)

            if (existEmail) {

                response.email = "This email is already exist"
                console.log(response.email);
                resolve(response)
            } else {
                var existNum = await db.get().collection(collections.USERS).findOne({ regNum: data.regNum })
                if (existNum) {
                    response.num = "this number is already exist"
                    resolve(response)
                } else {
                    resolve(response)
                }

            }
        })
    },


    userSignup: (newUser) => {
        return new promise(async (resolve, reject) => {
            newUser.password = await bcrypt.hash(newUser.password, 10)
            db.get().collection(collections.USERS).insertOne(newUser).then((response) => {
                resolve(response)
            })
        })
    },
    userDetailes: (userDetailes, user) => {
        return new promise(async (resolve, reject) => {
            await db.get().collection(collections.USERS).updateOne({ _id: objectId(user) },
                {
                    $set: {
                        userDetailes
                    }
                }).then((response) => {

                    resolve(response)
                })
        }).catch((response) => {
            console.log('fail')
            response.err = "pleasefill once again"
            return response
        })
    },
    userSignin: (reqUser) => {
        return new promise(async (resolve, reject) => {
            let response = {}
            console.log(reqUser.regNum)
            let user = await db.get().collection(collections.USERS).findOne({ regNum: reqUser.regNum })
            if (user) {
                await bcrypt.compare(reqUser.password, user.password).then((status) => {
                    if (status) {

                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {

                        resolve({ status: false })
                    }

                })
            } else {
                resolve({ status: false })
            }
        })
    }, userPurchases: (userId) => {
        return new promise(async (resolve, reject) => {
            let service = await db.get().collection(collections.SERVICES).aggregate([
                { $match: { userId: objectId(userId) } },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        category: '$product.category',
                        brand: '$product.brand',
                        modal: '$product.modal',
                        varient: '$product.varient',
                        color: '$product.color',
                        IMEI_number: '$product.IMEI_number',
                        time: '$time',
                        payment: '$payment'

                    }
                },


                {
                    $project: {
                        category: 1, brand: 1, modal: 1, varient: 1, color: 1, IMEI_number: 1, time: 1, payment: 1
                    }
                }

            ]).toArray()

            resolve(service)
        })
    },
    productView: (serviceId) => {
        return new promise(async (resolve, reject) => {
            let service = await db.get().collection(collections.SERVICES).aggregate([
                { $match: { _id: objectId(serviceId) } },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        category: '$product.category',
                        brand: '$product.brand',
                        modal: '$product.modal',
                        varient: '$product.varient',
                        color: '$product.color',
                        IMEI_number: '$product.IMEI_number',
                        time: '$time'

                    }
                },


                {
                    $project: {
                        category: 1, brand: 1, modal: 1, varient: 1, color: 1, IMEI_number: 1, time: 1
                    }
                }

            ]).toArray()
            resolve(service)
        })
    },
    needrepair: (repair, serviceId) => {
        let repairObj = {
            repair: [repair],
            serviceid: objectId(serviceId),
            time: new Date()
        }
        return new promise((resolve, reject) => {
            db.get().collection(collections.REPAIR).insertOne(repairObj).then((response) => {
                resolve(response)
            })
        })
    },



    paymentRZP: (orderId) => {
        return new promise((resolve, reject) => {
            var options = {
                amount: 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log(order);
                resolve(order)
            });
        })

    },
    rzpPaymentVerify: (payment) => {
        return new promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'gXhkfA2pSl4rWVxKeu7sZrPA');
            hmac.update(payment['response[razorpay_order_id]'] + '|' + payment['response[razorpay_payment_id]'],)
            hmac = hmac.digest('hex')
            if (hmac == payment['response[razorpay_signature]']) {
                resolve({ status: true })
            } else {
                reject({ status: false })
            }
        })
    },
    serviceStatus: (orderId, userId, status) => {
        var paymentStatus = {
            serviceId: orderId,
            userId: userId,
            status: status
        }
        return new promise((resolve, reject) => {
            db.get().collection(collections.STATUS).insertOne(paymentStatus)

                .then((response) => {

                    resolve(response)
                })
        })
    },
    servicePayment: (serviceId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collections.SERVICES).updateOne({ _id: objectId(serviceId) },
                {
                    $set: {
                        payment: 'success'
                    }
                }
            ).then((response) => {
                resolve()
            })
        })
    },
    failedPayment: (userId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collections.SERVICES).deleteMany({ payment: "pending" }).then((response) => {

                resolve(response)
            })
        })

    },









    addService: (product, userId) => {
        var d = new Date()
        d.setTime(1432851021000);
        d.toDateString()
        let serviceObj = {
            product: [product],
            userId: objectId(userId),
            time: d,
            payment: 'pending'
        }
        return new promise((resolve, reject) => {
            db.get().collection(collections.SERVICES).insertOne(serviceObj).then((response) => {
                resolve(response.ops[0]._id)
            })
        })
    },
    comments: (comment, userId, name) => {


        var comments = { comment, user: objectId(userId), name }
        return new promise((resolve, reject) => {

            db.get().collection(collections.COMMENTS).insertOne(comments).then((response) => {
                console.log('fine')
                resolve(response)
            })
        })
    },
    showComments: () => {
        return new promise(async (resolve, reject) => {
            var comments = await db.get().collection(collections.COMMENTS).aggregate([
                {
                    $project: {
                        comment: '$comments.comment',
                        name: '$name'


                    }
                },
                {
                    $project: {
                        comment: 1, name: 1
                    }
                }
            ]).toArray()
            resolve(comments)
        })
    },
    showUserComments: (userId) => {
        return new promise(async (resolve, reject) => {
            let user_comment = await db.get().collection(collections.COMMENTS).aggregate([
                { $match: { user: objectId(userId) } },
                {
                    $project: {
                        comment: '$comment.comment',
                        name: '$name'

                    }
                },
                {
                    $project: {
                        comment: 1, name: 1
                    }
                }

            ]).toArray()
            console.log(user_comment)
            resolve(user_comment)

        })
    },
    checkPassword: (password, userId) => {
        return new promise(async (resolve, reject) => {
            let response = {}

            var user = await db.get().collection(collections.USERS).findOne({ _id: objectId(userId) })
            await bcrypt.compare(password, user.password).then((status) => {
                if (status) {

                    response.user = user
                    response.status = true
                    resolve(response)
                } else {

                    resolve({ status: false })
                }

            })

        })
    },
    change_userName: (name, userId) => {
        var response = {}
        return new promise(async (resolve, reject) => {
            var user = await db.get().collection(collections.USERS).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        first_name: name.first_name,
                        last_name: name.last_name
                    }
                })
            console.log(user)
            if (user) {
                console.log(response)
                response.status = true
                resolve(response)
            } else {
                response.status = false
                resolve(response)
            }

        })
    },
    change_userPassword: (password, userId) => {
        var response = {}
        return new promise(async (resolve, reject) => {
            var NewPassword = await bcrypt.hash(password, 10)
            await db.get().collection(collections.USERS).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        password: NewPassword
                    }
                }).then((respoonse) => {
                    response.status = true
                    resolve(response)
                })
        })

    },
    change_userEmail: (userId, email) => {
        return new promise(async (resolve, reject) => {
            await db.get().collection(collections.USERS).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        email: email
                    }
                }).then((response) => {
                    resolve({ status: true })
                })
        })
    },
    session_reloading: (userId) => {
        var response = {}
        console.log('here')
        return new promise(async (resolve, reject) => {
            var user = await db.get().collection(collections.USERS).findOne({ _id: objectId(userId) })
            console.log(user)
            response.user = user
            resolve(response)
        })
    },
    yourServices: (userId) => {
        return new promise(async (resolve, reject) => {
            var services = await db.get().collection(collections.REPAIR).aggregate([


                {
                    $project: {
                        problem: '$repair.problem',
                        address: '$repair.address',
                        time: '$time',
                        product: '$serviceid',
                        productDetailes: '$productDetailes'
                    }

                },
                {
                    $lookup: {
                        from: collections.SERVICES,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
               
                {
                    $project: {
                        problem: 1, address: 1, time: 1, product: 1, productDetailes: 1
                    }
                }
            ]).toArray()
            console.log(services)

            resolve(services)
        })

    }

}