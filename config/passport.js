const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
const User = require('../models/user.js')
const configAuth = require('./auth.js')

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

  // Facebook strategy
  passport.use(new FacebookStrategy({
    clientID: configAuth.facebook.clientID,
    clientSecret: configAuth.facebook.clientSecret,
    callbackURL: configAuth.facebook.callbackURL
  }, function(token, refreshToken, profile, done) {
    console.log(profile);
    // asynchronous
    process.nextTick(function() {
      User.findOne({ 'facebook.id': profile.id }, function(err, user) {
        if (err) return done(err);
        if (user) return done(null, user);  // user found -> log user in
        const newUser = new User({
          'facebook.id': profile.id,
          'facebook.token': token,
          'facebook.name': profile.displayName || profile.name.givenName+" "+profile.familyName,
          'facebook.email': typeof profile.emails !== 'undefined' ? profile.emails[0].value : 'empty@mail.com'
        })
        console.log(newUser);
        newUser.save();
        return done(null, newUser)
      })
    })
  }))
}