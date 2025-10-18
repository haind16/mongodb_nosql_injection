const express = require('express');
const router = express.Router();
const User = require('../models/User');

// VULNERABLE: Authentication Bypass
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('🔐 Login attempt:', { username, password: typeof password });
        
        // ⚠️ VULNERABLE: Không validate type của password
        // Password có thể là object như {"$ne": ""}
        const user = await User.findByCredentials(username, password);
        
        if (user) {
            console.log('✅ Login successful:', user.username);
            
            // Trả về thông tin user (trong thực tế nên dùng JWT)
            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                vulnerability: typeof password === 'object' ? 'Authentication Bypass detected!' : null
            });
        } else {
            console.log('❌ Login failed: Invalid credentials');
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;