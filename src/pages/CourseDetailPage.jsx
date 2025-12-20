import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import axios from "axios"

const CourseDetailPage = () => {
  const { id } = useParams()
  const { user, checkAuth } = useAuth()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    fetchCourseDetails()
  }, [id, user])

  // Keep bookmark/enroll state in sync with latest user/course data
  useEffect(() => {
    if (course && user) {
      const enrolled = (course.enrolledStudents || []).some(student => student._id === user.id || student === user.id)
      setIsEnrolled(enrolled)
      const bookmarked = (user.bookmarks || []).some(b => (b._id || b) === id)
      setIsBookmarked(bookmarked)
    }
  }, [user, course, id])

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`)
      setCourse(response.data.data)
      
      if (user && response.data.data) {
        checkEnrollment(response.data.data)
        checkBookmark(response.data.data)
      }
    } catch (error) {
      setError("Failed to load course details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resolveUploadUrl = (url) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000"
    // Ensure no double slashes
    return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`
  }

  const checkEnrollment = (courseData) => {
    try {
      if (courseData.enrolledStudents && user) {
        const enrolled = courseData.enrolledStudents.some(student => 
          student._id === user.id || student === user.id
        )
        setIsEnrolled(enrolled)
      }
    } catch (error) {
      console.error("Error checking enrollment:", error)
    }
  }

  const checkBookmark = async (courseData) => {
    try {
      if (user) {
        const response = await axios.get("/api/bookmarks")
        const bookmarkedCourseIds = response.data.data.map(bookmark => 
          bookmark._id || bookmark
        )
        setIsBookmarked(bookmarkedCourseIds.includes(id))
      }
    } catch (error) {
      console.error("Error checking bookmark:", error)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login")
      return
    }
    
    try {
      const response = await axios.post(`/api/courses/${id}/enroll`)
      // Refresh auth state so dashboard/bookmarks update globally
      await checkAuth()
      setError("")
      if (response.data?.data?.course) setCourse(response.data.data.course)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to enroll in course")
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      navigate("/login")
      return
    }
    
    try {
      if (isBookmarked) {
        await axios.delete(`/api/bookmarks/${id}`)
      } else {
        await axios.post(`/api/bookmarks/${id}`)
      }
      // Refresh auth state to keep UI consistent
      await checkAuth()
      setError("")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update bookmark")
      console.error("Bookmark error:", error.response?.data)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
            <Link to="/courses" className="text-blue-600 hover:text-blue-700">
              ← Back to Courses
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-6 md:mb-0">
                <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                <p className="text-blue-100 mb-4">{course.shortDescription}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-300 mr-1">★</span>
                    <span>{course.rating?.average || "No ratings"}</span>
                  </div>
                  <span>•</span>
                  <span>{course.enrolledStudents?.length || 0} students</span>
                  <span>•</span>
                  <span>{course.category}</span>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleBookmark}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    isBookmarked
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
                
                {!isEnrolled ? (
                  <button
                    onClick={handleEnroll}
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition"
                  >
                    Enroll Now
                  </button>
                ) : (
                  <Link
                    to={`/quiz/${id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition text-center"
                  >
                    Start Learning
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Course Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                <div className="space-y-4">
                  {course.content?.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                          {item.type === "document" && item.url && (
                            <div className="mt-2">
                              <a href={resolveUploadUrl(item.url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Open document
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-600">{item.duration || 0} min</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No content available yet</p>
                  )}
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Instructor</h2>
                {course.instructor ? (
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl mr-4">
                      {course.instructor.name?.charAt(0) || "I"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{course.instructor.name}</h3>
                      <p className="text-gray-600">{course.instructor.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Instructor information not available</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-bold mb-4">Course Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Duration</h4>
                    <p className="text-gray-900">
                      {course.content?.reduce((acc, item) => acc + (item.duration || 0), 0) || 0} minutes
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Level</h4>
                    <p className="text-gray-900">Beginner to Intermediate</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">Prerequisites</h4>
                    <ul className="list-disc list-inside text-gray-900">
                      {course.prerequisites?.length > 0 ? (
                        course.prerequisites.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">What You'll Learn</h4>
                    <ul className="list-disc list-inside text-gray-900">
                      <li>Complete course material</li>
                      <li>Hands-on exercises</li>
                      <li>Certificate of completion</li>
                      <li>Lifetime access</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  
                  {isEnrolled ? (
                    <Link
                      to={`/quiz/${id}`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold transition"
                    >
                      Go to Course
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                      Enroll Now
                    </button>
                  )}
                  
                  <p className="text-center text-gray-600 mt-2 text-sm">
                    30-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default CourseDetailPage