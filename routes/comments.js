const express = require('express')
const router = express.Router({mergeParams: true})  // Merge :id from router at app.js so we can retrieve req.params.id
const Campground = require('../models/campground')
const Comment = require('../models/comment')

// New comment form
router.get('/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) throw err;
    res.render('newComment', {campground: campground})
  })
})

// New comment form logic
router.post('/', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) res.redirect('/campgrounds')
    Comment.create(req.body.comment, (err, comment) => {  
      // req.body.commment is available because of comment[text] & comment[author] on newComment.ejs
      if (err) throw err;
      comment.author = {id: req.user._id, username: req.user.username }
      comment.save();
      campground.comments.push(comment);
      campground.save();
      res.redirect(`/campgrounds/${campground._id}`)
    })
  })
})

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login')
}

module.exports = router;