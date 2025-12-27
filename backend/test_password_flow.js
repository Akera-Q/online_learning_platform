const axios = require('axios')

const run = async () => {
  try {
    const email = `pwtest+${Date.now()}@example.com`
    console.log('Registering user', email)
    const reg = await axios.post('http://localhost:5000/api/auth/register', { name: 'PW Test', email, password: 'initial123' })
    console.log('Register response:', reg.data)
    const token = reg.data.token
    const userId = reg.data.user.id

    // Attempt wrong current password
    try {
      const wrong = await axios.put(`http://localhost:5000/api/users/${userId}`, { currentPassword: 'wrongpass', password: 'newpassword123' }, { headers: { Authorization: `Bearer ${token}` } })
      console.log('Wrong current password response (should NOT succeed):', wrong.status, wrong.data)
    } catch (err) {
      console.log('Wrong current password failed as expected:', err.response?.status, err.response?.data)
    }

    // Attempt correct current password
    try {
      const ok = await axios.put(`http://localhost:5000/api/users/${userId}`, { currentPassword: 'initial123', password: 'newpassword123' }, { headers: { Authorization: `Bearer ${token}` } })
      console.log('Correct current password response:', ok.status, ok.data)
    } catch (err) {
      console.error('Correct current password attempt failed unexpectedly:', err.response?.status, err.response?.data)
      return
    }

    // Try login with new password
    try {
      const login = await axios.post('http://localhost:5000/api/auth/login', { email, password: 'newpassword123' })
      console.log('Login with new password succeeded:', login.status, login.data)
    } catch (err) {
      console.error('Login with new password failed:', err.response?.status, err.response?.data)
    }

  } catch (error) {
    console.error('Test script error:', error.response?.data || error.message)
  }
}

run()
