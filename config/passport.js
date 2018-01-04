const LocalStrategy = require('passport-local')
const User = require('../models/user.js')

module.exports = function(passport) {
  // Using passport-local-mongoose methods

  // Passport session setup
    // required for persistent login sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Local strategy
  passport.use('local', new LocalStrategy(User.authenticate()))

}