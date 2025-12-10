import React from "react"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"

const InstructorPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create Quiz</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Quiz Title" className="w-full border rounded p-2" />
            <textarea placeholder="Questions" className="w-full border rounded p-2 h-32" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Quiz</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default InstructorPage