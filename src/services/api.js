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
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

//Another version without interceptors, use if needed.

// export default api

// import axios from "axios"

// const api = axios.create({
//   baseURL: "/api",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// export default api