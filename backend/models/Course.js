const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ""
  },
  content: [{
    title: String,
    type: {
      type: String,
      enum: ["video", "document", "quiz", "text"],
      default: "text"
    },
    url: String,
    duration: Number,
    order: Number
  }],
  prerequisites: [{
    type: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Course", courseSchema)