const mongoose = require("mongoose")

console.log("Testing MongoDB connection with different methods...")

const testConnections = async () => {
  const tests = [
    { name: "IPv4 Localhost", uri: "mongodb://127.0.0.1:27017/potato-learn-platform" },
    { name: "IPv6 Localhost", uri: "mongodb://[::1]:27017/potato-learn-platform" },
    { name: "Localhost", uri: "mongodb://localhost:27017/potato-learn-platform" },
    { name: "No Database", uri: "mongodb://127.0.0.1:27017" }
  ]

  for (const test of tests) {
    console.log(`\n📡 Testing: ${test.name}`)
    console.log(`URI: ${test.uri}`)
    
    try {
      await mongoose.connect(test.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 3000
      })
      
      console.log("✅ CONNECTED!")
      
      // Try a simple query
      const db = mongoose.connection.db
      const collections = await db.listCollections().toArray()
      console.log(`Collections found: ${collections.length}`)
      
      await mongoose.connection.close()
      return test.uri // Return successful URI
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`)
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
      }
    }
  }
  
  return null
}

testConnections().then(successfulUri => {
  if (successfulUri) {
    console.log(`\n🎉 Successful connection URI: ${successfulUri}`)
    console.log("Update your .env file with this URI!")
  } else {
    console.log("\n❌ All connection attempts failed.")
    console.log("MongoDB might be running on a different port.")
  }
})