import React, { useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"

const QuizPage = () => {
  const { id } = useParams()
  const [answers, setAnswers] = useState({})

  const questions = [
    { id: 1, text: "What is React?", options: ["Framework", "Library", "Language", "Tool"], correctAnswer: 1 },
    { id: 2, text: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java XML"], correctAnswer: 0 }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate score
    let correctCount = 0
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    
    const score = Math.round((correctCount / questions.length) * 100)
    const result = `Quiz Results: ${correctCount}/${questions.length} correct (${score}%)`
    
    alert(result)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quiz #{id}</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          {questions.map((q, index) => (
            <div key={q.id} className="mb-8 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-4">Question {index + 1}: {q.text}</h3>
              <div className="space-y-2">
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={optIndex}
                      className="mr-2"
                      onChange={() => setAnswers({...answers, [q.id]: optIndex})}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold">
            Submit Quiz
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default QuizPage