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
    // If student passed, add course to their completed courses
    if (passed) {
      const User = require("../models/User")
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { completedCourses: quiz.course } })
    }
    
    res.status(200).json({
      success: true,
      data: {
        score,
        totalPoints,
        percentage: percentage.toFixed(2),
        passed,
        passingScore: quiz.passingScore
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