const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: { type: String, required: true },
  userId: { type: String, required: true }, // Add this line
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model('Course', courseSchema);
///////////////////////////////////////////////////////////////////



module.exports = Course;
