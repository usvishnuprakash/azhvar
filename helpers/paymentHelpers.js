var db = require('../configure/connection')
var collections = require('../configure/collections')
var promise = require('promise')
const { response } = require('express')
const { resolve, reject } = require('promise')
var objectId = require('mongodb').ObjectID
var bcrypt = require('bcrypt')
const { PromiseProvider } = require('mongoose')
const Razorpay = require('razorpay')
const paytm = require('paytm-nodejs')
const config = {
    MID : 'wEywmV30801262280515', // Get this from Paytm console
    KEY : 'WUexp5blBRmaWruh', // Get this from Paytm console
    ENV : 'dev', // 'dev' for development, 'prod' for production
    CHANNEL_ID : 'WAP',
    INDUSTRY : 'Retail',  
    WEBSITE : 'Default',
    CALLBACK_URL : 'localhost:8080/paytm/webhook',  // webhook url for verifying payment
}
module.exports = {
    paytmOrder: (orderId) => {


        return new promise((resolve,reject)=>{
 let data = {
            TXN_AMOUNT : 100, // request amount
            ORDER_ID : orderId, // any unique order id 
            CUST_ID : 'CUST_123456' // any unique customer id		
        }
     
        // create Paytm Payment
        paytm.createPayment(config,data,function(err,data){
            console.log(data)
      resolve(data)
        });

        })
       
    }
}