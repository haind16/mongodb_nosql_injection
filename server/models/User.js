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

    // VULNERABLE: Regex injection
    static async searchByUsername(searchTerm) {
        try {
            const collection = this.getCollection();
            
            // ⚠️ VULNERABLE CODE - Attack 2: Regex Injection
            // User input trực tiếp làm regex pattern
            const users = await collection.find({ 
                username: { $regex: searchTerm }  // ❌ Không escape special chars
            })
            .project({ password: 0 })  // Ẩn password (nhưng vẫn có email và role)
            .limit(50)
            .toArray();
            
            return users;
        } catch (error) {
            console.error('Error in searchByUsername:', error);
            return [];
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

    static async findById(userId) {
        try {
            const collection = this.getCollection();
            const { ObjectId } = require('mongodb');
            
            const user = await collection.findOne({ 
                _id: new ObjectId(userId) 
            }, {
                projection: { password: 0 }
            });
            
            return user;
        } catch (error) {
            console.error('Error in findById:', error);
            return null;
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