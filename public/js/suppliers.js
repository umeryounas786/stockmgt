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

async function loadSuppliers() {
    try {
        const response = await fetch('/api/suppliers', { headers: getAuthHeaders() });
        if (response.status === 401) { window.location.href = '/login'; return; }
        if (!response.ok) throw new Error('Failed to load suppliers');

        const suppliers = await response.json();
        displaySuppliers(suppliers);
    } catch (error) {
        console.error('Error loading suppliers:', error);
        alert('Error loading suppliers: ' + error.message);
    }
}

function displaySuppliers(suppliers) {
    const tableBody = document.getElementById('supplierTableBody');
    tableBody.innerHTML = '';

    if (!suppliers || suppliers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No suppliers found</td></tr>';
        return;
    }

    suppliers.forEach(supplier => {
        const count = Number(supplier.product_count) || 0;
        const canDelete = count === 0;
        const deleteBtn = canDelete
            ? `<button class="btn btn-danger" onclick="deleteSupplier(${supplier.supplier_id})">Delete</button>`
            : `<button class="btn btn-danger" disabled title="Supplier has ${count} product(s)" style="opacity:0.5;cursor:not-allowed;">Delete</button>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.supplier_id}</td>
            <td><strong>${escapeHtml(supplier.supplier_code)}</strong></td>
            <td>${escapeHtml(supplier.supplier_name)}</td>
            <td>${escapeHtml(supplier.contact_person) || '-'}</td>
            <td>${escapeHtml(supplier.contact_email) || '-'}</td>
            <td>${escapeHtml(supplier.contact_phone) || '-'}</td>
            <td>${escapeHtml(supplier.address) || '-'}</td>
            <td>${count}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editSupplier(${supplier.supplier_id})">Edit</button>
                    ${deleteBtn}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddSupplierModal() {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierModalTitle').textContent = 'Add Supplier';
    document.getElementById('supplierForm').dataset.supplierId = '';
    document.getElementById('supplierModal').classList.add('show');
}

async function editSupplier(supplierId) {
    try {
        const response = await fetch(`/api/suppliers/${supplierId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to load supplier');

        const supplier = await response.json();

        document.getElementById('supplierCode').value = supplier.supplier_code || '';
        document.getElementById('supplierName').value = supplier.supplier_name || '';
        document.getElementById('contactPerson').value = supplier.contact_person || '';
        document.getElementById('contactEmail').value = supplier.contact_email || '';
        document.getElementById('contactPhone').value = supplier.contact_phone || '';
        document.getElementById('supplierAddress').value = supplier.address || '';

        document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
        document.getElementById('supplierForm').dataset.supplierId = supplierId;
        document.getElementById('supplierModal').classList.add('show');
    } catch (error) {
        console.error('Error editing supplier:', error);
        alert('Error loading supplier: ' + error.message);
    }
}

async function deleteSupplier(supplierId) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to delete supplier');
            return;
        }

        alert('Supplier deleted successfully');
        loadSuppliers();
    } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error deleting supplier: ' + error.message);
    }
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const supplierId = document.getElementById('supplierForm').dataset.supplierId;
    const data = {
        code: document.getElementById('supplierCode').value.trim(),
        name: document.getElementById('supplierName').value.trim(),
        contactPerson: document.getElementById('contactPerson').value.trim(),
        contactEmail: document.getElementById('contactEmail').value.trim(),
        contactPhone: document.getElementById('contactPhone').value.trim(),
        address: document.getElementById('supplierAddress').value.trim()
    };

    if (!data.code) { alert('Supplier code is required'); return; }
    if (!data.name) { alert('Supplier name is required'); return; }

    try {
        const url = supplierId ? `/api/suppliers/${supplierId}` : '/api/suppliers';
        const method = supplierId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to save supplier');
            return;
        }

        alert(supplierId ? 'Supplier updated successfully' : 'Supplier created successfully');
        document.getElementById('supplierModal').classList.remove('show');
        loadSuppliers();
    } catch (error) {
        console.error('Error saving supplier:', error);
        alert('Error saving supplier: ' + error.message);
    }
});

document.getElementById('addSupplierBtn').addEventListener('click', openAddSupplierModal);
document.getElementById('supplierCancelBtn').addEventListener('click', () => {
    document.getElementById('supplierModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('supplierModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('supplierModal');
    if (e.target === modal) modal.classList.remove('show');
});

document.addEventListener('DOMContentLoaded', loadSuppliers);
