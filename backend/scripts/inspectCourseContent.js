require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('../models/Course')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/potato-learn-platform'

const main = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const courses = await Course.find().lean()
    if (!courses || courses.length === 0) {
      process.stdout.write('No courses found\n')
      process.exit(0)
    }
    for (const course of courses) {
      process.stdout.write(`Course: ${course._id.toString()} - ${course.title}\n`)
      process.stdout.write('Content:\n')
      ;(course.content || []).forEach((c, i) => {
        process.stdout.write(`  ${i+1} - ${c.title} | type: ${c.type} | url: ${c.url}\n`)
      })
      process.stdout.write('\n')
    }
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
