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



    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Update fields allowed
    if (req.body.name) user.name = req.body.name
    if (req.body.role && req.user.role === 'admin') user.role = req.body.role

    // Handle password change
    if (req.body.password) {
      // Require confirmPassword and ensure it matches the new password
      if (!req.body.confirmPassword || req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ success: false, message: 'New passwords do not match' })
      }

      if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
      }

      // Only set the password after validation
      user.password = req.body.password
    }

    await user.save()

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || "",
      isActive: user.isActive
    }

    res.status(200).json({ success: true, data: safeUser })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Delete user (soft deactivation)
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

// @desc    Toggle user active status (reactivate or deactivate)
// @route   PATCH /api/users/:id/active
// @access  Private/Admin
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Expect body: { active: true/false }
    const { active } = req.body
    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, message: "Invalid 'active' value" })
    }

    user.isActive = active
    await user.save()

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || "",
      isActive: user.isActive
    }

    res.status(200).json({ success: true, data: userResponse })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}