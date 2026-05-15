function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
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

async function loadCustomers() {
    try {
        const response = await fetch('/api/customers', { headers: getAuthHeaders() });
        if (response.status === 401) { window.location.href = '/login'; return; }
        if (!response.ok) throw new Error('Failed to load customers');

        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Error loading customers: ' + error.message);
    }
}

function displayCustomers(customers) {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = '';

    if (!customers || customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No customers found</td></tr>';
        return;
    }

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.customer_id}</td>
            <td><strong>${escapeHtml(customer.customer_name)}</strong></td>
            <td>${escapeHtml(customer.contact_person) || '-'}</td>
            <td>${escapeHtml(customer.contact_email) || '-'}</td>
            <td>${escapeHtml(customer.contact_phone) || '-'}</td>
            <td>${escapeHtml(customer.address) || '-'}</td>
            <td>${customer.sale_count || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editCustomer(${customer.customer_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${customer.customer_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddCustomerModal() {
    document.getElementById('customerForm').reset();
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    document.getElementById('customerForm').dataset.customerId = '';
    document.getElementById('customerModal').classList.add('show');
}

async function editCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to load customer');

        const customer = await response.json();

        document.getElementById('customerName').value = customer.customer_name || '';
        document.getElementById('contactPerson').value = customer.contact_person || '';
        document.getElementById('contactEmail').value = customer.contact_email || '';
        document.getElementById('contactPhone').value = customer.contact_phone || '';
        document.getElementById('customerAddress').value = customer.address || '';

        document.getElementById('customerModalTitle').textContent = 'Edit Customer';
        document.getElementById('customerForm').dataset.customerId = customerId;
        document.getElementById('customerModal').classList.add('show');
    } catch (error) {
        console.error('Error editing customer:', error);
        alert('Error loading customer: ' + error.message);
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('Delete this customer? Existing sales referencing them will be kept but unlinked.')) return;

    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to delete customer');
            return;
        }

        alert('Customer deleted successfully');
        loadCustomers();
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer: ' + error.message);
    }
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const customerId = document.getElementById('customerForm').dataset.customerId;
    const data = {
        name: document.getElementById('customerName').value.trim(),
        contactPerson: document.getElementById('contactPerson').value.trim(),
        contactEmail: document.getElementById('contactEmail').value.trim(),
        contactPhone: document.getElementById('contactPhone').value.trim(),
        address: document.getElementById('customerAddress').value.trim()
    };

    if (!data.name) {
        alert('Customer name is required');
        return;
    }

    try {
        const url = customerId ? `/api/customers/${customerId}` : '/api/customers';
        const method = customerId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to save customer');
            return;
        }

        alert(customerId ? 'Customer updated successfully' : 'Customer created successfully');
        document.getElementById('customerModal').classList.remove('show');
        loadCustomers();
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('Error saving customer: ' + error.message);
    }
});

document.getElementById('addCustomerBtn').addEventListener('click', openAddCustomerModal);
document.getElementById('customerCancelBtn').addEventListener('click', () => {
    document.getElementById('customerModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('customerModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('customerModal');
    if (e.target === modal) modal.classList.remove('show');
});

document.addEventListener('DOMContentLoaded', loadCustomers);
