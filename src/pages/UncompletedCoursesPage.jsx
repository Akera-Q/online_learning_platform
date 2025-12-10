import React from "react"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"

const UncompletedCoursesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Courses in Progress</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">No courses in progress</h2>
          <p className="text-gray-600">Courses you're enrolled in will appear here</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default UncompletedCoursesPage