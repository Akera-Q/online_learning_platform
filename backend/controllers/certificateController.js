const Certificate = require('../models/Certificate')
const Quiz = require('../models/Quiz')
const Course = require('../models/Course')
const User = require('../models/User')
const path = require('path')
const fs = require('fs')

// Note: uploadCertificate endpoint removed from routes per UX decision to disallow manual uploads.
// The function is intentionally left here for reference, but the POST /upload route is no longer registered.
exports.uploadCertificate = async (req, res) => {
  return res.status(410).json({ success: false, message: 'Certificate upload is no longer supported' })
}

// GET /api/certificates?userId=<id>&all=true (admin usage) or default returns current user's certificates
exports.getUserCertificates = async (req, res) => {
  try {
    let filter = {}

    // Admin can query for a specific user or all
    if (req.user.role === 'admin' && req.query.userId) {
      filter.user = req.query.userId
    } else if (req.user.role === 'admin' && req.query.all === 'true') {
      // no filter
    } else {
      filter.user = req.user.id
    }

    const certs = await Certificate.find(filter).populate('course', 'title').populate('user', 'name email')

    const transformed = certs.map(c => ({
      _id: c._id,
      course: c.course,
      filename: c.filename,
      mimeType: c.mimeType,
      certificateId: c.certificateId || null,
      user: req.user.role === 'admin' ? (c.user ? { _id: c.user._id, name: c.user.name, email: c.user.email } : null) : undefined,
      createdAt: c.createdAt,
      downloadUrl: `/api/certificates/${c._id}/download`
    }))

    res.status(200).json({ success: true, count: transformed.length, data: transformed })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

exports.deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' })
    if (cert.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this certificate' })
    }

    // Delete file
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'certificates', cert.filename)
    try { fs.unlinkSync(filePath) } catch (e) {}

    await cert.deleteOne()
    res.status(200).json({ success: true, message: 'Certificate deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}