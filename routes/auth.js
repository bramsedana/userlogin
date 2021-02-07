var jwt = require('express-jwt');

function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  
  return null;
}

var auth = jwt({
  secret: 'secret',
  userProperty: 'payload',
  getToken: getTokenFromHeader,
  algorithms: ['HS256']
});

module.exports = auth;
