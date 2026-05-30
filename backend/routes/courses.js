const express = require("express")
const router = express.Router()
const { protect, authorize, optionalAuth } = require("../middleware/authMiddleware")
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  rateCourse
} = require("../controllers/courseController")
const path = require("path")
const fs = require("fs")
const multer = require("multer")

// Configure multer storage for uploads
const uploadDir = path.join(__dirname, "..", "public", "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  }
})

const upload = multer({ storage })

// Public routes
router.get("/", getCourses)
router.get("/:id", optionalAuth, getCourse)

// Protected routes
router.use(protect)

// Student routes
router.post("/:id/enroll", authorize("student"), enrollCourse)

// Rating
router.post("/:id/rate", rateCourse)

// Instructor/Admin routes
router.post("/", authorize("admin"), createCourse)
// Upload course file (PDF) - Admin only
router.post("/upload", authorize("admin"), upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" })
  }

  const files = req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename, originalName: f.originalname }))
  res.status(201).json({ success: true, data: files })
})
router.put("/:id", authorize("instructor", "admin"), updateCourse)
router.delete("/:id", authorize("admin"), deleteCourse)

module.exports = router