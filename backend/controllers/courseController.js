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

    // Normalize rating stats from the embedded ratings array to avoid inconsistencies
    const normalized = courses.map(course => {
      const obj = course.toObject ? course.toObject() : course
      const ratings = obj.ratings || []
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
        obj.rating = obj.rating || {}
        obj.rating.count = ratings.length
        // Use integer averages to avoid half-stars in UI
        obj.rating.average = Math.round(sum / obj.rating.count)
      } else {
        obj.rating = obj.rating || { count: 0, average: 0 }
      }
      return obj
    })
    
    res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized
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
// @access  Public (optional auth)
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

    // Provide user's rating if available
    let userRating = null
    if (req.user) {
      const userRatingObj = (course.ratings || []).find(r => r.user.toString() === req.user._id.toString())
      if (userRatingObj) userRating = Number(userRatingObj.rating)
    }

    // Recalculate rating stats from the ratings array (always) to keep consistency
    if (course.ratings && course.ratings.length > 0) {
      const sum = course.ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
      course.rating = course.rating || {}
      course.rating.count = course.ratings.length
      // Use integer averages to avoid half-star increments
      course.rating.average = Math.round(sum / course.rating.count)
    } else {
      course.rating = course.rating || { count: 0, average: 0 }
    }

    res.status(200).json({
      success: true,
      data: course,
      userRating
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Rate a course (create or update user's rating)
// @route   POST /api/courses/:id/rate
// @access  Private (logged-in users)
exports.rateCourse = async (req, res) => {
  try {
    const mongoose = require('mongoose')
    const { rating } = req.body
    const numeric = Math.round(Number(rating))
    if (Number.isNaN(numeric) || numeric < 1 || numeric > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' })
    }

    // Validate course id format early
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid course id' })
    }

    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    // If student, only allow rating if enrolled
    if (req.user.role === 'student') {
      if (!course.enrolledStudents || !course.enrolledStudents.some(s => s.toString() === req.user._id.toString())) {
        return res.status(403).json({ success: false, message: 'You must be enrolled to rate this course' })
      }
    }

    // Find existing rating by this user
    let existing = (course.ratings || []).find(r => r.user.toString() === req.user._id.toString())

    if (existing) {
      existing.rating = numeric
    } else {
      course.ratings = course.ratings || []
      course.ratings.push({ user: req.user._id, rating: numeric })
    }

    // Recalculate average and count (use integer averages)
    const sum = course.ratings.reduce((acc, r) => acc + (r.rating || 0), 0)
    course.rating.count = course.ratings.length
    course.rating.average = course.rating.count === 0 ? 0 : Math.round(sum / course.rating.count)

    await course.save()

    return res.status(200).json({
      success: true,
      data: {
        average: course.rating.average,
        count: course.rating.count,
        userRating: numeric
      }
    })
  } catch (err) {
    console.error('Rate course error', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
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