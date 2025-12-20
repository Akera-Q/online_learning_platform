const mongoose = require("mongoose")
const User = require("../models/User")
const Course = require("../models/Course")
const Quiz = require("../models/Quiz")
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
      // Create a sample quiz for the first created course if no quizzes exist
        const quizCount = await Quiz.countDocuments()
        if (quizCount === 0 && createdCourses.length > 0) {
          console.log("🧪 Creating sample quiz for the first course...")
          const sampleQuiz = {
            title: `Quiz: ${createdCourses[0].title}`,
            course: createdCourses[0]._id,
            questions: [
              {
                questionText: "What does HTML stand for?",
                options: ["HyperText Markup Language", "HighText Machine Language", "Hyperlinks and Text Markup", "Home Tool Markup Language"],
                correctAnswer: 0,
                points: 1
              },
              {
                questionText: "Which company developed React?",
                options: ["Google", "Facebook", "Microsoft", "Mozilla"],
                correctAnswer: 1,
                points: 1
              }
            ],
            timeLimit: 10,
            passingScore: 50
          }

          try {
            await Quiz.create(sampleQuiz)
            console.log("✅ Sample quiz created")
          } catch (err) {
            console.error("❌ Failed to create sample quiz:", err.message)
          }
        }
    }
    
    console.log("🎉 Database initialization complete!")

    // If there are courses but no quizzes, create a sample quiz for an existing course
    try {
      const quizCount2 = await Quiz.countDocuments()
      if (quizCount2 === 0) {
        const anyCourse = await Course.findOne()
        if (anyCourse) {
          console.log("🧪 No quizzes found — creating a sample quiz for an existing course...")
          try {
            await Quiz.create({
              title: `Quiz: ${anyCourse.title}`,
              course: anyCourse._id,
              questions: [
                {
                  questionText: "Which tag is used to include JavaScript in HTML?",
                  options: ["<script>", "<js>", "<javascript>", "<code>"],
                  correctAnswer: 0,
                  points: 1
                }
              ],
              timeLimit: 5,
              passingScore: 50
            })
            console.log("✅ Sample quiz created for existing course")
          } catch (err) {
            console.error("❌ Failed to create fallback sample quiz:", err.message)
          }
        }
      }
    } catch (err) {
      console.error("Error checking/creating fallback sample quiz:", err.message)
    }
    
  } catch (error) {
    console.error("❌ Database initialization error:", error.message)
    console.error("Full error:", error)
  }
}

module.exports = initializeDatabase