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

// 2. VULNERABLE SEARCH
app.post('/api/search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    // Kiểm tra input rỗng
    if (!searchTerm || !searchTerm.trim()) {
      return res.json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    console.log('\n[VULNERABLE] Search query:', searchTerm);

    let query;
    if (searchTerm.includes('this.') || searchTerm.includes("\'") || searchTerm.includes(';')) {
      // LỖ HỔNG CỰC KỲ NGUY HIỂM: $where với JavaScript injection
      console.log('[DETECTED] JavaScript injection attempt!');
      query = {
        $where: `this.username == '${searchTerm}'`
      };
    } else {
      // LỖ HỔNG: Regex injection
      console.log('[DETECTED] Regex pattern:', searchTerm);
      query = {
        username: { $regex: searchTerm }
      };
    }

    const users = await db.collection('users').find(query).toArray();

    const results = users.map(u => ({
      username: u.username,
      email: u.email,
      role: u.role,
      salary: u.salary, // Thêm salary để demo JS injection
      department: u.department
    }));

    // Nếu không có kết quả, trả về success: false
    if (results.length === 0) {
      return res.json({
        success: false,
        message: `Không tìm thấy kết quả phù hợp với từ khóa "${searchTerm}"`
      });
    }

    res.json({
      success: true,
      message: `Tìm thấy ${results.length} kết quả cho "${searchTerm}"`,
      results: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm: ' + error.message
    });
  }
});

// ==========================================
// SECURE ENDPOINTS (ĐÃ ĐƯỢC BẢO VỆ)
// ==========================================

// Helper Functions
function validateSearchInput(input) {
  // Validate data type first
  if (typeof input !== 'string') {
    return {
      success: false,
      message: 'Input phải là chuỗi'
    };
  }

  // Trim input and check if empty
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return {
      success: false,
      message: 'Vui lòng nhập từ khóa tìm kiếm hợp lệ'
    };
  }

  // Validate length after trimming
  if (trimmedInput.length < 2 || trimmedInput.length > 50) {
    return {
      success: false,
      message: 'Độ dài tìm kiếm phải từ 2-50 ký tự'
    };
  }

  // Validate characters - Extended security checks
  const jsOperators = /\|\||&&/;  // Match || and && operators
  const jsFunction = /function\s*\([^)]*\)/i;  // Match function declarations
  const jsFunctionArrow = /=>/;  // Match arrow functions
  const jsKeywords = /\b(return|true|false)\b/i;  // Match JavaScript keywords
  const sqlOperators = /\s+(OR|AND|UNION|SELECT|WHERE|UPDATE|DELETE)\s+/i;
  const mongoOperators = /\$[a-zA-Z]+/;  // MongoDB operators start with $
  const dangerousChars = /[\$\{\}<>\\\/]/;  // Removed | from dangerous chars
  
  // Check JavaScript operators (|| and &&)
  if (jsOperators.test(input)) {
    return {
      success: false,
      message: 'Phát hiện toán tử logic JavaScript không hợp lệ trong input'
    };
  }

  // Check function declarations
  if (jsFunction.test(input) || jsFunctionArrow.test(input)) {
    return {
      success: false,
      message: 'Phát hiện khai báo hàm JavaScript không hợp lệ trong input'
    };
  }

  // Check JavaScript keywords
  if (jsKeywords.test(input)) {
    return {
      success: false,
      message: 'Phát hiện từ khóa JavaScript không hợp lệ trong input'
    };
  }

  // Check dangerous characters
  if (dangerousChars.test(input)) {
    return {
      success: false,
      message: 'Input chứa ký tự đặc biệt không được phép'
    };
  }

  // Check SQL operators
  if (sqlOperators.test(input)) {
    return {
      success: false,
      message: 'Phát hiện toán tử SQL không hợp lệ trong input'
    };
  }

  // Check MongoDB operators
  if (mongoOperators.test(input)) {
    return {
      success: false,
      message: 'Phát hiện toán tử MongoDB không hợp lệ trong input'
    };
  }

  // Check for complex JavaScript injection patterns
  const normalizedInput = input.toLowerCase().replace(/\s+/g, '');
  const suspiciousPatterns = [
    'function', 'return', 'eval', 'exec', 
    'constructor', 'prototype', '__proto__',
    'setinterval', 'settimeout', 'promise',
    'async', 'await', 'window', 'document',
    'global', 'process', 'require'
  ];

  if (suspiciousPatterns.some(pattern => normalizedInput.includes(pattern))) {
    return {
      success: false,
      message: 'Phát hiện mẫu JavaScript không hợp lệ trong input'
    };
  }

  return {
    success: true
  };
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// SECURE SEARCH ENDPOINT
app.post('/api/secure/search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    console.log('\n[SECURE] Search attempt:', searchTerm);

    // 1. Input Validation
    const validationResult = validateSearchInput(searchTerm);
    if (!validationResult.success) {
      return res.json(validationResult);
    }

    // 2. Escape Regex Special Characters
    const escapedTerm = escapeRegex(searchTerm);
    
    // 3. Dùng $regex an toàn với case-insensitive
    const users = await db.collection('users').find({
      $or: [
        { username: { $regex: escapedTerm, $options: 'i' } },
        { email: { $regex: escapedTerm, $options: 'i' } },
        { department: { $regex: escapedTerm, $options: 'i' } }
      ]
    }).toArray();

    // 4. Chỉ trả về thông tin cần thiết
    const safeResults = users.map(user => ({
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department
    }));

    // Nếu không có kết quả, trả về success: false
    if (safeResults.length === 0) {
      return res.json({
        success: false,
        message: `Không tìm thấy kết quả phù hợp với từ khóa "${searchTerm}"`
      });
    }

    // Nếu có kết quả, trả về success: true và danh sách kết quả
    return res.json({
      success: true,
      message: `Tìm thấy ${safeResults.length} kết quả cho "${searchTerm}"`,
      users: safeResults
    });
  } catch (error) {
    console.error('[SECURE] Search error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

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