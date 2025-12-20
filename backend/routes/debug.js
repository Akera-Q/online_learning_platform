const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/authMiddleware")
const Quiz = require("../models/Quiz")

// Debug: list quizzes (admin only)
router.use(protect)
router.get("/quizzes", authorize("admin"), async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("course", "title instructor")
    res.status(200).json({ success: true, count: quizzes.length, data: quizzes })
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message })
  }
})

// Repair malformed quizzes (admin only)
router.post("/quizzes/repair", authorize("admin"), async (req, res) => {
  try {
    const quizzes = await Quiz.find()
    const repaired = []
    for (const q of quizzes) {
      let needsRepair = false
      if (!Array.isArray(q.questions)) needsRepair = true
      else {
        for (let i = 0; i < q.questions.length; i++) {
          const qu = q.questions[i]
          if (!qu || typeof qu.questionText !== 'string' || !Array.isArray(qu.options) || qu.options.length !== 4) {
            needsRepair = true
            break
          }
        }
      }

      if (needsRepair) {
        q.questions = []
        await q.save()
        repaired.push(q._id)
      }
    }

    res.status(200).json({ success: true, repairedCount: repaired.length, repaired })
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message })
  }
})

module.exports = router
