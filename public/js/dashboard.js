// API Configuration
const API_URL = 'http://localhost:3000';

// Check Authentication on Page Load
window.addEventListener('DOMContentLoaded', () => {
    const userStr = sessionStorage.getItem('currentUser');
    
    if (!userStr) {
        alert('Please login first!');
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userStr);
    document.getElementById('currentUser').textContent = user.username;
    
    // Load comments for XSS tab
    loadComments();
});

// Quick Attack Helper Function
function quickAttack(pattern) {
    document.getElementById('regexInput').value = pattern;
    document.getElementById('regexForm').dispatchEvent(new Event('submit'));
}

// ═══════════════════════════════════════════════════════════════
// ATTACK 2: BANKING REGEX INJECTION
// ═══════════════════════════════════════════════════════════════

document.getElementById('regexForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const regexPattern = document.getElementById('regexInput').value;
    const resultBox = document.getElementById('regexResult');

    try {
        const response = await fetch(`${API_URL}/api/search-account?accountNumber=${encodeURIComponent(regexPattern)}`);
        const data = await response.json();

        if (response.ok && data.success) {
            resultBox.className = 'result-box show';

            resultBox.innerHTML = `
                <strong>Found ${data.count} account(s)</strong>
            `;

        } else {
            throw new Error(data.message || 'Search failed');
        }

    } catch (error) {
        console.error('Error:', error);
        resultBox.className = 'result-box show error';
        resultBox.innerHTML = `
            <strong>Error: ${error.message}</strong>
            <div class="result-content">Check server connection</div>
        `;
    }
});

// ═══════════════════════════════════════════════════════════════
// ATTACK 3: $WHERE INJECTION
// ═══════════════════════════════════════════════════════════════

document.getElementById('whereForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const searchInput = document.getElementById('whereInput').value;
    const resultBox = document.getElementById('whereResult');

    // Build $where clause: this.accountHolder == 'INPUT'
    // If input contains injection chars like ', it will break the query
    const whereClause = `this.accountHolder == '${searchInput}'`;

    try {
        const response = await fetch(`${API_URL}/api/filter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ condition: whereClause })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            resultBox.className = 'result-box show';

            let accountsList = 'No accounts matched';
            if (data.accounts && data.accounts.length > 0) {
                accountsList = data.accounts.map((acc, index) =>
                    `${index + 1}. ${acc.accountHolder} - ${acc.accountNumber} ($${acc.balance.toLocaleString('en-US', {minimumFractionDigits: 2})})`
                ).join('\n');
            }

            resultBox.innerHTML = `
                <strong>Matched ${data.count} account(s)</strong>
                <div class="result-content">${accountsList}</div>
            `;

        } else {
            throw new Error(data.message || 'Filter failed');
        }

    } catch (error) {
        console.error('Error:', error);
        resultBox.className = 'result-box show error';
        resultBox.innerHTML = `
            <strong>Error: ${error.message}</strong>
            <div class="result-content">Check server connection</div>
        `;
    }
});

// Quick attack function for $where injection
function quickWhereAttack(payload) {
    document.getElementById('whereInput').value = payload;
    // Trigger form submit
    const form = document.getElementById('whereForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

// Initialize quick attack buttons
document.addEventListener('DOMContentLoaded', function() {
    const quickButtons = document.querySelectorAll('[data-payload]');
    quickButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const payload = this.getAttribute('data-payload');
            quickWhereAttack(payload);
        });
    });
});

// ═══════════════════════════════════════════════════════════════
// ATTACK 4: STORED XSS
// ═══════════════════════════════════════════════════════════════

document.getElementById('xssForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const comment = document.getElementById('xssInput').value;
    const resultBox = document.getElementById('xssResult');
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    
    try {
        const response = await fetch(`${API_URL}/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: user.username, 
                content: comment 
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            resultBox.className = 'result-box show';
            resultBox.innerHTML = `
                <strong>Comment Saved!</strong>
            `;

            // Reload comments to trigger XSS
            setTimeout(() => {
                loadComments();
            }, 800);


        } else {
            throw new Error(data.message || 'Failed to save comment');
        }

    } catch (error) {
        console.error('Error:', error);
        resultBox.className = 'result-box show error';
        resultBox.innerHTML = `
            <strong>Error: ${error.message}</strong>
            <div class="result-content">Check server connection</div>
        `;
    }
});

// Load Comments (VULNERABLE - XSS will execute here)
async function loadComments() {
    const display = document.getElementById('commentsDisplay');

    try {
        display.innerHTML = '<div class="loading">Loading comments...</div>';

        const response = await fetch(`${API_URL}/api/comments`);
        const data = await response.json();

        if (response.ok && data.success) {
            if (data.comments.length === 0) {
                display.innerHTML = '<div class="empty-state">No comments yet</div>';
                return;
            }

            // ⚠️ VULNERABLE: Direct innerHTML without sanitization
            let html = '';
            data.comments.forEach(c => {
                html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span>${escapeHtml(c.username)}</span>
                        <span class="comment-time">${new Date(c.createdAt).toLocaleString('en-US')}</span>
                    </div>
                    <div class="comment-content">
                        ${c.content}
                    </div>
                </div>`;
            });

            display.innerHTML = html;

        } else {
            throw new Error(data.message || 'Failed to load comments');
        }

    } catch (error) {
        console.error('Error:', error);
        display.innerHTML = `<div class="empty-state">Error: ${error.message}</div>`;
    }
}

// Clear All Comments
async function clearComments() {
    if (!confirm('Delete all comments?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/comments`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Comments deleted');
            loadComments();
        } else {
            throw new Error(data.message || 'Failed to delete comments');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

// Helper: Escape HTML (only for username, NOT for comment content)
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Logout Function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}