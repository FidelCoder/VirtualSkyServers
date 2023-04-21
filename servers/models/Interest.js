const mongoose = require('mongoose');

const InterestSchema = new mongoose.Schema({
  interest: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the User model is named 'User'
    required: true,
  },
});

const Interest = mongoose.model('Interest', InterestSchema);

module.exports = Interest;
