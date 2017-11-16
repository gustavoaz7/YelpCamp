const mongoose = require('mongoose')

const campgroundSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  location: String,
  description: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
})

module.exports = mongoose.model('Campground', campgroundSchema)