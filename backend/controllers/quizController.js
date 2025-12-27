const Quiz = require("../models/Quiz")
const Course = require("../models/Course")

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
exports.getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      course: req.params.courseId 
    }).populate("course", "title")
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("course", "title instructor")
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      })
    }

    console.log(`DEBUG: GET /api/quizzes/${req.params.id} - questions: ${quiz.questions?.length || 0}`)
    
    res.status(200).json({
      success: true,
      data: quiz
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Create quiz (instructor only)
// @route   POST /api/quizzes
// @access  Private/Instructor
exports.createQuiz = async (req, res) => {
  try {
    console.log(`DEBUG: POST /api/quizzes - received quiz payload. title: ${req.body.title}, questions: ${req.body.questions?.length || 0}`)
    // Check if instructor owns the course
    const course = await Course.findById(req.body.course)
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      })
    }
    
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create quiz for this course"
      })
    }
    
    // Validate questions array
    const questions = req.body.questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Quiz must include a non-empty questions array" })
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q || typeof q.questionText !== "string" || q.questionText.trim() === "") {
        return res.status(400).json({ success: false, message: `Question ${i + 1} is missing questionText` })
      }
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(o => typeof o !== "string" || o.trim() === "")) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} must have 4 non-empty options` })
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} has invalid correctAnswer` })
      }
      q.points = Number(q.points) || 1
    }

    // If title missing or looks like an ObjectId equal to course id, generate a friendly title
    let title = req.body.title && String(req.body.title).trim()
    if (!title || /^[0-9a-fA-F]{24}$/.test(title) && title === String(course._id)) {
      title = `Quiz: ${course.title}`
    }

    const quiz = await Quiz.create({ title, course: req.body.course, questions: questions, timeLimit: req.body.timeLimit, passingScore: req.body.passingScore, maxAttempts: req.body.maxAttempts, isFinalExam: req.body.isFinalExam })
    const populated = await Quiz.findById(quiz._id).populate("course", "title instructor")
    console.log(`DEBUG: POST /api/quizzes - created quiz ${quiz._id} with ${quiz.questions?.length || 0} questions`)

    res.status(201).json({ success: true, data: populated })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      })
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findOne({
      _id: quiz.course,
      enrolledStudents: req.user.id
    })
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to take this quiz"
      })
    }
    
    const { answers } = req.body // answers should be array of {questionIndex, answerIndex}
    
    // Calculate score
    let score = 0
    let totalPoints = 0
    console.log(`DEBUG: POST /api/quizzes/${req.params.id}/submit - answers: ${JSON.stringify(req.body.answers)}`)
    
    quiz.questions.forEach((question, index) => {
      totalPoints += question.points
      const studentAnswer = answers.find(a => a.questionIndex === index)
      
      if (studentAnswer && studentAnswer.answerIndex === question.correctAnswer) {
        score += question.points
      }
    })
    
    const percentage = totalPoints === 0 ? 0 : (score / totalPoints) * 100
    const passed = percentage >= quiz.passingScore
    
    // Save quiz attempt (you might want to create a QuizAttempt model)
    // If student passed, add course to their completed courses and generate certificate PDF
    let certificateInfo = null
    if (passed) {
      const User = require("../models/User")
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { completedCourses: quiz.course } })

      // Try to generate a PDF certificate and save record
      try {
        const PDFDocument = require('pdfkit')
        const Certificate = require('../models/Certificate')
        const fs = require('fs')
        const path = require('path')

        // Ensure directory exists
        const certDir = path.join(__dirname, '..', 'public', 'uploads', 'certificates')
        if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true })

        // Load required data
        const user = await User.findById(req.user.id)
        const Course = require('../models/Course')
        const course = await Course.findById(quiz.course)

        const filename = `${Date.now()}-${Math.round(Math.random()*1e9)}.pdf`
        const filepath = path.join(certDir, filename)
        const doc = new PDFDocument({ size: 'A4', margin: 50 })

        const stream = fs.createWriteStream(filepath)
        doc.pipe(stream)

        // Simple certificate layout
        doc.fontSize(24).text('Certificate of Completion', { align: 'center' })
        doc.moveDown(1)
        doc.fontSize(16).text(`This certifies that`, { align: 'center' })
        doc.moveDown(0.5)
        doc.fontSize(20).text(user.name, { align: 'center', underline: true })
        doc.moveDown(0.5)
        doc.fontSize(14).text(`has successfully completed`, { align: 'center' })
        doc.moveDown(0.5)
        doc.fontSize(18).text(`${course.title}`, { align: 'center' })
        doc.moveDown(0.5)
        doc.fontSize(14).text(`Quiz: ${quiz.title || `Quiz: ${course.title}`}`, { align: 'center' })
        doc.moveDown(1)
        doc.fontSize(12).text(`Date: ${new Date().toISOString().split('T')[0]}`, { align: 'center' })
        doc.moveDown(2)
        const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2,8)}`
        doc.fontSize(10).text(`Certificate ID: ${certId}`, { align: 'center' })

        doc.end()

        // Wait for finish
        await new Promise((resolve, reject) => {
          stream.on('finish', resolve)
          stream.on('error', reject)
        })

        const url = `/uploads/certificates/${filename}`
        certificateInfo = await Certificate.create({ user: req.user.id, course: course._id, quiz: quiz._id, filename, url, mimeType: 'application/pdf', certificateId: certId })
      } catch (err) {
        console.error('Certificate generation failed:', err.message)
        if (err && err.code === 'MODULE_NOT_FOUND') {
          console.error('PDF generation requires `pdfkit`. Run `npm install pdfkit` in the backend directory and restart the server to enable PDF certificates.')
        }
        // Fallback: generate a simple text certificate so users still get a downloadable file
        try {
          const fs = require('fs')
          const path = require('path')
          const Certificate = require('../models/Certificate')

          const certDir = path.join(__dirname, '..', 'public', 'uploads', 'certificates')
          if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true })

          const user = await User.findById(req.user.id)
          const Course = require('../models/Course')
          const course = await Course.findById(quiz.course)

          const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2,8)}`
          const filename = `${Date.now()}-${Math.round(Math.random()*1e9)}.txt`
          const filepath = path.join(certDir, filename)

          const content = `Certificate of Completion\n\nStudent: ${user.name}\nCourse: ${course.title}\nQuiz: ${quiz.title || `Quiz: ${course.title}`}\nDate: ${new Date().toISOString().split('T')[0]}\nCertificate ID: ${certId}`
          fs.writeFileSync(filepath, content, 'utf8')

          const url = `/uploads/certificates/${filename}`
          certificateInfo = await Certificate.create({ user: req.user.id, course: course._id, quiz: quiz._id, filename, url, mimeType: 'text/plain', certificateId: certId })
        } catch (err2) {
          console.error('Text certificate fallback failed:', err2.message)
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        totalPoints,
        percentage: percentage.toFixed(2),
        passed,
        passingScore: quiz.passingScore,
        certificate: certificateInfo
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    })
  }
}