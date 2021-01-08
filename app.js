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
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs',);
app.engine('hbs', hbs({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  extname: "hbs",
  defaultLayout: "layouts",

  layoutsDir: __dirname + "/views/layout/",
  partialsDir: __dirname + "/views/partials/",
})
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "key", resave: true, saveUninitialized: true, cookie: { maxAge: 60000000000000000 } }));
app.use(flash());

app.use('/', guestRouter);
app.use('/p', partnersRouter);
app.use('/u', usersRouter);
app.use('/forgot',resetRouter);
app.use('/payment',paymentRouter)
dataBase.connect((err,done) => {
  if (err) console.log('database is not connnected' + err)
  else console.log('database is connected')
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
