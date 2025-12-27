import React, { useState, useEffect } from "react"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import Spinner from "../components/Spinner/Spinner"
const AdminUsers = React.lazy(() => import("../components/Admin/AdminUsers"))

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Users</h3>
            <p className="text-gray-600">Manage all users</p>
            <div className="mt-4">
              <React.Suspense fallback={<div className="flex items-center justify-center"><Spinner size={12} /></div>}>
                <AdminUsers />
              </React.Suspense>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Courses</h3>
            <p className="text-gray-600">Manage courses</p>
            <AdminCourseUploader />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

function AdminCourseUploader() {
  const [instructors, setInstructors] = useState([])
  const [search, setSearch] = useState("")
  const [selectedInstructor, setSelectedInstructor] = useState("")
  // Support multiple files
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  // Categories: dropdown + new category input
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await api.get(`/users?role=instructor&search=${encodeURIComponent(search)}`)
        setInstructors(res.data.data || [])
      } catch (err) {
        setInstructors([])
      }
    }
    fetchInstructors()
  }, [search])

  // Fetch categories from existing courses for the category dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/courses`)
        const cats = Array.from(new Set((res.data.data || []).map(c => c.category).filter(Boolean)))
        setCategories(cats)
      } catch (err) {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const handleUploadAndCreate = async () => {
    if ((!files || files.length === 0) || !title || !selectedInstructor) return alert("Title, instructor and at least one file are required")
    try {
      setLoading(true)
      const formData = new FormData()
      files.forEach(f => formData.append("files", f))
      const uploadRes = await api.post("/courses/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      const uploaded = uploadRes.data.data || []

      const categoryToUse = newCategory && newCategory.trim().length > 0 ? newCategory.trim() : selectedCategory

      // Create course referencing each uploaded PDF as document content
      const content = uploaded.map(u => ({ title: u.originalName || `${title} (PDF)`, type: "document", url: u.url }))

      const coursePayload = {
        title,
        shortDescription,
        description: shortDescription,
        category: categoryToUse,
        instructor: selectedInstructor,
        isPublished: true,
        content
      }

      await api.post("/courses", coursePayload)
      alert("Course created")
      setFiles([])
      setTitle("")
      setShortDescription("")
      setSelectedCategory("")
      setNewCategory("")
      setSelectedInstructor("")
      setSearch("")
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload/create course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="mb-2">
        <input className="w-full border rounded p-2" placeholder="Search instructors" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="mb-2">
        <select className="w-full border rounded p-2" value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}>
          <option value="">Select instructor</option>
          {instructors.map(i => (
            <option key={i._id} value={i._id}>{i.name} — {i.email}</option>
          ))}
        </select>
        {/* Search results: click to select instructor into dropdown (search input drives results) */}
        {search && instructors.length > 0 && (
          <div className="mt-2 bg-white border rounded shadow-sm p-2 max-h-40 overflow-auto">
            {instructors.map(i => (
              <div key={i._id} className="flex justify-between items-center py-1">
                <div className="text-sm">{i.name} — <span className="text-xs text-gray-500">{i.email}</span></div>
                <button onClick={() => { setSelectedInstructor(i._id); setSearch(i.name) }} className="text-blue-600 text-sm">Select</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mb-2">
        <input className="w-full border rounded p-2" placeholder="Course Title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <input className="w-full border rounded p-2" placeholder="Short description" value={shortDescription} onChange={e => setShortDescription(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select className="w-full border rounded p-2 mb-2" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">Select existing category</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input className="w-full border rounded p-2" placeholder="Or create a new category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm text-gray-600 mb-1">Upload PDF(s)</label>
        <input type="file" accept="application/pdf" multiple onChange={e => setFiles(Array.from(e.target.files))} />
        <p className="text-xs text-gray-500 mt-1">You can upload multiple PDF files; each will become a document in the course content.</p>
      </div>
      <div>
        <button onClick={handleUploadAndCreate} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">{loading ? 'Creating...' : 'Upload & Create Course (PDF)'} </button>
      </div>
    </div>
  )
}

export default AdminDashboard