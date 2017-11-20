// Requiring packages
const express = require('express')
const bodyparser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')
const methodOverride = require('method-override')
// Requiring models
const User = require('./models/user.js')
const Campground = require('./models/campground.js')
const Comment = require('./models/comment.js')
// Requiring routes
const campgroundRoutes = require('./routes/campgrounds.js')
const commentRoutes = require('./routes/comments.js')
const authRoutes = require('./routes/auth.js')

// DATABASE CONFIG
const configDB = require('./config/database.js')
  // tell Mongoose to use Node global es6 Promises
mongoose.Promise = global.Promise;
  // New mongoose connection logic
mongoose.connect(configDB.url, { useMongoClient: true })
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.log('Error connecting to database: ' + err.message))

require('./config/passport')(passport); // pass passport for configuration

// CONFIG EXPRESS APP
const app = express()
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(bodyparser.json())  // get information from html forms
app.use(bodyparser.urlencoded({extended: true}))  
app.use(flash())  
app.use(methodOverride('_method'))
app.use(morgan('dev'));  // log every request to the console
app.use(cookieParser());  // read cookies (needed for auth)


// PASSPORT CONFIG
app.use(session({
  secret: "Some Random String",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())  // persistent login sessions - MUST be after the session from express-session to use it.


app.use(function(req, res, next) {
  // req.locals holds variables that are available only to the views rendered during that request.
  res.locals.loggedUser = req.user;
  res.locals.flashError = req.flash('error');
  res.locals.flashSuccess = req.flash('success');
  next()
})
// app.locals holds variables within and throughout the life of the app.
app.locals.moment = require('moment')  


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
