import React, { useEffect, useState } from "react"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import axios from "axios"

const UncompletedCoursesPage = () => {
  const { user, loading, checkAuth } = useAuth()
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      try {
        setLoadingCourses(true)
        // Use user's enrolled/completed arrays provided by AuthContext
        const enrolled = user.enrolledCourses || []
        const completed = user.completedCourses || []
        // Filter enrolled to those not completed
        const uncompleted = enrolled.filter(ec => !completed.some(cc => cc._id ? cc._id.toString() === ec._id.toString() : cc.toString() === ec.toString()))
        setCourses(uncompleted)
      } catch (err) {
        setCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }
    fetch()
  }, [user])

  const refresh = async () => {
    await checkAuth()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Courses in Progress</h1>
        {loading || loadingCourses ? (
          <div className="text-center p-6">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">No courses in progress</h2>
            <p className="text-gray-600">Courses you're enrolled in will appear here</p>
            <button onClick={refresh} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Refresh</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.shortDescription}</p>
                <Link to={`/courses/${course._id}`} className="text-blue-600 hover:underline">View Course</Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default UncompletedCoursesPage