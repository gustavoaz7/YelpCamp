const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')
const User = require('./models/user.js')
const Campground = require('./models/campground.js')
const Comment = require('./models/comment.js')
const seedDB = require('./seeds.js')  
seedDB();   // Clear DB and populate with 3 items

// New mongoose connection logic
mongoose.connect('mongodb://localhost/yelpcamp_db', { useMongoClient: true })
// tell Mongoose to use Node global es6 Promises
mongoose.Promise = global.Promise;

// PASSPORT CONFIG
app.use(session({
  secret: "Some Random String",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(bodyparser.urlencoded({extended: true}))
app.use(function(req, res, next) {
  res.locals.loggedUser = req.user;   // req.locals will be available in all our templaces
  next()
})

app.get('/', (req,res) => {
  res.render("landing")
})

// TEMP
// let campgrounds = [
//   {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
//   {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'},
//   {name: 'Visconde de Maua', image: 'https://www.outsideonline.com/sites/default/files/styles/full-page/public/2017/07/18/picking-campsite_h.jpg'},
//   {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
//   {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'},
//   {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
//   {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'}
// ]

// INDEX - Show a list of all campgrounds
app.get('/campgrounds', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) throw err;
    res.render('index.ejs', {campgrounds:allCampgrounds})
  })
  // res.render("campgrounds", {campgrounds: campgrounds})
})

// NEW - Show form to add new campgrounds
app.get('/campgrounds/new', (req, res) => {
  res.render('new')
})

// CREATE - Add new campground to DB
app.post('/campgrounds', (req, res) => {
  const newCampground = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.description
  } 
  Campground.create(newCampground, (err, data) => {
    if (err) throw err;
    console.log("Just created: " + data)
  })
  res.redirect('/campgrounds')
})

// SHOW - Show selected campground information
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err) throw err;
    res.render('show', {campground: foundCampground})
  })
})


// COMMENT routes

app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) throw err;
    res.render('newComment', {campground: campground})
  })
})

app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) res.redirect('/campgrounds')
    Comment.create(req.body.comment, (err, comment) => {  
      // req.body.commment is available because of comment[text] & comment[author] on newComment.ejs
      if (err) throw err;
      campground.comments.push(comment);
      campground.save();
      res.redirect(`/campgrounds/${campground._id}`)
    })
  })
})

// AUTH routes
app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', (req, res) => {
  const newUser = new User({username: req.body.username})
  User.register(newUser, req.body.password, (err, user) => {
    if (err) throw err;
    passport.authenticate('local')(req, res, () => {
      res.redirect('/campgrounds')
    })
  })
})

// LOGIN routes
app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failure: '/login'
}) ,(req, res) => {
})

// LOGOUT routes
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/campgrounds')
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login')
}

app.listen(3000, function() {
  console.log('Server is up and running...')
})



/*
RESTFULL ROUTES

Name    url               verb      description
==========================================================================
INDEX   /campground       GET       Show list of all campgrounds
NEW     /campground/new   GET       Show form to add new campgrounds
CREATE  /campground       POST      Add new campground to DB
SHOW    /campground/:id   GET       Show selected campground information

 
*/