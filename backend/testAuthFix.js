const http = require('http');

function makeRequest(method, path, data, includeAuthHeader = false, authToken = null) {
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

    // Add Authorization header if provided
    if (includeAuthHeader && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
          cookies: res.headers['set-cookie'] || []
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
    console.log("=== TESTING AUTH FIXES ===\n");
    
    console.log("1. Testing login endpoint...");
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@potatolearn.com',
      password: 'admin123'
    });
    
    console.log("   Status:", loginRes.statusCode);
    console.log("   Response:", loginRes.body);
    
    if (loginRes.statusCode === 200) {
      console.log("   ✅ LOGIN SUCCESSFUL!");
      
      // Check if token is in response
      const parsedResponse = JSON.parse(loginRes.body);
      if (parsedResponse.token) {
        console.log("   ✅ Token received in response body");
        
        // Check if Set-Cookie header is present
        if (loginRes.cookies.length > 0) {
          console.log("   ✅ Cookie set:", loginRes.cookies[0].split(';')[0].substring(0, 50) + "...");
        } else {
          console.log("   ⚠️  No cookie in response (might still work with token in header)");
        }
        
        console.log("\n2. Testing protected endpoint with token...");
        // Try with Authorization header
        const protectedRes = await makeRequest('GET', '/api/users', null, true, parsedResponse.token);
        console.log("   Status:", protectedRes.statusCode);
        console.log("   Response:", protectedRes.body.substring(0, 100) + "...");
        
        if (protectedRes.statusCode === 200) {
          console.log("   ✅ PROTECTED ENDPOINT ACCESSIBLE WITH TOKEN!");
        } else {
          console.log("   ❌ Protected endpoint still failing");
        }
      }
    } else {
      console.log("   ❌ LOGIN FAILED!");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
