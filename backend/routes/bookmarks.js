const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/authMiddleware")
const User = require("../models/User")
const Course = require("../models/Course")

// @desc    Get user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "bookmarks",
      populate: {
        path: "instructor",
        select: "name email"
      }
    })
    
    res.status(200).json({
      success: true,
      data: user.bookmarks
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
})

// @desc    Add course to bookmarks
// @route   POST /api/bookmarks/:courseId
// @access  Private
router.post("/:courseId", protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    const user = await User.findById(req.user.id)
    
    // Check if already bookmarked
    if (user.bookmarks.includes(req.params.courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course already bookmarked"
      })
    }
    
    user.bookmarks.push(req.params.courseId)
    await user.save()

    // Return updated bookmarks (populated)
    const updatedUser = await User.findById(req.user.id).populate({
      path: "bookmarks",
      populate: { path: "instructor", select: "name email" }
    }).select("bookmarks")

    res.status(200).json({
      success: true,
      data: updatedUser.bookmarks
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
})

// @desc    Remove course from bookmarks
// @route   DELETE /api/bookmarks/:courseId
// @access  Private
router.delete("/:courseId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    user.bookmarks = user.bookmarks.filter(
      bookmark => bookmark.toString() !== req.params.courseId
    )
    
    await user.save()
      // Return updated bookmarks (populated)
      const updatedUser = await User.findById(req.user.id).populate({
        path: "bookmarks",
        populate: { path: "instructor", select: "name email" }
      }).select("bookmarks")

      res.status(200).json({
        success: true,
        data: updatedUser.bookmarks
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