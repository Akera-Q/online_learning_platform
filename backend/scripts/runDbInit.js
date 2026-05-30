require('dotenv').config()
const mongoose = require('mongoose')
const path = require('path')
const initializeDatabase = require(path.join(__dirname, '..', 'utils', 'dbInit'))

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/potato-learn-platform'

const main = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected to MongoDB for DB init')
    await initializeDatabase()
    console.log('DB init completed, disconnecting...')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('DB init script error:', err)
    process.exit(1)
  }
}

main()
