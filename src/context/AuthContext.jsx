import React, { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" }
    }
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}