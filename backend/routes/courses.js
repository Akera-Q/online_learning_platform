const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse
} = require("../controllers/courseController")

// Public routes
router.get("/", getCourses)
router.get("/:id", getCourse)

// Protected routes
router.use(protect)

// Student routes
router.post("/:id/enroll", authorize("student"), enrollCourse)

// Instructor/Admin routes
router.post("/", authorize("admin"), createCourse)
router.put("/:id", authorize("instructor", "admin"), updateCourse)
router.delete("/:id", authorize("admin"), deleteCourse)

module.exports = router