const mongoose = require("mongoose")
const User = require("../models/User")
const Course = require("../models/Course")
const bcrypt = require("bcryptjs")

const initializeDatabase = async () => {
  try {
    console.log("🔄 Initializing database...")
    
    // Check if database is empty
    const userCount = await User.countDocuments()
    const courseCount = await Course.countDocuments()
    
    console.log(`📊 Database has ${userCount} users and ${courseCount} courses`)
    
    // Create default admin user if no users exist
    if (userCount === 0) {
      console.log("👤 Creating default admin user...")
      
      // Create user with plain password - the pre-save hook will hash it
      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@potatolearn.com",
        password: "admin123", // Plain password - will be hashed by pre-save hook
        role: "admin",
        profilePicture: ""
      })
      
      console.log("✅ Default admin user created:")
      console.log("   📧 Email: admin@potatolearn.com")
      console.log("   🔑 Password: admin123")
      console.log("   👑 Role: admin")
    }
    
    // Create sample courses if none exist //WAS A MAJOR ISSUE, NEEDED TO BE FOCUSED ON
    if (courseCount === 0) {
      console.log("📚 Creating sample courses...")
      
      const admin = await User.findOne({ email: "admin@potatolearn.com" })
      
      if (!admin) {
        console.log("❌ No admin user found to assign courses to")
        return
      }
      
      const sampleCourses = [
        {
          title: "Introduction to Web Development",
          description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their coding journey.",
          shortDescription: "Learn HTML, CSS, and JavaScript basics",
          instructor: admin._id,
          category: "Web Development",
          thumbnail: "",
          content: [
            { title: "HTML Basics", type: "text", order: 1 },
            { title: "CSS Styling", type: "text", order: 2 },
            { title: "JavaScript Fundamentals", type: "text", order: 3 }
          ],
          isPublished: true
        },
        {
          title: "React.js Crash Course",
          description: "Master React fundamentals and build modern web applications. Learn components, state management, and hooks.",
          shortDescription: "Master React fundamentals",
          instructor: admin._id,
          category: "Web Development",
          thumbnail: "",
          content: [
            { title: "React Components", type: "text", order: 1 },
            { title: "State and Props", type: "text", order: 2 },
            { title: "React Hooks", type: "text", order: 3 }
          ],
          isPublished: true
        },
        {
          title: "Node.js Backend Development",
          description: "Build server-side applications with Node.js and Express. Learn REST APIs, authentication, and database integration.",
          shortDescription: "Build server-side applications",
          instructor: admin._id,
          category: "Backend Development",
          thumbnail: "",
          content: [
            { title: "Node.js Basics", type: "text", order: 1 },
            { title: "Express Framework", type: "text", order: 2 },
            { title: "MongoDB Integration", type: "text", order: 3 }
          ],
          isPublished: true
        }
      ]
      
      await Course.insertMany(sampleCourses)
      console.log(`✅ Created ${sampleCourses.length} sample courses`)
      
      // Update admin user with created courses
      const createdCourses = await Course.find({ instructor: admin._id })
      admin.enrolledCourses = createdCourses.map(course => course._id)
      await admin.save()
    }
    
    console.log("🎉 Database initialization complete!")
    
  } catch (error) {
    console.error("❌ Database initialization error:", error.message)
    console.error("Full error:", error)
  }
}

module.exports = initializeDatabase