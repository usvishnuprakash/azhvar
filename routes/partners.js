const { response } = require('express');
var express = require('express');
const { helpers } = require('handlebars');
var router = express.Router();
var partnersHelpers = require('../helpers/partnersHelpers')
var session = require('express-session');
const { partnerLogin } = require('../helpers/partnersHelpers');
const { ObjectId } = require('mongodb');
var verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.render('login/partnersLogin')
  }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
  if (req.session.loggedIn) {


    let clients = await partnersHelpers.partnerClients(req.session.partner._id)
    console.log(clients)
    res.render('partners/partnersBase', { clients, partner: req.session.partner })
  } else {
    res.redirect('/p/login')
  }


});
router.get('/logup', function (req, res) {
  res.render('logup/partnerLogup', { partner: req.session.partner })
})
router.post('/logup', async function (req, res) {

  await partnersHelpers.partnersSingnup(req.body).then(async(response) => {
   await partnersHelpers.partnersSignin(req.body).then((response) => {

      if (response.status) {

        req.session.loggedIn = true
        req.session.partner = response.user
        res.redirect('/p')
      } else {
        res.redirect('/p/login')
      }
    })
     
  })
})
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/p')
  } else {
    res.render('login/partnersLogin', { "loginErr": req.session.loginErr, partner: req.session.partner })

  }
  req.session.loginErr = false
})

router.post('/login', function (req, res) {
  partnersHelpers.partnersSignin(req.body).then(async (response) => {

    if (response.status) {

      req.session.loggedIn = true
      req.session.partner = response.user
      res.redirect('/p')
    } else {
      req.session.loginErr = "" + response.report
      res.redirect('/p/login',)
    }

  })


})
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})

router.get('/addNewOne', verifyLogin, function (req, res) {
  res.render('partners/partnersDuty/addExistingUser', { partner: req.session.partner })
})
router.post('/addNewOne', verifyLogin, function (req, res) {
  partnersHelpers.addClient(req.body).then((response) => {
    if (response.status) {
      res.render('partners/partnersDuty/addProducts', { client: response.client, partner: req.session.partner })
    } else {
      res.render('partners/partnersDuty/addExistingUser', { addProdErr: response.report, partner: req.session.partner })
    }
  })
})
router.post('/addition/:id', verifyLogin, async function (req, res) {
  let id = req.params.id
  let product = req.body
  res.render('partners/partnersDuty/newService', { id, product, partner: req.session.partner })
})
router.post('/newService/:id', verifyLogin, async function (req, res) {
  product = req.body
  let id = req.params.id
  await partnersHelpers.addition(req.body, id, req.session.partner._id).then((response) => {
    res.redirect('/p')


  })


})



router.get('/addSuccessfully', function (req, res) {
  res.render('partners/partnersDuty/addSuccessfully', { partner: req.session.partner })
})
router.get('/view/:id', verifyLogin, async function (req, res) {
  let id = req.params.id
  let client = await partnersHelpers.clientView(id)
  res.render('partners/detailesView', { client, partner: req.session.partner })
})
router.get('/addNewUser', function (req, res) {
  res.render('partners/partnersDuty/addNewUser', { partner: req.session.partner })
})
router.post('/addNewUserDone', function (req, res) {
  res.render('partners/partnersDuty/newUserDetailes', { partner: req.session.partner })
})
router.post('/addNewUserDeatailes', function (req, res) {
  res.render('partners/partnersDuty/additions')
})
router.get('/addSuccessfullyDone', function (req, res) {
  res.render('partners/partnersBase')
})
router.post('/addExistingUserId', function (req, res) {
  res.render('partners/partnersDuty/additions')
})




module.exports = router;
