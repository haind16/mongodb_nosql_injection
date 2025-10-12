# 🚀 QUICK START GUIDE - 5 PHÚT CHẠY DEMO

## ⚡ CÀI ĐẶT NHANH (5 bước)

### Bước 1️⃣: Kiểm tra MongoDB
```bash
# Mở Command Prompt, chạy:
mongod --version

# Nếu thấy version → OK
# Nếu lỗi → Cài MongoDB từ: https://www.mongodb.com/try/download/community
```

### Bước 2️⃣: Khởi động MongoDB
```bash
# Cách đơn giản nhất: Mở MongoDB Compass và click Connect
# Hoặc chạy mongod trong terminal
```

### Bước 3️⃣: Tạo project
```bash
# Tạo folder
mkdir mongodb-demo
cd mongodb-demo

# Tạo 4 files:
# - package.json
# - server.js  
# - setup-db.js
# - public/index.html

# Copy nội dung từ artifacts đã cung cấp
```

### Bước 4️⃣: Cài đặt và chạy
```bash
# Cài dependencies
npm install

# Setup database
npm run setup

# Chạy server
npm start
```

### Bước 5️⃣: Mở trình duyệt
```
http://localhost:3000
```

---

## 🎯 TEST NGAY 3 ATTACKS

### ⚡ Attack 1: Bypass Login (10 giây)
1. Vào form "Vulnerable Login"
2. Username: `{"$ne": null}`
3. Password: `{"$ne": null}`
4. Click Login
5. ✅ Đăng nhập thành công với quyền admin!

### ⚡ Attack 2: Dump Users (5 giây)
1. Vào form "Vulnerable Search"
2. Search: `.*`
3. Click Search
4. ✅ Hiển thị tất cả 5 users!

### ⚡ Attack 3: JS Injection (5 giây)
1. Vào form "Check Username"
2. Username: `'; return true; //`
3. Click Check
4. ✅ Bypass logic check!

---

## 🛡️ SO SÁNH: VULNERABLE vs SECURE

### Test Vulnerable
- Input: `{"$ne": null}`
- Kết quả: ✅ Bypass thành công

### Test Secure  
- Input: `{"$ne": null}`
- Kết quả: ❌ "Invalid input format"

---

## 📊 CÁC PAYLOADS CẦN NHỚ

### Authentication Bypass
```json
{"$ne": null}
{"$ne": ""}
{"$gt": ""}
{"$regex": ".*"}
```

### Regex Injection
```
.*          (match all)
^admin      (starts with admin)
^a          (starts with a)
```

### JavaScript Injection
```javascript
' || '1'=='1
'; return true; //
'; sleep(5000); return true; //
```

---

## ⚠️ PHÒNG CHỐNG TÓM TẮT

```javascript
// 1. Validate type
if (typeof input !== 'string') return error;

// 2. Check dangerous chars
if (/[\$\{\}]/.test(input)) return error;

// 3. Use $eq operator
db.find({ username: { $eq: input } })

// 4. NEVER use $where
// ❌ $where: `this.field == '${input}'`
// ✅ { field: { $eq: input } }
```

---

## 🎓 ĐIỂM QUAN TRỌNG CHO BÁO CÁO

### Lý thuyết cần trình bày:
1. ✅ MongoDB là gì? (NoSQL, document-oriented)
2. ✅ Kiến trúc: Database → Collection → Document
3. ✅ BSON vs JSON
4. ✅ Các operators: $ne, $gt, $regex, $where

### Điểm mạnh MongoDB:
1. ✅ Schema-less → Linh hoạt
2. ✅ Horizontal scaling → Sharding
3. ✅ High performance → Indexing
4. ✅ Rich query language → Aggregation

### Điểm yếu MongoDB:
1. ❌ NoSQL Injection vulnerability
2. ❌ Default config không bảo mật
3. ❌ Thiếu ACID (trước v4.0)
4. ❌ $where operator nguy hiểm

### Lỗ hổng được demo:
1. 🔴 Authentication Bypass
2. 🔴 Data Extraction (Regex)
3. 🔴 JavaScript Injection ($where)

### Phòng chống:
1. 🛡️ Input validation
2. 🛡️ Use $eq operator
3. 🛡️ Avoid $where
4. 🛡️ Enable authentication
5. 🛡️ Rate limiting

---

## 📸 SCREENSHOTS CHO BÁO CÁO

### Nên chụp:
1. ✅ MongoDB Compass hiển thị database structure
2. ✅ Vulnerable Login bypass thành công
3. ✅ Search results showing all users
4. ✅ Console logs showing attack queries
5. ✅ Secure Login blocking malicious input
6. ✅ Code comparison (vulnerable vs secure)

---

## 🎤 DEMO TRONG LỚP (5-10 phút)

### Outline presentation:

**1. Giới thiệu (1 phút)**
- MongoDB là gì?
- Tại sao cần bảo mật?

**2. Demo Attack (3 phút)**
- Live demo 3 attacks
- Giải thích kỹ thuật
- Hiển thị data leaked

**3. Phòng chống (2 phút)**
- Code comparison
- Best practices
- Test secure endpoint

**4. Q&A (2 phút)**
- Trả lời câu hỏi
- Discussion

### Script demo:
```
"Bây giờ em sẽ demo lỗ hổng NoSQL Injection..."

[Mở browser] "Đây là ứng dụng có lỗ hổng..."

[Attack 1] "Em sẽ đăng nhập mà không cần biết password..."
→ Nhập payload
→ "Như các bạn thấy, em đã bypass thành công!"

[Show code] "Nguyên nhân là code không validate input..."

[Attack 2] "Tiếp theo, em sẽ dump toàn bộ users..."
→ Demo search

[Protection] "Để phòng chống, chúng ta cần..."
→ Show secure code
→ Demo secure endpoint fail

"Vậy là em đã hoàn thành demo. Các bạn có câu hỏi gì không?"
```

---

## 🐛 TROUBLESHOOTING SIÊU NHANH

### MongoDB không chạy?
```bash
# Mở MongoDB Compass → Click Connect
# Hoặc: mongod
```

### npm install lỗi?
```bash
# Xóa node_modules và thử lại
rm -rf node_modules
npm install
```

### Port 3000 bị chiếm?
```javascript
// Đổi PORT trong server.js
const PORT = 3001;
```

### Payload không work?
```
- Check: Input có đúng format JSON?
- Check: MongoDB có chạy không?
- Check: Database đã setup chưa?
- Xem: Browser Console và Server Logs
```

---

## ✅ CHECKLIST TRƯỚC KHI DEMO

- [ ] MongoDB đã cài và đang chạy
- [ ] Node.js đã cài
- [ ] `npm install` thành công
- [ ] `npm run setup` chạy xong
- [ ] Server khởi động OK
- [ ] Browser mở được localhost:3000
- [ ] Test 1 attack để đảm bảo work
- [ ] MongoDB Compass mở được database
- [ ] Chuẩn bị script presentation
- [ ] Screenshots đã chụp sẵn (backup)

---

## 🎯 MỤC TIÊU HỌC TẬP

Sau khi hoàn thành demo này, bạn sẽ:

✅ Hiểu rõ MongoDB là gì  
✅ Biết điểm mạnh/yếu của MongoDB  
✅ Hiểu cách NoSQL Injection hoạt động  
✅ Biết cách khai thác 3 loại attacks  
✅ Nắm được best practices bảo mật  
✅ Có thể implement secure code  
✅ Tự tin present trong lớp  

---

## 📞 CẦN GIÚP?

**Lỗi kỹ thuật:**
1. Đọc error message cẩn thận
2. Google exact error message
3. Check MongoDB documentation

**Không hiểu lý thuyết:**
1. Đọc lại README.md chi tiết
2. Xem code comments
3. Test từng bước một

**Chuẩn bị báo cáo:**
1. Follow outline trong guide này
2. Chụp screenshots
3. Test demo trước khi present

---

## 🚀 BẮT ĐẦU NGAY!

```bash
# Chỉ cần 3 lệnh:
npm install
npm run setup
npm start

# Mở browser:
http://localhost:3000

# Start hacking! 🔥
```

**Good luck! 💪**