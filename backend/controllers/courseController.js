const Course = require("../models/Course")
const User = require("../models/User")

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const query = {}

    // Optional filter by instructor id
    if (req.query.instructor) {
      query.instructor = req.query.instructor
    }

    // Optional search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" }
    }

    // includeUnpublished=true will skip the isPublished filter
    if (req.query.includeUnpublished !== "true") {
      query.isPublished = true
    }

    const courses = await Course.find(query)
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

    // If an admin provided an instructor identifier, validate it
    if (req.user.role === "admin" && (req.body.instructor || req.body.instructorEmail)) {
      let instructorUser
      if (req.body.instructor) {
        instructorUser = await User.findById(req.body.instructor)
      } else if (req.body.instructorEmail) {
        instructorUser = await User.findOne({ email: req.body.instructorEmail.toLowerCase() })
      }

      if (!instructorUser || instructorUser.role !== "instructor") {
        return res.status(400).json({ success: false, message: "Instructor not found or is not an instructor" })
      }

      req.body.instructor = instructorUser._id
    }

    // If creator is an instructor and no instructor specified, set to current user
    if (!req.body.instructor && req.user.role === "instructor") {
      req.body.instructor = req.user.id
    }

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
    
    // Return updated course and user's enrolled courses
    const updatedCourse = await Course.findById(req.params.id).populate("enrolledStudents", "name")
    const updatedUser = await User.findById(req.user.id).populate({ path: "enrolledCourses", select: "title" }).select("enrolledCourses")

    res.status(200).json({
      success: true,
      data: {
        course: updatedCourse,
        enrolledCourses: updatedUser.enrolledCourses
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}