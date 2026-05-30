const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const Course = require("../models/Course")
const User = require("../models/User")

// @desc    Rate a course
// @route   POST /api/ratings/:courseId
// @access  Private/Student
router.post("/:courseId", protect, authorize("student"), async (req, res) => {
  try {
    const { rating, review } = req.body
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      })
    }
    
    const course = await Course.findById(req.params.courseId)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    // Check if student has completed the course
    const user = await User.findById(req.user.id)
    if (!user.completedCourses.includes(req.params.courseId)) {
      return res.status(403).json({
        success: false,
        message: "You must complete the course before rating it"
      })
    }
    
    // Update course rating
    const newTotalRating = course.rating.average * course.rating.count + rating
    course.rating.count += 1
    course.rating.average = newTotalRating / course.rating.count
    
    await course.save()
    
    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: course.rating.average,
        totalRatings: course.rating.count
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
})

module.exports = router