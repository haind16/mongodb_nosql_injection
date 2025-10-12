const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database và Collection names
const dbName = 'vulnerable_app';
const collectionName = 'users';

async function setupDatabase() {
  try {
    await client.connect();
    console.log('✓ Đã kết nối MongoDB thành công');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Xóa dữ liệu cũ nếu có
    await collection.deleteMany({});
    console.log('✓ Đã xóa dữ liệu cũ');

    // Tạo dữ liệu mẫu
    const users = [
      {
        username: 'admin',
        password: 'Admin@123',
        email: 'admin@company.com',
        role: 'admin',
        salary: 150000,
        department: 'Management',
        ssn: '123-45-6789',
        createdAt: new Date()
      },
      {
        username: 'john_doe',
        password: 'John123!',
        email: 'john@company.com',
        role: 'user',
        salary: 75000,
        department: 'IT',
        ssn: '234-56-7890',
        createdAt: new Date()
      },
      {
        username: 'jane_smith',
        password: 'Jane@456',
        email: 'jane@company.com',
        role: 'user',
        salary: 80000,
        department: 'HR',
        ssn: '345-67-8901',
        createdAt: new Date()
      },
      {
        username: 'bob_wilson',
        password: 'Bob#789',
        email: 'bob@company.com',
        role: 'manager',
        salary: 95000,
        department: 'Sales',
        ssn: '456-78-9012',
        createdAt: new Date()
      },
      {
        username: 'alice_brown',
        password: 'Alice$321',
        email: 'alice@company.com',
        role: 'user',
        salary: 70000,
        department: 'Marketing',
        ssn: '567-89-0123',
        createdAt: new Date()
      }
    ];

    await collection.insertMany(users);
    console.log(`✓ Đã thêm ${users.length} users vào database`);

    // Tạo collection cho logs
    const logsCollection = db.collection('access_logs');
    await logsCollection.deleteMany({});
    await logsCollection.insertOne({
      timestamp: new Date(),
      message: 'Database initialized',
      type: 'system'
    });
    console.log('✓ Đã tạo collection logs');

    console.log('\n========================================');
    console.log('DATABASE SETUP HOÀN TẤT!');
    console.log('========================================');
    console.log('\nThông tin đăng nhập hợp lệ:');
    users.forEach(user => {
      console.log(`- Username: ${user.username}, Password: ${user.password}`);
    });
    console.log('\nDatabase: ' + dbName);
    console.log('Collection: ' + collectionName);
    console.log('MongoDB URI: ' + url);
    console.log('\nBạn có thể kiểm tra trong MongoDB Compass!');
    console.log('========================================\n');

  } catch (error) {
    console.error('Lỗi khi setup database:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();