const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const Course = require("../models/Course")
const User = require("../models/User")

// @desc    Get certificate for a course
// @route   GET /api/certificates/:courseId
// @access  Private/Student
router.get("/:courseId", protect, authorize("student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
    const user = await User.findById(req.user.id)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    // Check if user has completed the course
    if (!user.completedCourses.includes(req.params.courseId)) {
      return res.status(403).json({
        success: false,
        message: "You must complete the course to get a certificate"
      })
    }
    
    // Generate certificate data (in a real app, you'd generate a PDF)
    const certificateData = {
      studentName: user.name,
      courseTitle: course.title,
      instructorName: "Instructor Name", // You'd populate this
      completionDate: new Date().toISOString().split('T')[0],
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    res.status(200).json({
      success: true,
      data: certificateData
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