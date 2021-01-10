var express = require('express');
var router = express.Router();
var usersHelpers = require('../helpers/usersHelpers')
var session = require('express-session');
var flash = require('connect-flash');
const { response } = require('express');
const { helpers } = require('handlebars');
const { ChangeStream } = require('mongodb');
var verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.render('login/usersLogin')
  }
}


/* GET users listing. */
router.get('/', async function (req, res, next) {
  if (req.session.loggedIn) {
    await usersHelpers.failedPayment(req.session.user._id)
    let service = await usersHelpers.userPurchases(req.session.user._id)
    if (!service.payment === 'success') {

    }


    console.log(req.session.user)




    let user_comment = await usersHelpers.showUserComments(req.session.user._id)

    res.render('users/usersBasePage', { user: req.session.user, service, user_comment })
  } else {
    res.redirect('u/login')
  }


});
router.get('/logup', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/u')
  }
  res.render('logup/usersLogup', { user: req.session.user })
})

router.post('/logup', async function (req, res) {
  await usersHelpers.fappistData(req.body).then(async (response) => {
    if (response.email) {

      res.json({ status: false, existEmail: response.email })
    } else if (response.num) {
      res.json({ status: false, existNum: response.num })
    } else {
      await usersHelpers.userSignup(req.body).then(async (response) => {
        res.json({ status: true })
      })

    }
  })
})

router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/u')
  } else {
    res.render('login/usersLogin', { "loginErr": req.session.loginErr, user: req.session.user })

  }
  req.session.loginErr = false
})
router.post('/login', function (req, res) {
  console.log(req.body)
  usersHelpers.userSignin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.json({ status: true, response })

    } else {
      res.json({ status: false, response })

    }

  })
})
router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})
router.get('/dataView', function (req, res) {
  let change = {}
  change.one = 1
  change.two = 2
  change.three = 3
  res.render('users/usersDetailesView', { user: req.session.user, change })

})
router.post('/data', async function (req, res) {

  await usersHelpers.userDetailes(req.body, req.session.user._id).then((response) => {
    res.redirect('/u')
  })


})
router.post('/dataUpdate', async function (req, res) {
  console.log('set1')
  await usersHelpers.userDetailes(req.body, req.session.user._id).then((response) => {
    console.log('fire')
    req.flash('message', 'Success!!');
    res.json({ status: response, message: 'Deatiles are succefully updated' })
  }).catch((err) => {
    console.log("mm")
    res.json({ status: false, Err: 'please try again' })
  })


})
router.get('/View/:id', verifyLogin, async function (req, res) {
  let id = req.params.id
  let product = await usersHelpers.productView(id)
  res.render('users/usersProductView', { product, user: req.session.user })
})
router.get('/needRepair/:id', verifyLogin, function (req, res) {
  let id = req.params.id
  res.render('users/repairEnquiry', { id, user: req.session.user })
})
router.post('/repair/:id', function (req, res) {
  let id = req.params.id
  usersHelpers.needrepair(req.body, id).then((response) => {
    res.render('users/repairAlert', { user: req.session.user })
  })

})
router.get('/buy', verifyLogin, function (req, res) {
  res.render('users/buy', { user: req.session.user })
})
router.post('/buy', function (req, res) {
  let product = req.body
  res.render('users/buySpecs', { product, user: req.session.user })
})
router.post('/addService', function (req, res) {


  usersHelpers.addService(req.body, req.session.user._id).then((response) => {

    let orderId = response
    console.log(orderId)
    console.log(orderId)
    console.log('yes')
    res.render('payment/usersPayment', { orderId, user: req.session.user })
  })

})
router.get('/payment/:id', function (req, res) {

  let orderId = req.params.id
  usersHelpers.paymentRZP(orderId).then((response) => {
    res.json(response)
  })
})
router.post('/payConfirm/rzp', function (req, res) {

  usersHelpers.rzpPaymentVerify(req.body).then((response) => {

    console.log(response)
    if (response.status) {
      usersHelpers.serviceStatus(req.body['order[receipt]'], req.session.user._id, response).then((response) => {
        usersHelpers.servicePayment(req.body['order[receipt]']).then((response) => {
          res.json({ status: true })
        })

      })

    }
  }).catch((err) => {
    console.log(err)
    res.json({ status: false, err: 'payment failed' })
  })
})
router.get('/allSuccess', function (req, res) {
  res.render('users/allSuccess', { user: req.session.user })
})
router.post('/comment', function (req, res) {
  console.log('yes')
  let first = req.session.user.first_name
  let second = req.session.user.last_name
  let name = first + second
  usersHelpers.comments(req.body, req.session.user._id, name).then((response) => {

    res.json({ status: true })
  })
})
router.get('/change_uN', verifyLogin, function (req, res) {
  res.render('users/change_userName')
})
router.post('/verify/:which', async function (req, res, next) {
  var which = req.params.which
  console.log(req.params.which)
  console.log(req.body)
  console.log(req.body.password)

  await usersHelpers.checkPassword(req.body.password, req.session.user._id).then((response) => {
    if (response.status) {
      var progress = 'updating...'
      if (which === '1') {
        var url = '/u/change_uN'

        res.json({ status: true, url, progress })
      } else if (which === '2') {
        var url = '/u/change_uP'
        res.json({ status: true, url, progress })
      } else {
        var url = '/u/change_uE'
        res.json({ status: true, url, progress })
      }
    }
    else {
      res.json({ status: false, progress: 'password is incorrect' })
    }
  })

})
router.get('/verify/:which', function (req, res) {
  let which = req.params.which
  console.log(which)
  res.render('users/detailesChangeVerify', { which, user: req.session.user })

})
router.post('/change_uN', async function (req, res) {
  console.log(req.body)
  await usersHelpers.change_userName(req.body, req.session.user._id).then(async (response) => {

    if (response.status) {

      req.session.sessionReload = true
      res.redirect('/u/session_reload')
    } else {
      res.redirect('/u/change_uN')
    }
  })
})
router.get('/change_uP', function (req, res) {
  res.render('users/change_userPassword', { user: req.session.user })
})
router.post('/change_uP', async function (req, res) {
  console.log(req.body)
  await usersHelpers.change_userPassword(req.body.password, req.session.user._id).then(async (response) => {

    if (response.status) {

      req.session.sessionReload = true
      res.redirect('/u/session_reload')
    } else {
      res.redirect('/u/change_uP')
    }
  })
})
router.get('/change_uE', function (req, res) {
  res.render('users/change_userEmail')
})
router.post('/change_uE', async function (req, res) {
  await usersHelpers.change_userEmail(req.session.user._id, req.body.email).then((response) => {
    req.session.sessionReload = true
    res.redirect('/u/session_reload')

    
  })
})
router.get('/session_reload', async function (req, res, next) {
  console.log('fine')
  if (req.session.sessionReload) {
    await usersHelpers.session_reloading(req.session.user._id).then((response) => {
      console.log('foi')
      req.session.user = response.user
      req.session.save(function (err) {
        console.log('ok')
        res.redirect('/u/dataView')
      })
    })
  } else {
    res.redirect('/u/dataView')
  }
  req.session.sessionReload = false
})
router.get('/services',async function (req,res) {
var repairDetailes=await usersHelpers.yourServices(req.session.user._id)
res.render('users/yourServices',{repairDetailes})
})
module.exports = router;
