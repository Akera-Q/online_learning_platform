import React, { useState, useEffect } from "react"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import { useAuth } from "../context/AuthContext"

const ProfilePage = () => {
  const { user, loading, checkAuth } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Only allow updating name (email updates disallowed)
    if (!formData.name || formData.name.trim().length === 0) return

    const updateProfile = async () => {
      try {
        await fetch(`/api/users/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: formData.name.trim() })
        })
        // Refresh auth data
        await checkAuth()
        alert("Profile updated")
      } catch (err) {
        alert("Failed to update profile")
        console.error(err)
      }
    }

    updateProfile()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Please log in to view your profile</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">Role: {user.role}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input 
                type="text" 
                name="name"
                className="w-full border rounded p-2" 
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input 
                type="email" 
                name="email"
                className="w-full border rounded p-2 bg-gray-50" 
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed from your profile.</p>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Profile</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage