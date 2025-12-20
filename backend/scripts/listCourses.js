require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('../models/Course')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/potato-learn-platform'

const main = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const courses = await Course.find().limit(5)
    console.log('Courses:')
    courses.forEach(c => console.log(c._id.toString(), '-', c.title))
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
