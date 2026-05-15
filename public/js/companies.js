function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function loadCompanies() {
    try {
        const response = await fetch('/api/companies', { headers: getAuthHeaders() });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (!response.ok) throw new Error('Failed to load companies');

        const companies = await response.json();
        displayCompanies(companies);
    } catch (error) {
        console.error('Error loading companies:', error);
        alert('Error loading companies: ' + error.message);
    }
}

function displayCompanies(companies) {
    const tableBody = document.getElementById('companyTableBody');
    tableBody.innerHTML = '';

    if (!companies || companies.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No companies found</td></tr>';
        return;
    }

    companies.forEach(company => {
        const count = Number(company.product_count) || 0;
        const canDelete = count === 0;
        const deleteBtn = canDelete
            ? `<button class="btn btn-danger" onclick="deleteCompany(${company.company_id})">Delete</button>`
            : `<button class="btn btn-danger" disabled title="Company has ${count} product(s)" style="opacity:0.5;cursor:not-allowed;">Delete</button>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${company.company_id}</td>
            <td><strong>${escapeHtml(company.company_code)}</strong></td>
            <td>${escapeHtml(company.company_name)}</td>
            <td>${count}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editCompany(${company.company_id})">Edit</button>
                    ${deleteBtn}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddCompanyModal() {
    document.getElementById('companyForm').reset();
    document.getElementById('companyModalTitle').textContent = 'Add Company';
    document.getElementById('companyForm').dataset.companyId = '';
    document.getElementById('companyModal').classList.add('show');
}

async function editCompany(companyId) {
    try {
        const response = await fetch(`/api/companies/${companyId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to load company');

        const company = await response.json();

        document.getElementById('companyCode').value = company.company_code || '';
        document.getElementById('companyName').value = company.company_name || '';
        document.getElementById('companyModalTitle').textContent = 'Edit Company';
        document.getElementById('companyForm').dataset.companyId = companyId;
        document.getElementById('companyModal').classList.add('show');
    } catch (error) {
        console.error('Error editing company:', error);
        alert('Error loading company: ' + error.message);
    }
}

async function deleteCompany(companyId) {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
        const response = await fetch(`/api/companies/${companyId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to delete company');
            return;
        }

        alert('Company deleted successfully');
        loadCompanies();
    } catch (error) {
        console.error('Error deleting company:', error);
        alert('Error deleting company: ' + error.message);
    }
}

document.getElementById('companyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const companyId = document.getElementById('companyForm').dataset.companyId;
    const data = {
        companyCode: document.getElementById('companyCode').value.trim(),
        companyName: document.getElementById('companyName').value.trim()
    };

    if (!data.companyCode || !data.companyName) {
        alert('Company code and name are required');
        return;
    }

    try {
        const url = companyId ? `/api/companies/${companyId}` : '/api/companies';
        const method = companyId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to save company');
            return;
        }

        alert(companyId ? 'Company updated successfully' : 'Company created successfully');
        document.getElementById('companyModal').classList.remove('show');
        loadCompanies();
    } catch (error) {
        console.error('Error saving company:', error);
        alert('Error saving company: ' + error.message);
    }
});

document.getElementById('addCompanyBtn').addEventListener('click', openAddCompanyModal);
document.getElementById('companyCancelBtn').addEventListener('click', () => {
    document.getElementById('companyModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('companyModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('companyModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', loadCompanies);
