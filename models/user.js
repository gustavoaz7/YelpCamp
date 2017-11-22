const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  password: String,
  firstName: String,
  lastName: String,
  email: {type: String, unique: true, required: true},
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  }
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)