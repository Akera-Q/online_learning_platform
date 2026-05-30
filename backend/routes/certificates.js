const express = require("express")
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect, authorize } = require("../middleware/authMiddleware")
const Course = require("../models/Course")
const User = require("../models/User")
const { uploadCertificate, getUserCertificates, deleteCertificate } = require('../controllers/certificateController')

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'certificates')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir) },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, unique + ext)
  }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// @desc    Get certificate data for a course (legacy helper)
// @route   GET /api/certificates/:courseId
// @access  Private/Student
router.get("/:courseId", protect, authorize("student"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
    const user = await User.findById(req.user.id)

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    // Check if user has completed the course
    if (!user.completedCourses.includes(req.params.courseId)) {
      return res.status(403).json({ success: false, message: "You must complete the course to get a certificate" })
    }

    // Generate certificate data (in a real app, you'd generate a PDF)
    const certificateData = {
      studentName: user.name,
      courseTitle: course.title,
      instructorName: course.instructor?.name || "Instructor",
      completionDate: new Date().toISOString().split('T')[0],
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    res.status(200).json({ success: true, data: certificateData })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
})

// Download certificate file (owner or admin)
router.get('/:id/download', protect, async (req, res) => {
  try {
    const Certificate = require('../models/Certificate')
    const cert = await Certificate.findById(req.params.id)
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' })
    if (cert.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to download this certificate' })
    }

    const path = require('path')
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'certificates', cert.filename)
    return res.download(filePath, cert.filename)
  } catch (err) {
    console.error('Download cert error', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// Get current user's certificates
router.get('/', protect, getUserCertificates)

// Delete certificate
router.delete('/:id', protect, deleteCertificate)

module.exports = router