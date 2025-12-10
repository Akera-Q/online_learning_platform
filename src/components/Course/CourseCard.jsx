import React from "react"
import { Link } from "react-router-dom"

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title || "Course Title"}</h3>
        <p className="text-gray-600 mb-4">
          {course.shortDescription || "Course description will appear here."}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">By: Instructor</span>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{course.rating?.average || 0}</span>
          </div>
        </div>
        <Link to={`/courses/${course._id || "1"}`} className="mt-4 block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded">
          View Course
        </Link>
      </div>
    </div>
  )
}

export default CourseCard