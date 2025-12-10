const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const {
  getCourseQuizzes,
  getQuiz,
  createQuiz,
  submitQuiz
} = require("../controllers/quizController")

// All routes require authentication
router.use(protect)

// Student routes
router.get("/course/:courseId", getCourseQuizzes)
router.get("/:id", getQuiz)
router.post("/:id/submit", authorize("student"), submitQuiz)

// Instructor routes
router.post("/", authorize("instructor", "admin"), createQuiz)

module.exports = router