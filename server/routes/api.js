const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Load Account model
let Account;
try {
    Account = require('../models/Account');
} catch (err) {
    console.warn('  Account model not found, some features may not work');
}

// VULNERABLE: Regex Injection - Banking App Scenario
router.get('/search-account', async (req, res) => {
    try {
        if (!Account) {
            return res.status(500).json({
                success: false,
                message: 'Account model not available'
            });
        }

        const { accountNumber } = req.query;
        
        console.log('Account search request:', accountNumber);
        
        // ⚠️ VULNERABLE: User input trực tiếp làm regex
        // Simulating: Bank employee searching for account
        const accounts = await Account.searchByAccountNumber(accountNumber);
        
        console.log(`   Found ${accounts.length} accounts`);
        
        // Build vulnerability warning
        let warning = '';
        if (accountNumber === '.*') {
            warning = 'CRITICAL: Extracted ALL account numbers!';
        } else if (accountNumber.startsWith('^')) {
            warning = 'WARNING: Pattern matching can enumerate accounts!';
        }
        
        res.json({
            success: true,
            query: accountNumber,
            count: accounts.length,
            accounts: accounts,
            vulnerability: 'Regex Injection - Account enumeration vulnerability',
            warning: warning,
            exploitation: {
                info: 'Attacker can enumerate valid account numbers',
                examples: [
                    '.*          → Extract ALL accounts',
                    '^1234.*     → Accounts starting with 1234',
                    '^.{10}$     → All 10-digit accounts',
                    '^1234567.*  → Progressive enumeration'
                ]
            }
        });
    } catch (error) {
        console.error('Account search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search error',
            error: error.message
        });
    }
});

// VULNERABLE: $where Injection - Account balance search
router.post('/filter', async (req, res) => {
    try {
        const { condition } = req.body;

        console.log('Filter request:', condition);

        // ⚠️ VULNERABLE: Thực thi JavaScript từ user để tìm accounts
        const accounts = await User.filterByCondition(condition);

        console.log(`   Matched ${accounts.length} accounts`);

        res.json({
            success: true,
            condition: condition,
            count: accounts.length,
            accounts: accounts,
            vulnerability: '$where injection - JavaScript execution on accounts'
        });
    } catch (error) {
        console.error('❌ Filter error:', error);
        res.status(500).json({
            success: false,
            message: 'Filter error',
            error: error.message
        });
    }
});

// Get all users (for testing)
router.get('/users', async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get all accounts (for testing)
router.get('/accounts', async (req, res) => {
    try {
        if (!Account) {
            return res.status(500).json({
                success: false,
                message: 'Account model not available'
            });
        }

        const accounts = await Account.getAll();
        res.json({
            success: true,
            count: accounts.length,
            accounts: accounts
        });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching accounts',
            error: error.message
        });
    }
});

module.exports = router;