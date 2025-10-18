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
            // Check if input is a regex payload (contains regex special chars)
            const isRegexPayload = /[\.\*\^\$\[\]\(\)\{\}\|\\]/.test(searchTerm);

            let query;
            if (isRegexPayload) {
                // If regex payload detected, use regex matching (vulnerable)
                query = { accountNumber: { $regex: searchTerm, $options: 'i' } };
            } else {
                // If plain number, use exact match (safe)
                query = { accountNumber: searchTerm };
            }

            const accounts = await collection.find(query)
                .limit(50)
                .toArray();

            return accounts;
        } catch (error) {
            console.error('Error in searchByAccountNumber:', error);
            return [];
        }
    }

    // Get account by exact number (for display after login)
    static async getByAccountNumber(accountNumber) {
        try {
            const collection = this.getCollection();
            const account = await collection.findOne({ 
                accountNumber: accountNumber 
            });
            return account;
        } catch (error) {
            console.error('Error in getByAccountNumber:', error);
            return null;
        }
    }

    // Get account by username
    static async getByUsername(username) {
        try {
            const collection = this.getCollection();
            const account = await collection.findOne({ 
                username: username 
            });
            return account;
        } catch (error) {
            console.error('Error in getByUsername:', error);
            return null;
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