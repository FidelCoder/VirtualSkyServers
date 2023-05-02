const mongoose = require('mongoose');

const astrologyDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  sunSign: {
    type: String,
    required: true,
  },
  chineseZodiac: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('AstrologyData', astrologyDataSchema);
