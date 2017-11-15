const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')


// Register form
router.get('/register', (req, res) => {
  res.render('register')
})

// Register form logic
router.post('/register', (req, res) => {
  const newUser = new User({username: req.body.username})
  User.register(newUser, req.body.password, (err, user) => {
    if (err) throw err;
    passport.authenticate('local')(req, res, () => {
      res.redirect('/campgrounds')
    })
  })
})

// Login form
router.get('/login', (req, res) => {
  res.render('login')
})

// Login form logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failure: '/login'
}) ,(req, res) => {
})

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/campgrounds')
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login')
}

module.exports = router;