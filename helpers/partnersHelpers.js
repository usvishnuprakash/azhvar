var db = require('../configure/connection')
var collections = require('../configure/collections')
const promise = require('promise')
const { resolve, reject } = require('promise')
var bcrypt = require('bcrypt')
const { response } = require('express')
const e = require('express')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId

module.exports = {
    partnersSingnup: (newPartner) => {

        return new promise(async (resolve, reject) => {
            newPartner.password = await bcrypt.hash(newPartner.password, 10)


            db.get().collection(collections.PARTNERS).insertOne(newPartner).then((response) => {
                resolve(response)
            })
        })

    },

    partnersSignin: (partner) => {
        return new promise(async (resolve, reject) => {
            let response = {}
            let member = await db.get().collection(collections.PARTNERS).findOne({ regNum: partner.regNum })
           console.log
            if (member) {
                await bcrypt.compare(partner.password, member.password).then((status) => {
                    if (status) {

                        response.user = member

                        response.status = true
                        resolve(response)
                    } else {
                        response.report = "password didn't match"
                        resolve(response)
                    }
                })
            } else {
                response.report = "invaild username and password"
                resolve(response)
            }
        })
    },



    addClient: (newClient) => {
        return new promise(async (resolve, reject) => {
            let response = {}
            let newCli = await db.get().collection(collections.USERS).findOne({ regNum: newClient.regNum })
            if (newCli) {
                response.client = newCli
                response.status = true
                resolve(response)
            } else {
                response.report = "Number is not registed or Enter correct number"
                resolve(response)
            }
        })

    },
    addition: (product, client, partner) => {
        let serviceObj = {
            product: [product],
            userId: objectId(client),
            partnerId: objectId(partner),
            time:new Date()
        }
        return new promise(async (resolve, reject) => {
            await db.get().collection(collections.SERVICES).insertOne(serviceObj).then((response) => {
                resolve(response)
            })

        })


    },
    partnerClients: (partnerId) => {
        return new promise(async (resolve, reject) => {
            let clients = await db.get().collection(collections.SERVICES).aggregate([
                { $match: { partnerId: objectId(partnerId) } },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        category: '$product.category',
                        modal: '$product.modal',
                        varient: '$product.varient',
                        color: '$product.color',
                        IMEI_number: '$product.IMEI_number',
                        time:'$time',
                        user: '$userId'
                    }
                },
                {
                    $lookup: {
                        from: collections.USERS,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }

                },

                {
                    $project: {
                        category: 1, modal: 1, brand: 1, varient: 1, color: 1, IMEI_number: 1,time:1, user: 1, user: { $arrayElemAt: ['$user', 0] }
                    }
                }

            ]).toArray()

            resolve(clients)
        })

    },
    clientView: (clientId) => {
        return new promise(async (resolve, reject) => {
            let client = await db.get().collection(collections.SERVICES).aggregate([
                { $match: {_id: objectId(clientId) } },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        category: '$product.category',
                        modal: '$product.modal',
                        varient: '$product.varient',
                        color: '$product.color',
                        IMEI_number: '$product.IMEI_number',
                        time:'$time',
                        user: '$userId'
                    }
                },
                {
                    $lookup: {
                        from: collections.USERS,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }

                },

                {
                    $project: {
                        category: 1, modal: 1, brand: 1, varient: 1, color: 1, IMEI_number: 1, user: 1, user: { $arrayElemAt: ['$user', 0] }
                    }
                }

            ]).toArray()

            resolve(client)
        })
    },
    invokeUser: (userId) => {
        return new promise(async (resolve, reject) => {
            await db.get().collection(collections.USERS).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })

        })

    }

}






