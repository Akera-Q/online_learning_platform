require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('../models/Course')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/potato-learn-platform'

// Extract original filename from upload URL like "/uploads/<unique>-<originalname>"
function extractOriginalNameFromUrl(url) {
  if (!url) return null
  const parts = url.split('/')
  const last = parts[parts.length - 1]
  // split on first dash after timestamp/unique
  const dashIndex = last.indexOf('-')
  const filename = dashIndex >= 0 ? last.slice(dashIndex + 1) : last
  // Replace underscores with spaces and decode common URL encodings
  return decodeURIComponent(filename.replace(/_/g, ' '))
}

const main = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')

    const courses = await Course.find().lean()
    if (!courses || courses.length === 0) {
      console.log('No courses found')
      process.exit(0)
    }

    let totalChanged = 0
    for (const course of courses) {
      let changed = 0
      const content = course.content || []
      for (let i = 0; i < content.length; i++) {
        const item = content[i]
        if (item.type === 'document' && item.url) {
          const original = extractOriginalNameFromUrl(item.url)
          if (original) {
            // current title fallback pattern: "<course title> (PDF)" or similar
            const fallback = `${course.title} (PDF)`
            // If current title is missing or equals fallback / generic pattern, update it
            const titleIsFallback = !item.title || item.title.trim() === '' || item.title === fallback || item.title === `${course.title}` || /\(PDF\)$/i.test(item.title)

            // Also update if multiple documents of a course share identical fallback title
            if (titleIsFallback || (content.filter(c => c.type === 'document' && c.title === item.title).length > 1)) {
              const newTitle = original
              // Prepare update operation
              const updatePath = `content.${i}.title`
              // Update via direct update to avoid re-loading model
              await Course.updateOne({ _id: course._id }, { $set: { [updatePath]: newTitle } })
              console.log(`Updated course ${course._id} - content[${i}]: '${item.title || '<empty>'}' -> '${newTitle}'`)
              changed++
              totalChanged++
            }
          }
        }
      }
      if (changed === 0) {
        // nothing changed for this course
      }
    }

    console.log(`Repair complete. Total content titles updated: ${totalChanged}`)
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Repair script error:', err)
    process.exit(1)
  }
}

main()
