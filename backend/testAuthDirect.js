const mongoose = require("mongoose")
const path = require("path")
const bcrypt = require("bcryptjs")
require("dotenv").config({ path: path.join(__dirname, ".env") })

const User = require("./models/User")

async function testAuth() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/potato-learn-platform", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log("Finding admin user...")
    const admin = await User.findOne({ email: "admin@potatolearn.com" })
    
    if (!admin) {
      console.log("Admin not found!")
      return
    }
    
    console.log("Admin user found:")
    console.log("  Email:", admin.email)
    console.log("  Role:", admin.role)
    console.log("  Password hash:", admin.password.substring(0, 20) + "...")
    
    console.log("\nTesting password comparison...")
    const match = await admin.comparePassword("admin123")
    console.log("Password match result:", match)
    
    if (match) {
      console.log("✅ Auth works!")
    } else {
      console.log("❌ Password doesn't match")
      console.log("\nTrying to manually verify...")
      const manualMatch = await bcrypt.compare("admin123", admin.password)
      console.log("Manual comparison result:", manualMatch)
    }
    
    await mongoose.connection.close()
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

testAuth()

//this worked just fine, the problem must be in the server auth route