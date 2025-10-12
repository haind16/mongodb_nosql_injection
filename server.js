const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB connection
const url = 'mongodb://localhost:27017';
const dbName = 'vulnerable_app';
let db;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to MongoDB
MongoClient.connect(url)
  .then(client => {
    console.log('✓ Kết nối MongoDB thành công');
    db = client.db(dbName);
  })
  .catch(err => {
    console.error('✗ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });

// ==========================================
// VULNERABLE ENDPOINTS (CÓ LỖ HỔNG)
// ==========================================

// 1. VULNERABLE LOGIN - NoSQL Injection
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('\n[VULNERABLE] Login attempt:');
    console.log('Username:', JSON.stringify(username));
    console.log('Password:', JSON.stringify(password));

    // LỖ HỔNG: Không validate input, cho phép MongoDB operators
    const user = await db.collection('users').findOne({
      username: username,
      password: password
    });

    console.log('Query result:', user ? 'User found' : 'No user found');

    if (user) {
      // Log access
      await db.collection('access_logs').insertOne({
        timestamp: new Date(),
        username: user.username,
        action: 'login',
        success: true
      });

      res.json({
        success: true,
        message: 'Login thành công!',
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          salary: user.salary,
          ssn: user.ssn
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Username hoặc password không đúng!'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// 2. VULNERABLE SEARCH - Regex Injection
app.post('/api/search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    console.log('\n[VULNERABLE] Search query:', searchTerm);

    // LỖ HỔNG: Regex injection
    const users = await db.collection('users').find({
      username: { $regex: searchTerm }
    }).toArray();

    res.json({
      success: true,
      results: users.map(u => ({
        username: u.username,
        email: u.email,
        role: u.role
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm: ' + error.message
    });
  }
});

// 3. VULNERABLE WHERE CLAUSE
app.post('/api/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    console.log('\n[VULNERABLE] Check username:', username);

    // LỖ HỔNG CỰC KỲ NGUY HIỂM: $where với JavaScript injection
    const user = await db.collection('users').findOne({
      $where: `this.username == '${username}'`
    });

    res.json({
      exists: !!user,
      message: user ? 'Username đã tồn tại' : 'Username khả dụng'
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra: ' + error.message
    });
  }
});

// ==========================================
// SECURE ENDPOINTS (ĐÃ ĐƯỢC BẢO VỆ)
// ==========================================

// Helper function to validate input
function validateInput(input) {
  if (typeof input !== 'string') {
    return false;
  }
  // Không cho phép các ký tự đặc biệt của MongoDB
  const dangerous = /[\$\{\}]/;
  return !dangerous.test(input);
}

// SECURE LOGIN
app.post('/api/secure-login', async (req, res) => {
  try {
    let { username, password } = req.body;

    console.log('\n[SECURE] Login attempt:');
    console.log('Username:', username);
    console.log('Password type:', typeof password);

    // PHÒNG CHỐNG 1: Validate kiểu dữ liệu
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.json({
        success: false,
        message: 'Invalid input format'
      });
    }

    // PHÒNG CHỐNG 2: Validate nội dung
    if (!validateInput(username) || !validateInput(password)) {
      return res.json({
        success: false,
        message: 'Invalid characters detected'
      });
    }

    // PHÒNG CHỐNG 3: Sử dụng parameterized query
    const user = await db.collection('users').findOne({
      username: { $eq: username },
      password: { $eq: password }
    });

    if (user) {
      res.json({
        success: true,
        message: 'Login thành công!',
        user: {
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Username hoặc password không đúng!'
      });
    }
  } catch (error) {
    console.error('Secure login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Get all users (for demo purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json({
      success: true,
      users: users.map(u => ({
        username: u.username,
        role: u.role,
        email: u.email
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get access logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.collection('access_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 SERVER ĐANG CHẠY');
  console.log('========================================');
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`MongoDB: ${url}/${dbName}`);
  console.log('\nEndpoints có lỗ hổng:');
  console.log('- POST /api/login (NoSQL Injection)');
  console.log('- POST /api/search (Regex Injection)');
  console.log('- POST /api/check-username (JS Injection)');
  console.log('\nEndpoints bảo mật:');
  console.log('- POST /api/secure-login');
  console.log('========================================\n');
});