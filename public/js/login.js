// API Configuration
const API_URL = 'http://localhost:3000';

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const resultBox = document.getElementById('loginResult');
    const loginBtn = document.getElementById('loginBtn');
    
    // Disable button during processing
    loginBtn.disabled = true;
    loginBtn.textContent = 'Processing...';
    
    try {
        // Parse password - can be string or JSON object
        let password = passwordInput;
        let isNoSQLInjection = false;
        
        // Check if input is JSON object (NoSQL injection attempt)
        if (passwordInput.startsWith('{')) {
            try {
                password = JSON.parse(passwordInput);
                isNoSQLInjection = true;
                console.log('🔓 NoSQL injection payload detected:', password);
            } catch (err) {
                console.log('❌ Invalid JSON format, treating as plain string');
                // Keep as string if JSON parse fails
            }
        }
        
        console.log('🔐 Login attempt:', {
            username: username,
            passwordType: typeof password,
            isInjection: isNoSQLInjection
        });
        
        // Send login request
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username, 
                password: password 
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Login successful
            resultBox.className = 'result-box show';

            resultBox.innerHTML = `
                <strong>Login successful</strong>
                <div class="result-content">Redirecting to dashboard...</div>
            `;

            // Store user info in sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            // Login failed
            resultBox.className = 'result-box show error';
            resultBox.innerHTML = `
                <strong>Login failed</strong>
                <div class="result-content">${data.message || 'Invalid username or password'}</div>
            `;

            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login to Banking System';
        }
        
    } catch (error) {
        console.error('Error:', error);

        resultBox.className = 'result-box show error';
        resultBox.innerHTML = `
            <strong>Connection error</strong>
            <div class="result-content">Cannot connect to server</div>
        `;

        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login to Banking System';
    }
});

// Quick fill payloads (helper function for testing)
function fillPayload(payload) {
    document.getElementById('password').value = payload;
}

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('═══════════════════════════════════════');
    console.log('🏦 Banking Security Demo - Login Page');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('💡 Test NoSQL Injection Payloads:');
    console.log('   1. {"$ne": ""}           - Not equal to empty');
    console.log('   2. {"$gt": ""}           - Greater than empty');
    console.log('   3. {"$exists": true}     - Field exists');
    console.log('   4. {"$regex": ".*"}      - Match anything');
    console.log('');
    console.log('🔐 Valid Credentials:');
    console.log('   • admin / admin123');
    console.log('   • john_doe / pass123');
    console.log('');
    console.log('═══════════════════════════════════════');
});