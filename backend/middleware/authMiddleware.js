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
    
    // Deny access for deactivated accounts and clear cookie
    if (req.user.isActive === false) {
      res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      })
      return res.status(403).json({
        success: false,
        message: "Account is deactivated"
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

// Optional auth middleware: populate req.user if a valid token is present, otherwise continue silently
exports.optionalAuth = async (req, res, next) => {
  let token
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (user && user.isActive !== false) {
      req.user = user
    }
  } catch (err) {
    // ignore token errors for optional auth
  }

  return next()
}