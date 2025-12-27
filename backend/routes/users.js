const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require("../controllers/authController")

// All routes require authentication
router.use(protect)

// Admin only routes
router.get("/", authorize("admin"), getUsers)
router.get("/:id", authorize("admin"), getUser)
router.put("/:id", updateUser) // User can update own profile
router.delete("/:id", authorize("admin"), deleteUser)
// Reactivate / toggle active status (admin only)
router.patch("/:id/active", authorize("admin"), require('../controllers/authController').toggleUserActive)

module.exports = router