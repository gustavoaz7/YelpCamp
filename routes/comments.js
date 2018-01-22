const express = require('express')
const router = express.Router({mergeParams: true})  // Merge :id from router at app.js so we can retrieve req.params.id
const flash = require('connect-flash')

const Campground = require('../models/campground')
const Comment = require('../models/comment')

// New comment form
router.get('/new', isValidatedAndLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) return console.log(err);
    res.render('newComment', {campground: campground})
  })
})

// New comment form logic
router.post('/', isValidatedAndLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err || !campground) {
      console.log(err);
      return res.redirect('/campgrounds')
    }
    Comment.create(req.body.comment, (err, comment) => {  
      // req.body.commment is available because of comment[text] & comment[author] on newComment.ejs
      if (err || !comment) {
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
    if (err || !comment) {
      console.log(err);
      return res.redirect('back');
    }
    res.render('editComment', {comment: comment, campgroundID: req.params.id})
  })
})

// Update comment logic
router.put('/:comment_id', isAuthorOfComment, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, {
    $set: {
      text: req.body.updatedComment.text,
      updatedAt: Date.now()
    }
  }, (err, comment) => {
    if (err || !comment) {
      console.log(err);
      req.flash('error', 'Failed to update comment.')
    } else {
      req.flash('success', 'Comment successfully updated.')
    }
    res.redirect(`/campgrounds/${req.params.id}`)
  })
})

// Remove comment
router.delete('/:comment_id', isAuthorOfComment, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err, deletedComment) => {
    if (err) {
      console.log(err);
      req.flash('error', err.message)
      return res.redirect(`/campgrounds/${req.params.id}`)
    }
    Campground.findByIdAndUpdate(req.params.id, {
      $pull: {
        comments: deletedComment.id  // Pulls deletedComment from campground's comments array
      }
    }, (err, updatedCampground) => {
      if (err) {
        console.log(err);
        req.flash('error', err.message)
        return res.redirect(`/campgrounds/${req.params.id}`)
      }
      req.flash('success', 'Comment successfully deleted.')
    })
  })
  res.redirect(`/campgrounds/${req.params.id}`)
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

function isAuthorOfComment(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err || !foundComment) {
        console.log(err);
        req.flash('error', "Comment not found.")
        res.redirect('back')
      } else if (foundComment.author.id.equals(req.user._id)) return next();
      // .equals is a mongoose method. === wouldn't work because one is an object and the other a string.
      req.flash('error', "You don't have permission to do that.")
      res.redirect('back')
    })
  } else {
    req.flash('error', "You must log in first.")
    res.redirect('/login')
  }
}

module.exports = router;