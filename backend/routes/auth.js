const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Helper function to send token in cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured")
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_COOKIE_EXPIRE + "d" }
    )

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }

    // Create a clean user object WITHOUT modifying the original
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || ""
    }

    res.status(statusCode)
      .cookie("token", token, options)
      .json({
        success: true,
        token,
        user: userResponse
      })
  } catch (error) {
    console.error("ERROR in sendTokenResponse:", error.message)
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    })
  }
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide name, email, and password" 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      })
    }

    // Create user (accept instructor role if provided)
    const userRole = role === "instructor" || role === "student" ? role : "student"
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    })

    sendTokenResponse(user, 201, res)
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide email and password" 
      })
    }

    // Check for user
    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      })
    }

    sendTokenResponse(user, 200, res)
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    })
  }
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", async (req, res) => {
  try {
    let token
    
    // Get token from cookie first
    if (req.cookies.token) {
      token = req.cookies.token
    }
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized" 
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
      .populate("enrolledCourses", "title description instructor")
      .populate("completedCourses", "title description instructor")
      .populate("bookmarks", "title description instructor")

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        enrolledCourses: user.enrolledCourses || [],
        completedCourses: user.completedCourses || [],
        bookmarks: user.bookmarks || []
      }
    })
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: "Not authorized" 
    })
  }
})

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
})

module.exports = router