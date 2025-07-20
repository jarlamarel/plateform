const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: String,
  level: String,
  price: Number,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

courseSchema.methods.getPublicInfo = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
