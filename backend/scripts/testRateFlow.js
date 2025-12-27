const axios = require('axios')

const API = 'http://localhost:5000/api'

const run = async () => {
  try {
    const email = `ratetest+${Date.now()}@example.com`
    console.log('Registering test student', email)
    const reg = await axios.post(`${API}/auth/register`, { name: 'Rate Test', email, password: 'password123', role: 'student' })
    console.log('Register response:', reg.data)
    const token = reg.data.token

    // Fetch courses
    const coursesRes = await axios.get(`${API}/courses`)
    const courses = coursesRes.data.data || []
    if (!courses.length) {
      console.error('No courses available to test')
      return
    }

    const course = courses[0]
    console.log('Enrolling into course:', course.title)

    await axios.post(`${API}/courses/${course._id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Enrolled')

    // Submit rating 5
    console.log('Submitting rating 5')
    const rateRes = await axios.post(`${API}/courses/${course._id}/rate`, { rating: 5 }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Rate response:', rateRes.data)

    // Update rating to 3
    console.log('Updating rating to 3')
    const rateRes2 = await axios.post(`${API}/courses/${course._id}/rate`, { rating: 3 }, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Update response:', rateRes2.data)

    // Fetch course to verify
    const courseRes = await axios.get(`${API}/courses/${course._id}`, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Course rating details:', courseRes.data.data.rating, 'userRating:', courseRes.data.userRating)

    console.log('Test completed successfully')
  } catch (err) {
    console.error('Test error:', err.response?.data || err.message)
  }
}

run()
