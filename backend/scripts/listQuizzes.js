require('dotenv').config()
const mongoose = require('mongoose')
const Quiz = require('../models/Quiz')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/potato-learn-platform'

const main = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const count = await Quiz.countDocuments()
    console.log('Quiz count:', count)
    const q = await Quiz.findOne().populate('course', 'title')
    console.log('Sample quiz:', q)
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
