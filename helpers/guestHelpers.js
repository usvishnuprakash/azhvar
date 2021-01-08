var db = require('../configure/connection')
var collections = require('../configure/collections')
const promise = require('promise')
const { resolve, reject } = require('promise')
var bcrypt = require('bcrypt')
const { response } = require('express')
const e = require('express')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId
const { comments } = require('./usersHelpers')

module.exports = {
    invoke_comments: () => {
        return new promise(async(resolve, reject) => {
           var comment=await db.get().collection(collections.COMMENTS).aggregate([
                {
                    $project: {
                        comment: '$comment.comment',
                        userName: '$name'
                    }
                }, {
                    $project: {
                        comment: 1, userName: 1
                    }
                }
            ]).toArray(comment)
          
            resolve(comment)

        })

    }
}