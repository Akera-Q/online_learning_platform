import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const InstructorPage = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [title, setTitle] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return
      try {
        // includeUnpublished so instructors see their drafts
        const instructorId = user.id || user._id
        const res = await axios.get(`/api/courses?instructor=${instructorId}&includeUnpublished=true`)
        setCourses(res.data.data || [])
      } catch (err) {
        setCourses([])
      }
    }
    fetchCourses()
  }, [user])

  const addQuestion = () => {
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 }])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((q, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    if (field === "questionText") updated[index].questionText = value
    if (field.startsWith("option")) {
      const optIndex = Number(field.replace("option", ""))
      updated[index].options[optIndex] = value
    }
    if (field === "correctAnswer") updated[index].correctAnswer = Number(value)
    if (field === "points") updated[index].points = Number(value)
    setQuestions(updated)
  }

  const handleSubmit = async () => {
    if (!title || !selectedCourse) return alert("Please provide quiz title and select a course")
    // Basic validation for questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText || q.options.some(o => !o)) return alert("Each question must have text and 4 options")
    }

    try {
      setLoading(true)
      // Log the payload to help debugging and then send
      const payload = { title, course: selectedCourse, questions }
      console.debug("Creating quiz with payload:", payload)
      const res = await axios.post("/api/quizzes", payload)
      const created = res.data.data
      alert("Quiz created")
      // If created, navigate to the quiz page for convenience
      if (created && created._id) {
        window.location.href = `/quiz/${created._id}`
        return
      }
      setTitle("")
      setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 }])
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create Quiz</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Quiz Title" className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} />
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border rounded p-2">
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>

            {questions.map((q, i) => (
              <div key={i} className="border p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">Question {i + 1}</label>
                  <div className="space-x-2">
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(i)} className="text-red-500">Remove</button>
                    )}
                  </div>
                </div>
                <input className="w-full border rounded p-2 mb-2" value={q.questionText} onChange={e => updateQuestion(i, "questionText", e.target.value)} placeholder="Question text" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  {[0,1,2,3].map(optIndex => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <input type="radio" name={`correct-${i}`} checked={q.correctAnswer === optIndex} onChange={() => updateQuestion(i, "correctAnswer", optIndex)} />
                      <input className="flex-1 border rounded p-2" value={q.options[optIndex]} onChange={e => updateQuestion(i, `option${optIndex}`, e.target.value)} placeholder={`Option ${optIndex + 1}`} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-sm">Points</label>
                  <input type="number" min={1} className="w-24 border rounded p-1 ml-2" value={q.points} onChange={e => updateQuestion(i, "points", e.target.value)} />
                </div>
              </div>
            ))}

            <div className="flex items-center space-x-2">
              <button type="button" onClick={addQuestion} className="bg-gray-100 px-3 py-1 rounded">Add Question</button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Creating..." : "Create Quiz"}</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default InstructorPage