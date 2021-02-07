var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  hash: String,
  salt: String,
  role: Number,
}, {timestamps: true});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.setRole = function(role){
  if (role === 'admin') {
    this.role = 1;
  } else if (role === 'normal') {
    this.role = 2;
  } else {
    return false
  }
  return true
};

UserSchema.methods.getRole = function(){
  return this.role === 1 ? 'admin' : 'normal'
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'secret');
};

UserSchema.methods.toJSON = function(){
  return {
    id: this.id,
    username: this.username,
    role: this.getRole()
  };
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    token: this.generateJWT(),
    role: this.getRole()
  };
};

mongoose.model('User', UserSchema);
