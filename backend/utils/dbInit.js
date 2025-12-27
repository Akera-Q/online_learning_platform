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

      // Create a sample quiz for each created course that doesn't already have one
      for (const course of createdCourses) {
        try {
          const existing = await Quiz.findOne({ course: course._id })
          if (existing) continue

          console.log(`🧪 Creating sample quiz for course: ${course.title}`)

          // Use the same sample questions as the 'Introduction to Web Development' quiz for all test courses
          const sampleIntroQuestions = [
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
          ]

          const questions = sampleIntroQuestions

          await Quiz.create({
            title: `Quiz: ${course.title}`,
            course: course._id,
            questions,
            timeLimit: 10,
            passingScore: 50
          })

          console.log(`✅ Sample quiz created for course: ${course.title}`)
        } catch (err) {
          console.error(`❌ Failed to create sample quiz for course ${course.title}:`, err.message)
        }
      }
    }
    
    console.log("🎉 Database initialization complete!")

    // Ensure every course has a sample quiz for testing purposes (create one per course missing a quiz)
    try {
      const courses = await Course.find()
      if (courses.length > 0) {
        console.log(`🔎 Checking ${courses.length} courses for missing quizzes...`)
        let created = 0

        // Helper question sets
        const sampleIntroQuestions = [
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
        ]

        const nodeQuestions = [
          {
            questionText: "Which runtime is used to execute JavaScript on the server?",
            options: ["Deno", "Node.js", "Rhino", "SpiderMonkey"],
            correctAnswer: 1,
            points: 1
          },
          {
            questionText: "Which module is commonly used for creating HTTP servers in Node?",
            options: ["express", "http-server", "koa", "magix"],
            correctAnswer: 0,
            points: 1
          }
        ]

        const genericQuestion = [
          {
            questionText: "This is a sample question",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            points: 1
          }
        ]

        for (const course of courses) {
          try {
            const existing = await Quiz.findOne({ course: course._id })
            if (existing) continue

            // Choose questions consistent with the Introduction sample
            let questions = genericQuestion
            const titleLower = (course.title || '').toLowerCase()
            if (titleLower.includes('web') || titleLower.includes('react') || titleLower.includes('introduction')) {
              questions = sampleIntroQuestions
            } else if (titleLower.includes('node')) {
              questions = nodeQuestions
            }

            await Quiz.create({
              title: `Quiz: ${course.title}`,
              course: course._id,
              questions,
              timeLimit: 10,
              passingScore: 50,
              isSample: true
            })

            console.log(`✅ Sample quiz created for course: ${course.title}`)
            created++
          } catch (err) {
            console.error(`❌ Failed to create sample quiz for course ${course.title}:`, err.message)
          }
        }

        if (created === 0) console.log("ℹ️ All courses already have quizzes")
      }
    } catch (err) {
      console.error("Error checking/creating sample quizzes:", err.message)
    }
    
  } catch (error) {
    console.error("❌ Database initialization error:", error.message)
    console.error("Full error:", error)
  }
}

module.exports = initializeDatabase