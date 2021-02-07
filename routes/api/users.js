var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.param('user', function(req, res, next, slug) {
  User.findOne({ username: slug })
    .then(function (user) {
      if (!user) { return res.sendStatus(404); }

      req.user = user;

      return next();
    }).catch(next);
});

router.get('/user/:user', auth, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user || user.role !== 1){ return res.sendStatus(401); }

    return res.json({user: req.user.toJSON()});
  }).catch(next);
});

router.put('/user/:user', auth, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user || user.role !== 1){ return res.sendStatus(401); }

    if(typeof req.body.user.username !== 'undefined'){
      req.user.username = req.body.user.username;
    }
    if(typeof req.body.user.role !== 'undefined'){
      req.user.setRole(req.body.user.role);
    }
    if(typeof req.body.user.password !== 'undefined'){
      req.user.setPassword(req.body.user.password);
    }

    return req.user.save().then(function(){
      return res.status(204).json({user: req.user.toAuthJSON()});
    });
  }).catch(next);
});

router.delete('/user/:user', auth, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user || user.role !== 1){ return res.sendStatus(401); }

    return req.user.remove().then(function(){
      return res.status(204).json("deleted");
    })
  }).catch(next);
});

router.get('/users', auth, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user || user.role !== 1){ return res.sendStatus(401); }

    var query = {};
    var limit = 20;
    var offset = 0;
  
    if(typeof req.query.limit !== 'undefined'){
      limit = req.query.limit;
    }
  
    if(typeof req.query.offset !== 'undefined'){
      offset = req.query.offset;
    }
  
    return Promise.all([
      User.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .exec(),
      User.count(query).exec(),
    ]).then(function(results){
      var users = results[0];
      var usersCount = results[1];
  
      return res.json({
        users: users.map(function(user){
          return user.toJSON();
        }),
        usersCount: usersCount
      });
    });
  }).catch(next);
});

router.post('/users/login', function(req, res, next){
  if(!req.body.user.username){
    return res.status(422).json({errors: {username: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err) };

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/users', auth, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user || user.role !== 1){ return res.sendStatus(401); }
    
    const user = new User();
  
    user.username = req.body.username;
    user.setPassword(req.body.password);  
    if (!user.setRole(req.body.role.toLowerCase())) {
      return res.status(422).json({errors: {role: "can only be admin or normal"}})
    }
  
    return user.save().then(function(){
      return res.status(201).json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

module.exports = router;
