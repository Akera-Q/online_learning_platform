const http = require("http")

async function testAuthAPI() {
  console.log("Testing Auth API...\n")

  // Test 1: Login
  console.log("TEST 1: Login with admin@potatolearn.com / admin123")
  try {
    const response = await makeRequest("POST", "/api/auth/login", {
      email: "admin@potatolearn.com",
      password: "admin123"
    })
    console.log("Status:", response.status)
    console.log("Response:", JSON.stringify(response.body, null, 2))
  } catch (error) {
    console.log("Error:", error)
  }

  console.log("\n---\n")

  // Test 2: Register
  console.log("TEST 2: Register new user")
  try {
    const response = await makeRequest("POST", "/api/auth/register", {
      name: "Test User",
      email: "testuser@example.com",
      password: "testpass123"
    })
    console.log("Status:", response.status)
    console.log("Response:", JSON.stringify(response.body, null, 2))
  } catch (error) {
    console.log("Error:", error)
  }
}

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)

    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    }

    const req = http.request(options, (res) => {
      let responseData = ""

      res.on("data", (chunk) => {
        responseData += chunk
      })

      res.on("end", () => {
        try {
          const body = JSON.parse(responseData)
          resolve({ status: res.statusCode, body })
        } catch (e) {
          resolve({ status: res.statusCode, body: responseData })
        }
      })
    })

    req.on("error", reject)
    req.write(data)
    req.end()
  })
}

// Give server a moment to start
setTimeout(testAuthAPI, 500)
