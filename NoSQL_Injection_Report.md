BÁO CÁO KỸ THUẬT: NOSQL INJECTION VULNERABILITIES

═══════════════════════════════════════════════════════════════

1. TỔNG QUAN VỀ NOSQL INJECTION

NoSQL Injection là kỹ thuật tấn công bảo mật nhắm vào cơ sở dữ liệu NoSQL (MongoDB, CouchDB) thông qua việc chèn code độc hại vào query.

Điểm khác biệt với SQL Injection:
• SQL: Chèn cú pháp SQL (' OR '1'='1)
• NoSQL: Chèn object/operator JSON ({"$ne": null})
• NoSQL cho phép query bằng JavaScript → Nguy hiểm hơn

Tác động:
• Bypass authentication
• Truy cập trái phép dữ liệu
• Thực thi code tùy ý (RCE)
• Tiết lộ thông tin nhạy cảm

═══════════════════════════════════════════════════════════════

2. ATTACK 1: AUTHENTICATION BYPASS

A. Cơ chế tấn công

Code lỗ hổng (auth.js):
-----------------------------------------
const user = await User.findByCredentials(username, password);
// password có thể là object {"$ne": ""} thay vì string
-----------------------------------------

Payload tấn công:
Username: admin
Password: {"$ne": ""}

MongoDB query sinh ra:
db.users.findOne({
  username: "admin",
  password: { $ne: "" }
})

B. Kịch bản thực tế

Bước 1: Attacker gửi request POST /auth/login
Bước 2: Server thực thi query → Tìm user có username="admin" VÀ password ≠ null
Bước 3: Login thành công mà KHÔNG CẦN biết password

C. Nguy hiểm
• Bypass hoàn toàn xác thực
• Truy cập tài khoản admin
• Không cần biết password
• Khó phát hiện qua log thường

═══════════════════════════════════════════════════════════════

3. ATTACK 2: REGEX INJECTION - BANKING CASE STUDY

A. Lỗ hổng thực tế (2021)

Dashboard code (dashboard.js):
const response = await fetch(`/api/search-account?accountNumber=${regexPattern}`);

Backend vulnerable code:
router.get('/search-account', async (req, res) => {
  const { accountNumber } = req.query;
  const accounts = await Account.find({
    accountNumber: new RegExp(accountNumber)  // VULNERABLE
  });
});

B. Kỹ thuật tấn công

Payload 1: Extract ALL accounts
Input: .*
Query: accountNumber: /.*/ 
Kết quả: Trả về TẤT CẢ tài khoản

Payload 2: Brute-force từng ký tự
Input: ^1.*    → Tìm bắt đầu bằng 1
Input: ^12.*   → Tìm bắt đầu bằng 12
Input: ^123.*  → Tìm bắt đầu bằng 123

Payload 3: Pattern matching
Input: ^123[4-9].*
→ Tìm tài khoản 1234xxx đến 1239xxx

C. Case Study 2021

Một ngân hàng bị tấn công:
• Attacker sử dụng regex injection
• Dò được 50,000+ số tài khoản
• Kết hợp với thông tin rò rỉ → Chiếm tài khoản
• Thiệt hại: $2.3 triệu USD

D. Demo thực tế - Quick Payload từ giao diện:
1. ".*" → Lấy tất cả
2. "^1234.*" → Prefix attack
3. "^.{10}$" → Tài khoản 10 số
4. "^123[4-8].*" → Range attack

═══════════════════════════════════════════════════════════════

4. ATTACK 3: $WHERE JAVASCRIPT INJECTION

A. Lỗ hổng nghiêm trọng nhất

Code vulnerable (dashboard.js):
const whereClause = `this.accountHolder == '${searchInput}'`;
fetch('/api/filter', {
  method: 'POST',
  body: JSON.stringify({ condition: whereClause })
});

Backend code:
router.post('/filter', async (req, res) => {
  const { condition } = req.body;
  const results = await Account.find({
    $where: condition  // THỰC THI JAVASCRIPT
  });
});

B. Các payload nguy hiểm

Payload 1: Bypass đơn giản
Input: ' || '1'=='1
Query: this.accountHolder == '' || '1'=='1'
Kết quả: TRUE → Trả về TẤT CẢ

Payload 2: Function bypass
Input: ' || (function(){ return true; })() || '
Kết quả: Thực thi function JS tùy ý

Payload 3: Conditional extraction
Input: ' || this.balance > 100000 || '
Kết quả: Chỉ lấy tài khoản có balance > 100K

Payload 4: Remote Code Execution (RCE)
Input: '; var cmd = require('child_process'); cmd.exec('rm -rf /'); return true; //
Kết quả: XÓA HỆ THỐNG

C. Tại sao nguy hiểm nhất?
1. Thực thi JavaScript trực tiếp trên server
2. Có thể require() module Node.js
3. Truy cập file system, network
4. Chiếm quyền điều khiển server
5. Khó phát hiện và ngăn chặn

D. Impact thực tế
• 2019: MongoDB Atlas bị tấn công qua $where
• 2020: 3 startup bị RCE, mất toàn bộ database
• 2022: Ransomware tấn công qua lỗ hổng này

═══════════════════════════════════════════════════════════════

5. BIỆN PHÁP PHÒNG CHỐNG

A. Nguyên tắc chung
1. KHÔNG BAO GIỜ tin tưởng user input
2. Validate type và giá trị
3. Sử dụng parameterized queries
4. Tắt $where operator
5. Áp dụng principle of least privilege

B. Code an toàn

FIX 1: Authentication (auth.js)
// TRƯỚC (Vulnerable)
const user = await User.findByCredentials(username, password);

// SAU (Secure)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input type' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username format' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ success: true, user });
});

FIX 2: Regex Injection
// TRƯỚC (Vulnerable)
const accounts = await Account.find({
  accountNumber: new RegExp(accountNumber)
});

// SAU (Secure)
router.get('/search-account', async (req, res) => {
  const { accountNumber } = req.query;
  if (!/^[0-9]{10}$/.test(accountNumber)) {
    return res.status(400).json({ error: 'Invalid account format' });
  }
  const account = await Account.findOne({
    accountNumber: accountNumber
  });
  res.json({ success: true, account });
});

FIX 3: $where Injection (QUAN TRỌNG NHẤT)
// TRƯỚC (Vulnerable)
const results = await Account.find({ $where: condition });

// SAU (Secure)
router.post('/filter', async (req, res) => {
  const { accountHolder } = req.body;
  if (typeof accountHolder !== 'string') {
    return res.status(400).json({ error: 'Invalid type' });
  }
  if (!/^[a-zA-Z\s]{1,50}$/.test(accountHolder)) {
    return res.status(400).json({ error: 'Invalid format' });
  }
  const results = await Account.find({
    accountHolder: accountHolder
  });
  res.json({ success: true, results });
});

C. Cấu hình MongoDB an toàn

mongodb.conf:
security:
  javascriptEnabled: false
setParameter:
  enableLocalhostAuthBypass: false
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

D. Middleware bảo vệ

const sanitize = require('express-mongo-sanitize');
app.use(sanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} in ${req.path}`);
  }
}));

E. Monitoring & Detection

const suspiciousPatterns = [
  /\$ne/i, /\$gt/i, /\$lt/i, /\$regex/i, /\$where/i,
  /function\s*\(/i, /return/i, /require\(/i
];

app.use((req, res, next) => {
  const input = JSON.stringify(req.body);
  for (let pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      console.error('ATTACK DETECTED:', {
        ip: req.ip,
        path: req.path,
        body: req.body,
        timestamp: new Date()
      });
      return res.status(403).json({ error: 'Malicious input detected' });
    }
  }
  next();
});

═══════════════════════════════════════════════════════════════

6. KẾT LUẬN VÀ KHUYẾN NGHỊ

A. Tóm tắt mức độ nguy hiểm

| Attack Type              | Mức độ  | Khả năng RCE | Phổ biến |
|--------------------------|---------|--------------|----------|
| Authentication Bypass    | Cao     | Không        | ★★★★★    |
| Regex Injection          | Cao     | Không        | ★★★★☆    |
| $where Injection         | RẤT CAO | CÓ           | ★★★☆☆    |

B. Checklist bảo mật

□ Validate TẤT CẢ input từ user
□ Kiểm tra type (string, number, boolean)
□ Whitelist format cho phép
□ KHÔNG dùng $where operator
□ KHÔNG dùng RegExp với user input
□ Sử dụng parameterized queries
□ Sanitize input với express-mongo-sanitize
□ Giới hạn quyền MongoDB user
□ Tắt javascriptEnabled trong MongoDB
□ Implement rate limiting
□ Logging và monitoring
□ Regular security audit

C. Khuyến nghị triển khai

NGAY LẬP TỨC:
1. Audit toàn bộ code tìm User.find() với user input
2. Thêm type validation cho TẤT CẢ input
3. Tắt $where operator trong MongoDB config
4. Deploy express-mongo-sanitize middleware

TRONG 1 TUẦN:
5. Implement whitelist validation
6. Setup monitoring và alerting
7. Code review tất cả API endpoints
8. Penetration testing

DÀI HẠN:
9. Security training cho dev team
10. Thiết lập secure coding guidelines
11. Automated security scanning trong CI/CD
12. Bug bounty program

D. Kết luận

NoSQL Injection là lỗ hổng NGHIÊM TRỌNG nhưng dễ phòng tránh nếu:
• Validate input đúng cách
• Không tin tưởng user data
• Sử dụng queries an toàn
• Monitoring liên tục

Đặc biệt: TUYỆT ĐỐI KHÔNG dùng $where với user input!

═══════════════════════════════════════════════════════════════

Tài liệu tham khảo:
- OWASP NoSQL Injection Guide
- MongoDB Security Checklist
- CWE-943: Improper Neutralization of Special Elements

Phiên bản: 1.0
Ngày: 23/10/2025
