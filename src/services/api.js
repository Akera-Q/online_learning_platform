import axios from "axios"

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || ""

    if (status === 401) {
      // Do not treat the public /auth/me probe as a fatal app-level unauthorized event.
      // When the app first loads, unauthenticated guests will get 401 from /auth/me which is expected.
      const reqUrl = error.config?.url || ""
      if (reqUrl.includes("/auth/me")) {
        return Promise.reject(error)
      }

      // Only treat token-related 401s as a global unauthorized event. For example, password validation
      // failures ("Current password is incorrect") should not force a logout.
      const lowerMsg = message.toLowerCase()
      const looksLikeTokenIssue = lowerMsg.includes("token") || lowerMsg.includes("expired") || lowerMsg.includes("not authorized") || lowerMsg.includes("invalid token")
      if (looksLikeTokenIssue) {
        try { window.dispatchEvent(new CustomEvent("app:unauthorized")) } catch (e) {}
      }

      return Promise.reject(error)
    }

    // If account is deactivated, show message and force redirect via event
    if (status === 403 && message.toLowerCase().includes("deactivated")) {
      try { window.dispatchEvent(new CustomEvent("app:deactivated", { detail: { message } })) } catch (e) {}
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api