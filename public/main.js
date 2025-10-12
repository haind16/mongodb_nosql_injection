// Helper function to display results, success messages or errors
function displayResults(elementId, results, message = null, isError = false) {
    const container = document.getElementById(elementId);
    
    if (message) {
        container.innerHTML = `
            <div class="${isError ? 'error' : 'success'}">
                <strong>${isError ? '❌ Lỗi:' : '✅ Thông báo:'}</strong> ${message}
            </div>
        `;
        if (!results || !results.length) {
            return;
        }
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                ${results[0].salary ? '<th>Salary</th>' : ''}
            </tr>
        </thead>
        <tbody>
            ${results.map(user => `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${user.department || '-'}</td>
                    ${user.salary ? `<td>$${user.salary.toLocaleString()}</td>` : ''}
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

// Handle secure search form submission
document.getElementById('secureSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const searchInput = document.getElementById('secureSearchTerm');
    let searchTerm = searchInput.value;

    try {
        const response = await fetch('/api/secure/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerm })
        });
        const data = await response.json();
        
        if (!data.success) {
            displayResults('secureSearchResult', [], data.message, true);
            searchInput.focus();
            return;
        }
        
        displayResults('secureSearchResult', data.users, data.message);
    } catch (error) {
        displayResults('secureSearchResult', [], 'Có lỗi xảy ra khi tìm kiếm');
        console.error('Secure search error:', error);
    }
});

// Handle vulnerable search form submission 
document.getElementById('vulnerableSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const searchInput = document.getElementById('vulnerableSearchTerm');
    let searchTerm = searchInput.value;

    try {
        const response = await fetch('/api/vulnerable/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerm })
        });
        const data = await response.json();
        
        if (!data.success) {
            displayResults('vulnerableSearchResult', [], data.message, true);
            searchInput.focus();
            return;
        }
        
        displayResults('vulnerableSearchResult', data.results,
            `Tìm thấy ${data.results.length} kết quả cho "${searchTerm.trim()}"`);
    } catch (error) {
        displayResults('vulnerableSearchResult', [], 'Có lỗi xảy ra khi tìm kiếm');
        console.error('Vulnerable search error:', error);
    }
});