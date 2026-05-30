const mongoose = require("mongoose")
const path = require("path")
const bcrypt = require("bcryptjs")
require("dotenv").config({ path: path.join(__dirname, ".env") })

const User = require("./models/User")

async function comprehensiveTest() {
  try {
    console.log("=== COMPREHENSIVE AUTHENTICATION TEST ===\n")
    
    console.log("1. Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/potato-learn-platform", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log("✅ Connected\n")
    
    // Test 1: Check existing admin user
    console.log("2. Checking for existing admin user...")
    const admin = await User.findOne({ email: "admin@potatolearn.com" })
    
    if (!admin) {
      console.log("❌ No admin user found. Creating one...")
      const newAdmin = await User.create({
        name: "Admin User",
        email: "admin@potatolearn.com",
        password: "admin123",
        role: "admin"
      })
      console.log("✅ Admin created\n")
      
      // Check what was stored
      const savedAdmin = await User.findOne({ email: "admin@potatolearn.com" })
      console.log("3. What's stored in database:")
      console.log("   Password hash:", savedAdmin.password.substring(0, 30) + "...")
      console.log("   Password starts with $2a:", savedAdmin.password.startsWith("$2a"))
      console.log()
      
      // Test password comparison
      console.log("4. Testing password comparison...")
      const match = await savedAdmin.comparePassword("admin123")
      console.log("   Password 'admin123' matches:", match)
      
      if (!match) {
        console.log("   ❌ PASSWORD MISMATCH!")
        console.log("   Testing with bcrypt directly...")
        const directMatch = await bcrypt.compare("admin123", savedAdmin.password)
        console.log("   Direct bcrypt.compare result:", directMatch)
      }
    } else {
      console.log("✅ Admin user exists\n")
      
      console.log("3. Admin user details:")
      console.log("   Email:", admin.email)
      console.log("   Role:", admin.role)
      console.log("   Password hash:", admin.password.substring(0, 30) + "...")
      console.log("   Password starts with $2a:", admin.password.startsWith("$2a"))
      console.log()
      
      console.log("4. Testing password comparison...")
      const match = await admin.comparePassword("admin123")
      console.log("   Password 'admin123' matches:", match)
      
      if (!match) {
        console.log("   ❌ PASSWORD MISMATCH!")
        console.log("   Testing with bcrypt directly...")
        const directMatch = await bcrypt.compare("admin123", admin.password)
        console.log("   Direct bcrypt.compare result:", directMatch)
        
        // Test if password is hashed twice
        console.log("\n   Checking if password is double-hashed...")
        const isDoubleHashed = admin.password.startsWith("$2a$10$$")
        console.log("   Looks like double hash:", isDoubleHashed)
      }
    }
    
    console.log("\n5. Testing registration flow...")
    try {
      const testUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "testpass123",
        role: "student"
      })
      console.log("✅ Test user created")
      
      const savedTest = await User.findOne({ email: "test@example.com" })
      const testMatch = await savedTest.comparePassword("testpass123")
      console.log("   Password 'testpass123' matches:", testMatch)
      
      if (!testMatch) {
        console.log("   ❌ TEST USER PASSWORD ALSO DOESN'T MATCH!")
      }
      
      // Clean up
      await User.deleteOne({ email: "test@example.com" })
    } catch (error) {
      console.log("❌ Error during registration test:", error.message)
    }
    
    console.log("\n=== TEST COMPLETE ===")
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("Fatal error:", error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

comprehensiveTest()
