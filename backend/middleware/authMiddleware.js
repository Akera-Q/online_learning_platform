const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - user must be logged in
exports.protect = async (req, res, next) => {
  let token
  
  // Get token from cookie first
  if (req.cookies.token) {
    token = req.cookies.token
  }
  
  // Fallback to Authorization header (Bearer token)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }
  
  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    })
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from token
    req.user = await User.findById(decoded.id)
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      })
    }
    
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    })
  }
}

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      })
    }
    next()
  }
}