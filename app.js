// Requiring packages
const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')
const methodOverride = require('method-override')
// Requiring models
const User = require('./models/user.js')
const Campground = require('./models/campground.js')
const Comment = require('./models/comment.js')
//const seedDB = require('./seeds.js')  
//seedDB();   // Clear DB and populate with 3 items
// Requiring routes
const campgroundRoutes = require('./routes/campgrounds.js')
const commentRoutes = require('./routes/comments.js')
const authRoutes = require('./routes/auth.js')

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

// CONFIG
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(bodyparser.urlencoded({extended: true}))
app.use(function(req, res, next) {
  res.locals.loggedUser = req.user;   // req.locals will be available in all our templaces
  next()
})
app.use(methodOverride('_method'))

// ROUTES
app.use("/", authRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/comments", commentRoutes)


app.get('/', (req,res) => {
  res.render("landing")
})


app.listen(3000, function() {
  console.log('Server is up and running...')
})
