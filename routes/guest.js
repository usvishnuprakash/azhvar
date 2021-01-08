const { response } = require('express');
var express = require('express');
const { helpers } = require('handlebars');
var router = express.Router();
var partnersHelpers = require('../helpers/partnersHelpers')
var guestsHelpers=require('../helpers/guestHelpers')
var session = require('express-session');
const guestHelpers = require('../helpers/guestHelpers');

/* GET home page. */
router.get('/',async function (req, res, next) {
   if (req.session.loggedIn) {
      if (req.session.user) {
         res.redirect('/u')
      } else if (req.session.partner) {
         res.redirect('/p')
      } else {
         res.render('guest/base', { guest: true })
      }
   } else {
     var comments=await guestHelpers.invoke_comments()
      res.render('guest/base', { guest: true,comments })
   }
   router.get('/about',function(req,res){
     res.render('us/about')
   })
   router.get('/howItsWork', function(req,res){
      res.render('us/howItsWork')
   })
   router.get('/contact_us',function(req,res){
      res.render('us/contactPage')
   })
});
module.exports = router;