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
    
    const quiz = await Quiz.create(req.body)
    
    res.status(201).json({
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
    
    quiz.questions.forEach((question, index) => {
      totalPoints += question.points
      const studentAnswer = answers.find(a => a.questionIndex === index)
      
      if (studentAnswer && studentAnswer.answerIndex === question.correctAnswer) {
        score += question.points
      }
    })
    
    const percentage = (score / totalPoints) * 100
    const passed = percentage >= quiz.passingScore
    
    // Save quiz attempt (you might want to create a QuizAttempt model)
    
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