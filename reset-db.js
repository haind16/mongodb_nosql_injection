const { MongoClient } = require('mongodb');

async function resetDatabase() {
    const uri = 'mongodb://localhost:27017/nosql_demo';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('nosql_demo');

        // Drop existing collections
        try {
            await db.collection('accounts').deleteMany({});
            await db.collection('users').deleteMany({});
            await db.collection('comments').deleteMany({});
            console.log('Cleared existing data');
        } catch (err) {
            console.log('Collections may not exist yet');
        }

        // Insert sample users
        const sampleUsers = [
            {
                username: 'admin',
                password: 'admin123',
                email: 'admin@bank.com',
                role: 'admin',
                fullName: 'Bank Administrator',
                createdAt: new Date()
            },
            {
                username: 'john_doe',
                password: 'pass123',
                email: 'john.doe@email.com',
                role: 'customer',
                fullName: 'John Doe',
                createdAt: new Date()
            }
        ];

        await db.collection('users').insertMany(sampleUsers);
        console.log('Inserted users');

        // Insert sample accounts
        const sampleAccounts = [
            {
                accountNumber: '1234567890',
                accountHolder: 'John Doe',
                username: 'john_doe',
                balance: 125000.50,
                accountType: 'Savings',
                status: 'Active',
                ssn: '123-45-6789',
                phone: '+1-555-0101',
                address: '123 Main St, New York, NY 10001',
                createdAt: new Date('2020-01-15')
            },
            {
                accountNumber: '1234678901',
                accountHolder: 'Alice Smith',
                username: 'alice_smith',
                balance: 85000.75,
                accountType: 'Checking',
                status: 'Active',
                ssn: '234-56-7890',
                phone: '+1-555-0102',
                address: '456 Oak Ave, Boston, MA 02101',
                createdAt: new Date('2019-06-20')
            },
            {
                accountNumber: '1234789012',
                accountHolder: 'Bob Wilson',
                username: 'bob_wilson',
                balance: 250000.00,
                accountType: 'Premium Savings',
                status: 'Active',
                ssn: '345-67-8901',
                phone: '+1-555-0103',
                address: '789 Pine Rd, Chicago, IL 60601',
                createdAt: new Date('2018-03-10')
            },
            {
                accountNumber: '1234890123',
                accountHolder: 'Carol Brown',
                username: 'carol_brown',
                balance: 42000.25,
                accountType: 'Checking',
                status: 'Active',
                ssn: '456-78-9012',
                phone: '+1-555-0104',
                address: '321 Elm St, Seattle, WA 98101',
                createdAt: new Date('2021-11-05')
            },
            {
                accountNumber: '1235901234',
                accountHolder: 'David Lee',
                username: 'david_lee',
                balance: 15000.00,
                accountType: 'Student Checking',
                status: 'Frozen',
                ssn: '567-89-0123',
                phone: '+1-555-0105',
                address: '555 College Ave, Austin, TX 78701',
                createdAt: new Date('2022-08-01')
            }
        ];

        await db.collection('accounts').insertMany(sampleAccounts);
        console.log('Inserted 5 accounts');

        console.log('\nDatabase reset successfully!');
        console.log('\nAccounts:');
        sampleAccounts.forEach(acc => {
            console.log(`  • ${acc.accountNumber} - ${acc.accountHolder} ($${acc.balance})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

resetDatabase();

