const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req,res) => {
  res.render("landing")
})

app.get('/campgrounds', (req, res) => {
  let campgrounds = [
    {name: 'Garatucaia', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG'},
    {name: 'Three Cliffs', image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg'},
    {name: 'Visconde de Maua', image: 'https://www.outsideonline.com/sites/default/files/styles/full-page/public/2017/07/18/picking-campsite_h.jpg'}
  ]

  res.render("campgrounds", {campgrounds: campgrounds})
})

app.listen(3000, function() {
  console.log('Server is up and running...')
})