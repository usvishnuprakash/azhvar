var createError = require('http-errors');
var express = require('express');
var hbs = require('express-handlebars')
const Handlebars = require('handlebars')
var session = require('express-session')
var cookie = require('cookie')
var flash=require('express-flash')
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const https = require("https");
const qs = require("querystring");

var dataBase = require('./configure/connection')

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')



var expresshbs = require('express-handlebars');
var path = require('path');
const { handlebars } = require('hbs')
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var partnersRouter = require('./routes/partners');
var usersRouter = require('./routes/users');
var guestRouter = require('./routes/guest');
var resetRouter = require('./routes/reset');
var paymentRouter=require('./routes/payment')
var index = express();



// view engine setup
index.set('views', path.join(__dirname, 'views'));
index.set('view engine', 'hbs',);
index.engine('hbs', hbs({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  extname: "hbs",
  defaultLayout: "layouts",

  layoutsDir: __dirname + "/views/layout/",
  partialsDir: __dirname + "/views/partials/",
})
);
index.use(logger('dev'));
index.use(express.json());
index.use(express.urlencoded({ extended: false }));
index.use(cookieParser());
index.use(express.static(path.join(__dirname, 'public')));
index.use(session({ secret: "key", resave: true, saveUninitialized: true, cookie: { maxAge: 60000000000000000 } }));
index.use(flash());

index.use('/', guestRouter);
index.use('/p', partnersRouter);
index.use('/u', usersRouter);
index.use('/forgot',resetRouter);
index.use('/payment',paymentRouter)
dataBase.connect((err,done) => {
  if (err) console.log('database is not connnected' + err)
  else console.log('database is connected')
})


// catch 404 and forward to error handler
index.use(function (req, res, next) {
  next(createError(404));
});

// error handler
index.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.index.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = index;
