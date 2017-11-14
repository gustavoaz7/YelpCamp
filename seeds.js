const mongoose = require('mongoose')
const Campground = require('./models/campground.js')
const Comment = require('./models/comment.js')

let data = [
  {
    name: 'Garatucaia', 
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Deep_Lake_tenting_campsite_-_Riding_Mountain_National_Park.JPG',
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    name: 'Three Cliffs', 
    image: 'http://farm2.static.flickr.com/1007/575816446_eb75bcab37.jpg',
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    name: 'Visconde de Maua', 
    image: 'https://www.outsideonline.com/sites/default/files/styles/full-page/public/2017/07/18/picking-campsite_h.jpg',
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  }
]


function seedDB() {
  // Clear DB
  Campground.remove({}, function(err) {
    if (err) throw err;
    console.log('campgrounds removed');
    // Populate DB
    data.forEach(seed => {
      Campground.create(seed, function(err, campground) {
        if (err) throw err;
        console.log("campground added")
        // Creating a comment
        Comment.create({text: "This is a sample comment.", author: "Myself"}, function(err, comment) {
          if (err) throw err;
          campground.comments.push(comment)
          campground.save()
          console.log('created new comment');
        })
      })
    })
  }) 
}

module.exports = seedDB;