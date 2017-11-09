const express = require('express')
const app = express()
const bodyparser = require('body-parser')

app.set('view engine', 'ejs')
app.use(bodyparser.urlencoded({extended: true}))

app.get('/', (req,res) => {
  res.render("landing")
})

// TEMP
let campgrounds = [
  {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
  {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'},
  {name: 'Visconde de Maua', image: 'https://www.outsideonline.com/sites/default/files/styles/full-page/public/2017/07/18/picking-campsite_h.jpg'},
  {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
  {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'},
  {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
  {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'}
]


app.get('/campgrounds', (req, res) => {
  
  res.render("campgrounds", {campgrounds: campgrounds})
})

app.get('/campgrounds/new', (req, res) => {
  res.render('new.ejs')
})

app.post('/campgrounds', (req, res) => {
  const newCampground = {
    name: req.body.name,
    image: req.body.image
  } 
  campgrounds.push(newCampground)

  res.redirect('/campgrounds')
})

app.listen(3000, function() {
  console.log('Server is up and running...')
})