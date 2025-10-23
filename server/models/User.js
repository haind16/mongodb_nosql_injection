const { getDB } = require('../config/database');

class User {
    static getCollection() {
        return getDB().collection('users');
    }

    // VULNERABLE: Không validate input type
    static async findByCredentials(username, password) {
        try {
            const collection = this.getCollection();
            
            // ⚠️ VULNERABLE CODE - Attack 1: Authentication Bypass
            // Chấp nhận bất kỳ type nào cho password (có thể là object)
            const user = await collection.findOne({ 
                username: username, 
                password: password  // ❌ Có thể là {"$ne": ""} hoặc object khác
            });
            
            return user;
        } catch (error) {
            console.error('Error in findByCredentials:', error);
            return null;
        }
    }

    // VULNERABLE: $where injection - Search accounts by balance
    static async filterByCondition(whereClause) {
        try {
            // Get accounts collection instead of users
            const db = require('../config/database').getDB();
            const collection = db.collection('accounts');

            // ⚠️ VULNERABLE CODE - Attack 3: $where Injection
            // Thực thi JavaScript code từ user để tìm accounts
            const accounts = await collection.find({
                $where: whereClause  // ❌ Execute arbitrary JavaScript
            })
            .limit(50)
            .toArray();

            return accounts;
        } catch (error) {
            console.error('Error in filterByCondition:', error);
            return [];
        }
    }

    static async getAll() {
        try {
            const collection = this.getCollection();
            const users = await collection.find({})
                .project({ password: 0 })
                .toArray();
            return users;
        } catch (error) {
            console.error('Error in getAll:', error);
            return [];
        }
    }
}

module.exports = User;