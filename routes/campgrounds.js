const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')

// INDEX - Show a list of all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) throw err;
    res.render('index.ejs', {campgrounds:allCampgrounds})
  })
  // res.render("campgrounds", {campgrounds: campgrounds})
})

// NEW - Show form to add new campgrounds
router.get('/new', isLoggedIn, (req, res) => {
  res.render('new')
})

// CREATE - Add new campground to DB
router.post('/', isLoggedIn, (req, res) => {
  const newCampground = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.description,
    author: {
      id: req.user._id,
      username: req.user.username
    }
  } 
  Campground.create(newCampground, (err, data) => {
    if (err) throw err;
  })
  res.redirect('/campgrounds')
})

// SHOW - Show selected campground information
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err) throw err;
    res.render('show', {campground: foundCampground})
  })
})

// EDIT - Edit selected campground information
router.get('/:id/edit', isAuthorOfCampground, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render('editCampground', {campground: foundCampground})
  })
})

// UPDATE - Update selected campground information
router.put('/:id', isAuthorOfCampground, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.updatedCampground, (err, updatedCampground) => {
    res.redirect('/campgrounds/' + updatedCampground._id)
  } )
})

// REMOVE - 
router.delete('/:id', isAuthorOfCampground, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    res.redirect('/campgrounds')
  })
})

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login')
}

function isAuthorOfCampground(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) res.redirect('back');
      // .equals is a mongoose method. === wouldn't work because one is an object and the other a string.
      if (foundCampground.author.id.equals(req.user._id)) return next();
      res.redirect('back')
    })
  }
}

module.exports = router;