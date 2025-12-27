import React, { useState, useEffect } from "react"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import Spinner from "../components/Spinner/Spinner"
import { formatDate } from "../utils/helpers"
import CertificatesList from "../components/Certificates/CertificatesList"

const ProfilePage = () => {
  const { user, loading, checkAuth } = useAuth()
  const [formData, setFormData] = useState({
    name: ""
  })

  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || ""
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
    // Validate
    if (!formData.name || formData.name.trim().length === 0) return alert('Full name is required')

    const updateProfile = async () => {
      try {
        const targetId = user._id || user.id
        if (!targetId) throw new Error('User id not available')
        const res = await api.put(`/users/${targetId}`, { name: formData.name.trim() })
        // Refresh auth data
        await checkAuth()
        alert("Profile updated")
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Failed to update profile")
        console.error(err)
      }
    }

    updateProfile()
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()

    if (passwordForm.password !== passwordForm.confirmPassword) return alert("New passwords do not match")
    if (passwordForm.password.length < 6) return alert("New password must be at least 6 characters")

    const changePassword = async () => {
      try {
        const res = await api.put(`/users/${user._id || user.id}`, { password: passwordForm.password, confirmPassword: passwordForm.confirmPassword })
        setPasswordForm({ password: '', confirmPassword: '' })
        alert('Password updated successfully')
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to update password')
      }
    }

    changePassword()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center"><Spinner size={14} /></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-semibold">{formData.name || user.name}</h2>
                <p className="text-sm text-gray-500 capitalize mt-1">Role: {user.role}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Full name</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full border rounded p-2" 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Profile</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <div className="text-sm text-gray-700 mb-3"><strong>Email:</strong> {user.email}</div>
            <div className="text-sm text-gray-700 mb-3"><strong>Member since:</strong> {formatDate(user.createdAt)}</div>

            <h4 className="text-md font-semibold mt-4 mb-2">Change Password</h4>
            <form onSubmit={handlePasswordChange} className="space-y-3">

              <div>
                <label className="block text-gray-700">New password</label>
                <input type="password" value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700">Confirm new password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Change password</button>
              </div>
            </form>
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Certificates</h3>
          <CertificatesList user={user} />
        </div>
      </main>
      <Footer />
    </div>
  )
}


export default ProfilePage