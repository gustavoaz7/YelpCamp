const express = require('express')
const router = express.Router({mergeParams: true})  // Merge :id from router at app.js so we can retrieve req.params.id
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const flash = require('connect-flash')

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
      if (err) {
        req.flash('error', err)
      } else {
        comment.author = {id: req.user._id, username: req.user.username }
        comment.save();
        campground.comments.push(comment);
        campground.save();
        req.flash('success', 'Comment successfully added.')
      }
      res.redirect(`/campgrounds/${campground._id}`)
    })
  })
})

// Edit comment form
router.get('/:comment_id/edit', isAuthorOfComment, (req, res) => {
  Comment.findById(req.params.comment_id, (err, comment) => {
    if (err) res.redirect('back');
    res.render('editComment', {comment: comment, campgroundID: req.params.id})
  })
})

// Update comment logic
router.put('/:comment_id', isAuthorOfComment, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.updatedComment, (err, comment) => {
    req.flash('success', 'Comment successfully updated.')
    res.redirect(`/campgrounds/${req.params.id}`)
  })
})

// Remove comment
router.delete('/:comment_id', isAuthorOfComment, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    req.flash('success', 'Comment successfully deleted.')
    res.redirect(`/campgrounds/${req.params.id}`)
  })
})

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', "You must log in first.")
  res.redirect('/login')
}

function isAuthorOfComment(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        req.flash('error', "Comment not found.")
        res.redirect('back')
      } else if (foundComment.author.id.equals(req.user._id)) return next();
      req.flash('error', "You don't have permission to do that.")
      res.redirect('back')
    })
  } else {
    req.flash('error', "You must log in first.")
    res.redirect('back')
  }
}

module.exports = router;