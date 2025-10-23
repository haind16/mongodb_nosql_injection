const { getDB } = require('../config/database');

class Account {
    static getCollection() {
        return getDB().collection('accounts');
    }

    // VULNERABLE: Regex injection for account search
    static async searchByAccountNumber(searchTerm) {
        try {
            const collection = this.getCollection();

            // ⚠️ VULNERABLE CODE - Attack 2: Regex Injection (Banking Scenario)

            const query = {
                accountNumber: { $regex: `^(?:${searchTerm})$`, $options: 'i' }
            };

            const accounts = await collection.find(query)
                .limit(50)
                .toArray();

            return accounts;
        } catch (error) {
            console.error('Error in searchByAccountNumber:', error);
            return [];
        }
    }

    static async getAll() {
        try {
            const collection = this.getCollection();
            const accounts = await collection.find({})
                .toArray();
            return accounts;
        } catch (error) {
            console.error('Error in getAll:', error);
            return [];
        }
    }
}

module.exports = Account;