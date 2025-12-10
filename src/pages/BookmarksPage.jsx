import React from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"

const BookmarksPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Bookmarked Courses</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">🔖</div>
          <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
          <p className="text-gray-600 mb-6">Courses you bookmark will appear here</p>
          <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
            Browse Courses
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default BookmarksPage