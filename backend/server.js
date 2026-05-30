const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const path = require("path")
const errorHandler = require("./middleware/errorMiddleware")

// Load environment variables - try multiple approaches
const result = dotenv.config()
if (result.error && !process.env.JWT_SECRET) {
  // If first attempt fails, try explicit path
  dotenv.config({ path: path.join(__dirname, ".env") })
}

// Verify critical environment variables
console.log("🔍 Checking environment variables...")
console.log("   JWT_SECRET exists:", !!process.env.JWT_SECRET)
console.log("   JWT_SECRET value (first 20 chars):", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 20) : "NOT SET")
console.log("   MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("   JWT_COOKIE_EXPIRE:", process.env.JWT_COOKIE_EXPIRE)

if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET is not set in .env file!")
  console.error("   Current working directory:", __dirname)
  console.error("   .env file path attempted:", path.join(__dirname, ".env"))
  process.exit(1)
}

const app = express()

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Allow both ports
  credentials: true // Allow cookies
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // Parse cookies

// Serve uploaded files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/potato-learn-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ MongoDB connected successfully")
  
  // Initialize database with sample data
  try {
    const initializeDatabase = require("./utils/dbInit")
    await initializeDatabase()
  } catch (initError) {
    console.error("Database initialization failed:", initError.message)
  }
})
.catch(err => console.error("❌ MongoDB connection error:", err))

// Routes

// Add this BEFORE other routes (WAS FORGOTTEN)
app.get("/api/test", (req, res) => {
  //for debugging
  console.log("DEBUG: /api/test endpoint called")
  res.json({ 
    success: true, 
    message: "Backend is working!",
    timestamp: new Date().toISOString()
  })
})
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/courses", require("./routes/courses"))
app.use("/api/quizzes", require("./routes/quizzes"))
app.use("/api/bookmarks", require("./routes/bookmarks"))
app.use("/api/ratings", require("./routes/ratings"))
app.use("/api/certificates", require("./routes/certificates"))
// Debug routes (admin only)
app.use("/api/debug", require("./routes/debug"))

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../dist/index.html"))
  })
}

// Error handling middleware (MUST be after all routes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})