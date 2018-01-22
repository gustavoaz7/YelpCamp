const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  password: String,
  firstName: String,
  lastName: String,
  email: {type: String, unique: true},
  avatar: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  validationToken: String,
  validated: {type: Boolean, default: false} 
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)