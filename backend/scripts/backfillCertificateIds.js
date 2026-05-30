require('dotenv').config()
const mongoose = require('mongoose')
const Certificate = require('../models/Certificate')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/potato-learn-platform'

const genCertId = () => `CERT-${Date.now()}-${Math.random().toString(36).substr(2,8)}`

const main = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to DB')

    // Find certificates missing a certificateId or with null/empty values
    const missing = await Certificate.find({ $or: [ { certificateId: { $exists: false } }, { certificateId: null }, { certificateId: '' } ] })
    if (!missing.length) {
      console.log('No certificates require backfill')
      await mongoose.disconnect()
      process.exit(0)
    }

    console.log(`Found ${missing.length} certificates to backfill`)
    let updated = 0

    for (const cert of missing) {
      let newId = genCertId()
      // Guarantee uniqueness by checking existing certs (unlikely but safe)
      while (await Certificate.findOne({ certificateId: newId })) {
        newId = genCertId()
      }
      cert.certificateId = newId
      await cert.save()
      console.log(`Updated cert ${cert._id} -> ${newId}`)
      updated++
    }

    console.log(`Backfill complete: ${updated} certificates updated`)
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Backfill failed:', err)
    await mongoose.disconnect()
    process.exit(1)
  }
}

main()
