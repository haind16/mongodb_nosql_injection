const { getDB } = require('../config/database');

class Comment {
    static getCollection() {
        return getDB().collection('comments');
    }

    // VULNERABLE: Không sanitize content
    static async create(username, content) {
        try {
            const collection = this.getCollection();
            
            // ⚠️ VULNERABLE CODE - Attack 4: Stored XSS
            // Lưu trực tiếp user input không sanitize
            const comment = {
                username: username,
                content: content,  // ❌ Có thể chứa XSS payload
                createdAt: new Date()
            };
            
            const result = await collection.insertOne(comment);
            return { ...comment, _id: result.insertedId };
        } catch (error) {
            console.error('Error in create comment:', error);
            return null;
        }
    }

    static async getAll() {
        try {
            const collection = this.getCollection();
            const comments = await collection.find({})
                .sort({ createdAt: -1 })
                .limit(50)
                .toArray();
            return comments;
        } catch (error) {
            console.error('Error in getAll comments:', error);
            return [];
        }
    }

    static async deleteAll() {
        try {
            const collection = this.getCollection();
            await collection.deleteMany({});
            return true;
        } catch (error) {
            console.error('Error in deleteAll comments:', error);
            return false;
        }
    }
}

module.exports = Comment;