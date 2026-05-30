const mongoose = require('mongoose')

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String },
  certificateId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Certificate', certificateSchema)
