import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"

const QuizPage = () => {
  const { id } = useParams()
  const [answers, setAnswers] = useState({})
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const { checkAuth } = useAuth()

  const fetchQuiz = async () => {
    setLoading(true)
    setError("")
    try {
      let q = null
      try {
        const res = await axios.get(`/api/quizzes/${id}`)
        q = res.data.data
      } catch (err) {
        // If direct quiz fetch failed (maybe id is actually a course id), try fetching quizzes for course
        if (err.response?.status === 404) {
          const courseRes = await axios.get(`/api/quizzes/course/${id}`)
          const list = courseRes.data.data || []
          if (list.length > 0) {
            q = list[0]
          } else {
            throw new Error("Quiz not found")
          }
        } else {
          throw err
        }
      }
      setQuiz(q)
      setAnswers({})
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuiz()
  }, [id])

  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!quiz) return

    // validate all questions answered
    const allAnswered = quiz.questions.every((_, idx) => answers[idx] !== undefined && answers[idx] !== null)
    if (!allAnswered) {
      setError("Please answer all questions before submitting.")
      return
    }

    const payload = {
      answers: quiz.questions.map((_, index) => ({ questionIndex: index, answerIndex: answers[index] }))
    }

    try {
      setError("")
      setSubmitLoading(true)
      // Use the actual quiz id in case this page was loaded via course id fallback
      const quizIdToSubmit = quiz._id || id
      const res = await axios.post(`/api/quizzes/${quizIdToSubmit}/submit`, payload)
      const data = res.data.data
      alert(`Quiz Results: ${data.score}/${data.totalPoints} points (${data.percentage}%) - ${data.passed ? 'PASSED' : 'FAILED'}`)
      if (data.passed) {
        // Refresh auth so completed courses update
        await checkAuth()
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz")
    } finally {
      setSubmitLoading(false)
    }
  }

  const looksLikeObjectId = (s) => {
    if (!s) return false
    if (typeof s === 'object') return true
    if (typeof s === 'string' && /^[0-9a-fA-F]{24}$/.test(s)) return true
    // handle Mongo extended JSON like { "$oid": "..." }
    try {
      const parsed = typeof s === 'string' && s.startsWith('{') ? JSON.parse(s) : null
      if (parsed && parsed.$oid) return true
    } catch (e) {
      // ignore
    }
    return false
  }
  const displayTitle = () => {
    if (!quiz) return `Quiz #${id}`
    if (quiz.title && !looksLikeObjectId(quiz.title)) return quiz.title
    if (quiz.course && quiz.course.title) return `Quiz: ${quiz.course.title}`
    return `Quiz #${id}`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{displayTitle()}</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          {loading ? (
            <div className="p-6 text-center">Loading quiz...</div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="mb-4 text-red-600">{error}</div>
              <button type="button" onClick={fetchQuiz} className="bg-blue-600 text-white px-4 py-2 rounded">Retry</button>
            </div>
          ) : !quiz ? (
            <div className="p-6 text-center">Quiz not found.</div>
          ) : (quiz.questions?.length || 0) === 0 ? (
            <div className="p-6 text-center">This quiz has no questions yet.</div>
          ) : (
            quiz.questions.map((q, index) => (
              <div key={index} className="mb-8 p-4 border rounded">
                <h3 className="text-lg font-semibold mb-4">Question {index + 1}: {q.questionText}</h3>
                <div className="space-y-2">
                  {(q.options || []).map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optIndex}
                        className="mr-2"
                        checked={answers[index] === optIndex}
                        onChange={() => setAnswers({...answers, [index]: optIndex})}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
          )}
          <button type="submit" disabled={submitLoading} className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold ${submitLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {submitLoading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default QuizPage