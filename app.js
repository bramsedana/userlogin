var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var session = require('express-session');

// mongoose.connect('mongodb://localhost/loginuser');
mongoose.connect(`mongodb+srv://admin:asdasd123@cluster0.seo3v.mongodb.net/loginuser?retryWrites=true&w=majority`);
require('./models/User');
require('./config/passport');

var app = express();

app.use(cors());

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({ secret: 'secret', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

app.use(require('./routes'));

app.use(function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({'errors': {
    message: err.message,
    error: err
  }});
});

var server = app.listen(3000, function(){
  console.log('Listening on port ' + server.address().port);
});
