const express = require('express')
const router = express.Router()
const Campground = require('../models/campground')
const Comment = require('../models/comment')
const flash = require('connect-flash')
const geocoder = require('geocoder')
const configGoogleAPI = require('../config/googleAPI').key

// INDEX - Show a list of all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) return console.log(err);
    res.render('index', {campgrounds:allCampgrounds})
  })
})

// NEW - Show form to add new campgrounds
router.get('/new', isLoggedIn, (req, res) => {
  res.render('newCampground')
})

// CREATE - Add new campground to DB
router.post('/', isLoggedIn, (req, res) => {
  geocoder.geocode(req.body.location,  (err, geo) => {
    if (err || geo.status !== "OK") {
      req.flash('error', err || `Status of your location search: ${geo.status}`)
    } else {
      const newCampground = {
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        description: req.body.description,
        author: {
          id: req.user._id,
          username: req.user.username
        },
        location: geo.results[0].formatted_address,
        lat: geo.results[0].geometry.location.lat,
        lng: geo.results[0].geometry.location.lng
      } 
      Campground.create(newCampground, (err, data) => {
        if (err || !data) {
          console.log(err);
          req.flash('error', err);
        } else {
          req.flash('success', data.name + 'successfully added.')
        }
      })
    }
    res.redirect('/campgrounds')
  })
})

// SHOW - Show selected campground information
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err || !foundCampground) {
      console.log(err);
      req.flash('error', 'Campground not found.')
      return res.redirect('/campgrounds')
    }
    res.render('show', {campground: foundCampground, APIkey: configGoogleAPI})
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
  geocoder.geocode(req.body.updatedCampground.location, (err, geo) => {
    if (err || geo.status !== "OK") {
      console.log(err);
      req.flash('error', err || `Status of your location search: ${geo.status}`)
      return res.redirect('/campgrounds/')
    }
    req.body.updatedCampground.location = geo.results[0].formatted_address;
    req.body.updatedCampground.lat = geo.results[0].geometry.location.lat;
    req.body.updatedCampground.lng = geo.results[0].geometry.location.lng;
    Campground.findByIdAndUpdate(req.params.id, req.body.updatedCampground, (err, updatedCampground) => {
      if (err || !updatedCampground) {
        console.log(err);
        req.flash('error', err.message)
        return res.redirect('back')
      }
      req.flash('success', updatedCampground.name + 'successfully updated.')
      res.redirect('/campgrounds/' + updatedCampground._id)
    })
  })
})

// REMOVE - 
router.delete('/:id', isAuthorOfCampground, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, deletedCampground) => {
    if (err || !deletedCampground) {
      console.log(err);
      req.flash('error', err.message)
      return res.redirect('/campgrounds')
    }
    req.flash('success', deletedCampground.name + ' successfully deleted.')
    Comment.deleteMany({
      _id: {
        $in: deletedCampground.comments
      }
    }, (err, deletedComments) => {
      if (err) {
        req.flash('error', err.message)
        return res.redirect('/campgrounds')
      }
      req.flash('success', deletedCampground.name + ' campground & comments successfully deleted.')
    })
    res.redirect('/campgrounds')
  })
})

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', "You must log in first.")
  res.redirect('/login')
}

function isAuthorOfCampground(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err || !foundCampground) {
        console.log(err);
        req.flash('error', "Campground not found.")
        res.redirect('back')
      } else if (foundCampground.author.id.equals(req.user._id)) return next();
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