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

// Logout Function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}