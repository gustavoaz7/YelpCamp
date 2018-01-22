const express = require('express')
const router = express.Router()
const passport = require('passport')
const flash = require('connect-flash')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const User = require('../models/user')
const Campground = require('../models/campground')
const mailer = require('../config/mailer')

// Register form
router.get('/register', (req, res) => {
  res.render('register', {page: 'register'})
})

// Register form logic
router.post('/register', (req, res) => {
  crypto.randomBytes(20, function(err, buf) {
    const token = buf.toString('hex')

    const newUser = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      avatar: req.body.avatar,
      validationToken: token
    })
    User.register(newUser, req.body.password, (err, user) => {
      if (err || !user) {
        console.log(err);
        req.flash('error', err.message)
        res.redirect('/register')
      } else {
        // // Generate SMTP service account from ethereal.email
        // nodemailer.createTestAccount((err, account) => {
        //   if (err) return console.log(err);
          // // Create a SMTP transporter object
          // const smtpTransport = nodemailer.createTransport({
          //   host: account.smtp.host,
          //   port: account.smtp.port,
          //   secure: account.smtp.secure,
          //   auth: {
          //     user: account.user,
          //     pass: account.pass
          //   },
          //   logger: false,
          //   debug: false // include SMTP traffic in the logs
          // })
        // })

        // Create transport to deliver message
        /*
        *  Mailtrap is a fake SMTP server for development tests.
        *  No email is really sent to users
        */
        const smtpTransport = nodemailer.createTransport({
          host: "smtp.mailtrap.io", 
          port: 2525,
          auth: {
            user: process.env.MAILER_USER || mailer.user,
            pass: process.env.MAILER_PASS || mailer.pass
          }
        })
        const mailOptions = {
          to: user.email,
          from: process.env.MAILER_DEFAULT_ADDRESS || mailer.defaultAddress,
          subject: 'Yelpcamp Account Validation',
          text: `
          Hello ${user.username}, 
          To complete your registration please click on the following link, or paste this into your browser:
          ${process.env.baseURL ? `${process.env.baseURL}/validate/${token}/${user._id}` : `http://localhost:3000/validate/${token}/${user._id}`}`
        }
        smtpTransport.sendMail(mailOptions, function(err, info) {
          if (err) return console.log(err.message);
          console.log('Mail sent successfully');
          req.flash('success', `A validation email has been sent to ${user.email}`)
          res.redirect('/login')
        })
      }
    })
  })
})

// Validate user account
router.get('/validate/:token/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return console.log(err);
    if (!user) {
      req.flash('error', 'User not found.')
      return res.redirect('/login')
    }
    if (req.params.token !== user.validationToken) {
      req.flash('error', 'Incorrect validation token.')
      return res.redirect('/login')
    }
    if (user.validated) {
      return req.logIn(user, (err) => {
        if (err) return console.log(err);
        req.flash('success', `User already validated. Welcome back, ${user.username}.`)
        return res.redirect('/campgrounds')
      })
    }

    User.findByIdAndUpdate(user._id, {$set: { validated: true}}, (err, updatedUser) => {
      if (err) return console.log(err);
      req.logIn(updatedUser, (err) => {
        if (err) return console.log(err);
        req.flash('success', `User successfully validated! Welcome to YelpCamp, ${updatedUser.username}! :)`)
        return res.redirect('/campgrounds')
      })
    })
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
router.get('/users/:id', isValidatedAndLoggedIn, (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err || !user) {
      console.log(err);
      req.flash('error', err.message)
      return res.redirect('/login')
    }
    Campground.find({'author.id': user._id}, (err, userCampgrounds) => {
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
router.get('/logout', isValidatedAndLoggedIn, (req, res) => {
  req.logout();
  req.flash('success', 'User successfully logged out.')
  res.redirect('/campgrounds')
})

// FORGOT PASSWORD
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
      const smtpTransport = nodemailer.createTransport({
        host: "smtp.mailtrap.io", 
        port: 2525,
        auth: {
          user: process.env.MAILER_USER || mailer.user,
          pass: process.env.MAILER_PASS || mailer.pass
        }
      })
      const mailOptions = {
        to: user.email,
        from: process.env.MAILER_DEFAULT_ADDRESS || mailer.defaultAddress,
        subject: 'Yelpcamp Password Reset',
        text: `
        Hello ${user.username},
        You are receiving this because you (or someone else) have requested the reset of the password for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        ${process.env.baseURL ? process.env.baseURL+'/reset/'+token : `http://localhost:3000/reset/${token}`}
        If you did not request this, please ignore this email and your password will remain unchanged.`
      }
      smtpTransport.sendMail(mailOptions, function(err, info) {
        if (err) return console.log(err.message);
        console.log('Mail sent successfully');
        req.flash('success', `An email has been sent to ${user.email}`)
        res.redirect('/forgot')
      })
    })
  })
})

router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }, function(err, user) {
    if (err) {
      req.flash('error', 'Password reset token is invalid or has expired.')
      return res.redirect('/forgot')
    }
    res.render('reset', {token: req.params.token})
  })
})

router.post('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }, function(err, user) {
    if (err) {
      req.flash('error', 'Password reset token is invalid or has expired.')
      return res.redirect('/forgot')
    }
    if (req.body.password !== req.body.confirmPassword) {
      req.flash('error', 'Passwords do not match.')
      return res.redirect('/forgot')
    }
    user.setPassword(req.body.password, function(err) {   // passport-local-mongoose method
      if (err) return console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.save(function(err) {
        if (err) return console.log(err);
        req.logIn(user, function(err) {
          if (err) return console.log(err);
          return user
        })
      })
    })
  })
  .then(user => {
    // nodemailer.createTestAccount((err, account) => {
    //   if (err) return console.log(err);
      // const smtpTransport = nodemailer.createTransport({
      //   host: account.smtp.host,
      //   port: account.smtp.port,
      //   secure: account.smtp.secure,
      //   auth: {
      //     user: account.user,
      //     pass: account.pass
      //   },
      //   logger: false,
      //   debug: false // include SMTP traffic in the logs
      // })

    const smtpTransport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILER_USER || mailer.user,
        pass: process.env.MAILER_PASS || mailer.pass
      }
    })
    const mailOptions = {
      to: user.email,
      from: process.env.MAILER_DEFAULT_ADDRESS || mailer.defaultAddress,
      subject: 'Yelpcamp password successfully changed',
      text: `
      Hello ${user.username},
      This is a confirmation that the password for your account has been changed.`
    }
    smtpTransport.sendMail(mailOptions, function(err, info) {
      if (err) return console.log(err.message);
      console.log('Mail sent successfully');
      req.flash('success', `Your password has been changed!`)
      res.redirect('/campgrounds')
    })
  })
})


// middleware
function isValidatedAndLoggedIn(req, res, next) {
  if (!req.user.validated) {
    req.flash('error', 'You must validate your account first. Please check your email.')
    return res.redirect('/login')
  }
  if (req.isAuthenticated()) return next();
  req.flash('error', "You must log in first.")
  res.redirect('/login')
}


module.exports = router;