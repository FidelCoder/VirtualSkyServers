const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullname: String,
  username: String,
  date_of_birth: Date,
  location: String,
  interests: [String]
});

module.exports = mongoose.model('User', userSchema);
