const mongoose = require("mongoose")
const path = require("path")

// Load .env file from backend directory
require("dotenv").config({ path: path.join(__dirname, ".env") })

async function clearDatabase() {
  try {
    console.log("🔗 Connecting to MongoDB...")
    console.log("Connection string:", process.env.MONGODB_URI || "mongodb://localhost:27017/potato-learn-platform")
    
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/potato-learn-platform", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    
    console.log("🗑️  Clearing database...")
    
    // Drop all collections except system collections
    const collections = await mongoose.connection.db.collections()
    
    for (let collection of collections) {
      const collectionName = collection.collectionName
      // Skip system collections
      if (!collectionName.startsWith('system.')) {
        await collection.drop()
        console.log(`✅ Dropped: ${collectionName}`)
      }
    }
    
    console.log("🎉 Database cleared successfully!")
    console.log("Restart backend with: npm run dev")
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

clearDatabase()