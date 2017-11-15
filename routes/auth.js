const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const flash = require('connect-flash')


// Register form
router.get('/register', (req, res) => {
  res.render('register')
})

// Register form logic
router.post('/register', (req, res) => {
  const newUser = new User({username: req.body.username})
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash('error', err.message)
    } else {
      passport.authenticate('local')(req, res, () => {
        req.flash('success', `Hello ${user.username}! Welcome to YelpCamp :)`)
      })
    }
    res.redirect('/campgrounds')
  })
})

// Login form
router.get('/login', (req, res) => {
  res.render('login')
})

// Login form logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failure: '/login',
  successFlash: "Welcome to YelpCamp!",
  failureFlash: true
}) ,(req, res) => {
})

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'User successfully logged out.')
  res.redirect('/campgrounds')
})

module.exports = router;