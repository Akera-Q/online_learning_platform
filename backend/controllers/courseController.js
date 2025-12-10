const Course = require("../models/Course")
const User = require("../models/User")

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name email")
      .populate("enrolledStudents", "name")
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email profilePicture")
      .populate("enrolledStudents", "name email")
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    res.status(200).json({
      success: true,
      data: course
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Create course (admin only)
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    // Add admin as creator
    req.body.createdBy = req.user.id
    
    const course = await Course.create(req.body)
    
    res.status(201).json({
      success: true,
      data: course
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor or Admin
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    // Check permission
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course"
      })
    }
    
    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    
    res.status(200).json({
      success: true,
      data: course
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    await course.deleteOne()
    
    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      })
    }
    
    // Add student to course
    course.enrolledStudents.push(req.user.id)
    await course.save()
    
    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { enrolledCourses: course._id } }
    )
    
    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}