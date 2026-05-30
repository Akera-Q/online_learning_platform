const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

const API = 'http://localhost:5000/api'

async function run() {
  try {
    const email = `certtest+${Date.now()}@example.com`
    console.log('Registering test student', email)
    const reg = await axios.post(`${API}/auth/register`, { name: 'Cert Test', email, password: 'password123', role: 'student' })
    const token = reg.data.token

    const coursesRes = await axios.get(`${API}/courses`)
    const course = coursesRes.data.data[0]
    if (!course) { console.error('No courses'); return }

    console.log('Enrolling into:', course.title)
    await axios.post(`${API}/courses/${course._id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } })

    // Get a quiz for the course
    const quizzesRes = await axios.get(`${API}/quizzes/course/${course._id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!quizzesRes.data.data || quizzesRes.data.data.length === 0) { console.error('No quizzes'); return }
    const quiz = quizzesRes.data.data[0]
    console.log('Found quiz:', quiz.title)

    // Build answers to pass (choose correct answers)
    const answers = quiz.questions.map((q, idx) => ({ questionIndex: idx, answerIndex: q.correctAnswer }))

    const submitRes = await axios.post(`${API}/quizzes/${quiz._id}/submit`, { answers }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Submit response:', submitRes.data.data)
    if (!submitRes.data.data.passed) { console.error('Did not pass; abort'); return }

    // Create tiny PNG file (1x1 white) base64
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
    const buffer = Buffer.from(pngBase64, 'base64')
    const tmpPath = path.join(__dirname, 'tmp-cert.png')
    fs.writeFileSync(tmpPath, buffer)

    const form = new FormData()
    form.append('certificate', fs.createReadStream(tmpPath))
    form.append('quizId', quiz._id)

    console.log('Uploading certificate...')
    const uploadRes = await axios.post(`${API}/certificates/upload`, form, { headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() } })
    console.log('Upload response:', uploadRes.data)

    // Clean up tmp file
    fs.unlinkSync(tmpPath)

    console.log('Done')
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message)
  }
}

run()
