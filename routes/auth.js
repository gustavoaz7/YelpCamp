const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const Campground = require('../models/campground')
const flash = require('connect-flash')


// Register form
router.get('/register', (req, res) => {
  res.render('register', {page: 'register'})
})

// Register form logic
router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  })
  User.register(newUser, req.body.password, (err, user) => {
    if (err || !user) {
      console.log(err);
      req.flash('error', err.message)
      res.redirect('/register')
    } else {
      // login with newly created user
      passport.authenticate('local')(req, res, () => {
        req.flash('success', `Hello ${user.username}! Welcome to YelpCamp :)`)
        res.redirect('/campgrounds')
      })
    }
  })
})

// Login form
router.get('/login', (req, res) => {
  res.render('login', {page: 'login'})
})

// Login form logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login',
  successFlash: "Welcome to YelpCamp!",
  failureFlash: true
}) ,(req, res) => {
})

// Profile
router.get('/users/:username', (req, res) => {
  User.findOne({username: req.params.username}, (err, user) => {
    console.log(user);
    if (err || !user) {
      console.log(err);
      req.flash('error', err.message)
      return res.redirect('/login')
    }
    Campground.find({'author.id': user._id}, (err, userCampgrounds) => {
      console.log(userCampgrounds);
      if (err) {
        console.log(err);
        req.flash('error', err.message)
        return res.redirect('back')
      }
      res.render('profile', {campgrounds: userCampgrounds})
    })
  })
})

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'User successfully logged out.')
  res.redirect('/campgrounds')
})

module.exports = router;