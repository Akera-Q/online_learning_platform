import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import CourseCard from "../components/Course/CourseCard"
import axios from "axios"

const DashboardPage = () => {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [completedCourses, setCompletedCourses] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Use user data that was already fetched
      setEnrolledCourses(user.enrolledCourses || [])
      setCompletedCourses(user.completedCourses || [])
      setBookmarks(user.bookmarks || [])
      setLoading(false)
    }
  }, [user])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user.role === "student" 
              ? "Continue your learning journey" 
              : user.role === "instructor"
              ? "Manage your courses and students"
              : "Manage the platform"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {enrolledCourses.length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{completedCourses.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">Bookmarks</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{bookmarks.length}</p>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
            <Link
              to="/courses"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse All Courses →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
              <Link
                to="/courses"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/courses"
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition"
            >
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-medium text-gray-900">Browse Courses</h3>
            </Link>
            
            <Link
              to="/bookmarks"
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition"
            >
              <div className="text-2xl mb-2">🔖</div>
              <h3 className="font-medium text-gray-900">Bookmarks</h3>
            </Link>
            
            <Link
              to="/uncompleted"
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition"
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900">In Progress</h3>
            </Link>
            
            <Link
              to="/profile"
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-center transition"
            >
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900">Profile</h3>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default DashboardPage