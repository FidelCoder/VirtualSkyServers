const mongoose = require('mongoose');

const InterestSchema = new mongoose.Schema({
  interest: {
    type: String,
    required: true,
  },
});

const Interest = mongoose.model('Interest', InterestSchema);

module.exports = Interest;
