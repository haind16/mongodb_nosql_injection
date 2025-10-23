// API Configuration
const API_URL = 'http://localhost:3000';

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const resultBox = document.getElementById('loginResult');
    const loginBtn = document.getElementById('loginBtn');
    
    // Disable button during processing
    loginBtn.disabled = true;
    loginBtn.textContent = 'Processing...';
    
    try {
        // Parse password - can be string or JSON object
        let password = passwordInput;
        let username = usernameInput;
        
        // Check if input is JSON object (NoSQL injection attempt)
        try { 
            username = JSON.parse(username); 
        } catch(e) {}
        try { 
            password = JSON.parse(password); 
        } catch(e) {}
        
        
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

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const btn = document.querySelector('.toggle-password');
    const eye = btn.querySelector('.icon-eye');
    const eyeSlash = btn.querySelector('.icon-eye-slash');

    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';

    eye.classList.toggle('hidden', !show);       
    eyeSlash.classList.toggle('hidden', show);   

    btn.setAttribute('aria-pressed', String(show));
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
}
