const User = require("../models/User")

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const query = {}

    if (req.query.role) {
      query.role = req.query.role
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } }
      ]
    }

    const users = await User.find(query).select("-password")
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    // Only allow users to update their own profile unless admin
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this user" })
    }
    // Disallow updating email through this endpoint
    if (req.body.email) delete req.body.email

    // If updating name, ensure it's not already taken by another user
    if (req.body.name) {
      const existing = await User.findOne({ name: req.body.name.trim() })
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(400).json({ success: false, message: "Name already in use" })
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select("-password")
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    
    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    
    // Soft delete (just mark as inactive)
    user.isActive = false
    await user.save()
    
    res.status(200).json({
      success: true,
      message: "User deactivated successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}