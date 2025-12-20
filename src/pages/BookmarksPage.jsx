import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"

const BookmarksPage = () => {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookmarks()
  }, [user])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/bookmarks")
      setBookmarks(res.data.data || [])
    } catch (err) {
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Bookmarked Courses</h1>
        {loading ? (
          <div className="text-center p-8">Loading...</div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">🔖</div>
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-gray-600 mb-6">Courses you bookmark will appear here</p>
            <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map(course => (
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

export default BookmarksPage