const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const Campground = require('../models/campground')
const flash = require('connect-flash')
const nodemailer = require('nodemailer')
const crypto = require('crypto')


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
router.get('/users/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
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

// Forgot password
router.get('/forgot', (req, res) => {
  res.render('forgot')
})

router.post('/forgot', (req, res, next) => {
  crypto.randomBytes(20, function(err, buf) {
    const token = buf.toString('hex')
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) {
        console.log(err);
        req.flash('error', err)
        return res.redirect('/forgot')
      }
      if (!user) {
        req.flash('error', 'No account registered with that email.')
        return res.redirect('/forgot')
      }
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 60*60*1000;  // 1 hour
      user.save(function(err) {
        if (err) return console.log(err);
        return user
      })
    })
    .then(user => {
      // Generate SMTP service account from ethereal.email
      nodemailer.createTestAccount((err, account) => {
        if (err) return console.log(err);
        /* === If not using a test account to send email ===
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'yelpcamp_mail@gmail.com',
            pass: require('../config/mail.js').mail
          }
        });
        */  
        // Create a SMTP transporter object
        const smtpTransport = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          },
          logger: false,
          debug: false // include SMTP traffic in the logs
        })
        const mailOptions = {
          to: user.email,
          from: 'noreply@yelpcampproj.com',
          subject: 'Yelpcamp Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
          Please click on the following link, or paste this into your browser to complete the process:
          http://localhost:3000/reset/${token}
          If you did not request this, please ignore this email and your password will remain unchanged.`
        }
        smtpTransport.sendMail(mailOptions, function(err, info) {
          if (err) return console.log(err.message);
          console.log('Mail sent successfully');
          console.log(nodemailer.getTestMessageUrl(info)); // URL to view sent email (ethereal.email)
          req.flash('success', `An email has been sent to ${user.email}`)
          res.redirect('/forgot')
        })
      })
    })
  })
})


// FACEBOOK ROUTES

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }))

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login',
  successFlash: "Welcome to YelpCamp!",
  failureFlash: true
}))

module.exports = router;