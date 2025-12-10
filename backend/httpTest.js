const http = require('http');

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test() {
  try {
    console.log("=== TESTING HTTP ENDPOINTS ===\n");
    
    console.log("1. Testing /api/test endpoint...");
    const testRes = await makeRequest('GET', '/api/test', null);
    console.log("   Status:", testRes.statusCode);
    console.log("   Response:", testRes.body);
    console.log();
    
    console.log("2. Testing login with admin credentials...");
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@potatolearn.com',
      password: 'admin123'
    });
    console.log("   Status:", loginRes.statusCode);
    console.log("   Response:", loginRes.body);
    
    if (loginRes.statusCode !== 200) {
      console.log("   ❌ LOGIN FAILED!");
    } else {
      console.log("   ✅ LOGIN SUCCESSFUL!");
    }
    console.log();
    
    console.log("3. Testing login with wrong password...");
    const wrongRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@potatolearn.com',
      password: 'wrongpassword'
    });
    console.log("   Status:", wrongRes.statusCode);
    console.log("   Response:", wrongRes.body);
    console.log();
    
    console.log("4. Testing registration...");
    const regRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpass123',
      role: 'student'
    });
    console.log("   Status:", regRes.statusCode);
    console.log("   Response:", regRes.body);
    
    if (regRes.statusCode !== 201) {
      console.log("   ❌ REGISTRATION FAILED!");
    } else {
      console.log("   ✅ REGISTRATION SUCCESSFUL!");
      
      // Try to login with new user
      console.log("\n5. Testing login with new registered user...");
      const newLoginRes = await makeRequest('POST', '/api/auth/login', {
        email: 'testuser@example.com',
        password: 'testpass123'
      });
      console.log("   Status:", newLoginRes.statusCode);
      console.log("   Response:", newLoginRes.body);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
