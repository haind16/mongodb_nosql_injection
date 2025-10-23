# NoSQL Injection Demo

Demo các lỗ hổng bảo mật NoSQL Injection với MongoDB

## Yêu cầu

- Node.js (v14 trở lên)
- MongoDB Community Server
- MongoDB Compass (GUI)

## Cài đặt

### 1. Cài đặt MongoDB trên Windows

1. Download MongoDB Community Server từ: https://www.mongodb.com/try/download/community
2. Cài đặt với các tùy chọn mặc định
3. MongoDB sẽ tự động chạy như Windows Service

### 2. Cài đặt MongoDB Compass

1. Download từ: https://www.mongodb.com/try/download/compass
2. Cài đặt và mở Compass
3. Connect với URI: `mongodb://localhost:27017`

### 3. Setup Project

```bash
# Clone hoặc tạo thư mục
mkdir nosql-injection-demo
cd nosql-injection-demo

# Copy tất cả files vào thư mục

# Cài đặt dependencies
npm install

# Chạy server
npm start
```

### 4. Khởi tạo Database

Server sẽ tự động tạo database và insert dữ liệu mẫu khi chạy lần đầu.

Hoặc bạn có thể dùng MongoDB Compass:
1. Tạo database mới tên: `nosql_demo`
2. Tạo collection: `users`
3. Insert documents thủ công (xem file `server/config/database.js`)

## Sử dụng

1. Chạy server: `npm start`
2. Mở trình duyệt: `http://localhost:3000`
3. Thử các kịch bản tấn công theo tài liệu

## Cấu trúc thư mục

```
nosql-injection-demo/
├── server/
│   ├── server.js          # Main server file
│   ├── config/
│   │   └── database.js    # Database connection & setup
│   ├── models/
│   │   ├── User.js        # User model
│   └── routes/
│       ├── auth.js        # Authentication routes (vulnerable)
│       └── api.js         # API routes (vulnerable)
└── public/
    ├── index.html         # Login page
    ├── dashboard.html     # Dashboard page
    ├── css/
    │   └── style.css      # Styles
    └── js/
        ├── login.js       # Login logic
        └── dashboard.js   # Dashboard logic
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: Đây là code VULNERABLE cho mục đích demo. KHÔNG sử dụng trong production!

## License

MIT