import React, { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in on initial load
    checkAuth()

    // Listen for app-level auth events dispatched by api
    const handleUnauthorized = () => {
      setUser(null)
      navigate("/login")
    }

    const handleDeactivated = (e) => {
      setUser(null)
      try { window.alert(e?.detail?.message || "Your account is deactivated") } catch (err) {}
      navigate("/login")
    }

    window.addEventListener("app:unauthorized", handleUnauthorized)
    window.addEventListener("app:deactivated", handleDeactivated)

    return () => {
      window.removeEventListener("app:unauthorized", handleUnauthorized)
      window.removeEventListener("app:deactivated", handleDeactivated)
    }
  }, [navigate])

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me")
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" }
    }
  }

  const logout = async () => {
    // Immediately clear user so UI updates synchronously
    setUser(null)
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    }
    // Always navigate to login after logout
    navigate("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}