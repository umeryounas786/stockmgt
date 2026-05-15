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

function formatDate(value) {
    if (!value) return '-';
    return String(value).slice(0, 10);
}

const CURRENCY_SYMBOLS = { USD: '$', PKR: '₨', GBP: '£' };

function formatMoney(amount, currency) {
    const symbol = CURRENCY_SYMBOLS[currency] || '';
    const value = Number(amount);
    if (!Number.isFinite(value)) return `${symbol}0.00`;
    return `${symbol}${value.toFixed(2)}`;
}

let allSuppliers = [];
let allPurchases = [];

async function fetchJson(url) {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
}

async function loadAll() {
    try {
        [allSuppliers, allPurchases] = await Promise.all([
            fetchJson('/api/suppliers'),
            fetchJson('/api/stock-purchases')
        ]);
        populateSupplierSelect();
        displayPurchases(allPurchases);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data: ' + error.message);
    }
}

function populateSupplierSelect() {
    const select = document.getElementById('supplierId');
    select.innerHTML = '<option value="">-- Select Supplier --</option>';
    allSuppliers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.supplier_id;
        opt.textContent = `${s.supplier_name} (${s.supplier_code})`;
        select.appendChild(opt);
    });
}

function displayPurchases(purchases) {
    const tableBody = document.getElementById('purchaseTableBody');
    tableBody.innerHTML = '';

    if (!purchases || purchases.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">No stock purchases found</td></tr>';
        return;
    }

    purchases.forEach(purchase => {
        const total = Number(purchase.unit_value) * Number(purchase.quantity);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${purchase.purchase_id}</td>
            <td>${formatDate(purchase.purchase_date)}</td>
            <td><strong>${escapeHtml(purchase.product_code)}</strong></td>
            <td>${escapeHtml(purchase.product_description) || '-'}</td>
            <td>${escapeHtml(purchase.supplier_name)}</td>
            <td>${purchase.product_packet_size}</td>
            <td>${purchase.quantity}</td>
            <td>${formatMoney(purchase.unit_value, purchase.currency)}</td>
            <td>${formatMoney(total, purchase.currency)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editPurchase(${purchase.purchase_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deletePurchase(${purchase.purchase_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function setMode(mode) {
    const newFields = document.getElementById('newProductFields');
    const editSummary = document.getElementById('editProductSummary');
    if (mode === 'create') {
        newFields.style.display = '';
        editSummary.style.display = 'none';
        document.getElementById('supplierId').required = true;
    } else {
        newFields.style.display = 'none';
        editSummary.style.display = '';
        document.getElementById('supplierId').required = false;
    }
}

function openAddPurchaseModal() {
    const form = document.getElementById('purchaseForm');
    form.reset();
    form.dataset.purchaseId = '';
    document.getElementById('purchaseModalTitle').textContent = 'Record Stock Purchase';
    document.getElementById('productCode').value = '';
    setMode('create');

    // Default purchase date to today.
    document.getElementById('purchaseDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('purchaseModal').classList.add('show');
}

async function editPurchase(purchaseId) {
    try {
        const purchase = await fetchJson(`/api/stock-purchases/${purchaseId}`);

        const form = document.getElementById('purchaseForm');
        form.dataset.purchaseId = purchaseId;
        document.getElementById('purchaseModalTitle').textContent = 'Edit Stock Purchase';

        setMode('edit');
        document.getElementById('editProductInfo').value =
            `${purchase.product_code} - ${purchase.product_description || ''} (${purchase.supplier_name})`;

        document.getElementById('quantity').value = purchase.quantity;
        document.getElementById('unitValue').value = purchase.unit_value;
        document.getElementById('currency').value = purchase.currency;
        document.getElementById('purchaseDate').value = formatDate(purchase.purchase_date);

        document.getElementById('purchaseModal').classList.add('show');
    } catch (error) {
        console.error('Error editing purchase:', error);
        alert('Error loading purchase: ' + error.message);
    }
}

async function deletePurchase(purchaseId) {
    if (!confirm('Are you sure you want to delete this stock purchase?')) return;

    try {
        const response = await fetch(`/api/stock-purchases/${purchaseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to delete purchase');
            return;
        }
        alert('Stock purchase deleted successfully');
        loadAll();
    } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Error deleting purchase: ' + error.message);
    }
}

// When the supplier is picked, fetch the next product code that would be
// assigned for that supplier and preview it in the read-only field.
document.getElementById('supplierId').addEventListener('change', async (e) => {
    const supplierId = e.target.value;
    const codeField = document.getElementById('productCode');
    if (!supplierId) { codeField.value = ''; return; }

    try {
        const body = await fetchJson(`/api/products/next-code/${supplierId}`);
        codeField.value = body.productCode || '';
    } catch (error) {
        console.error('Error fetching next product code:', error);
        codeField.value = '';
    }
});

document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const purchaseId = document.getElementById('purchaseForm').dataset.purchaseId;
    const isEdit = !!purchaseId;

    const data = {
        quantity: parseInt(document.getElementById('quantity').value, 10),
        unitValue: Number.parseFloat(document.getElementById('unitValue').value),
        currency: document.getElementById('currency').value,
        purchaseDate: document.getElementById('purchaseDate').value
    };

    if (!isEdit) {
        const supplierId = document.getElementById('supplierId').value;
        if (!supplierId) { alert('Please select a supplier'); return; }
        data.supplierId = parseInt(supplierId, 10);
        data.description = document.getElementById('description').value.trim();
        data.packetSize = parseInt(document.getElementById('packetSize').value, 10);
    }

    try {
        const url = isEdit ? `/api/stock-purchases/${purchaseId}` : '/api/stock-purchases';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to save purchase');
            return;
        }

        alert(isEdit ? 'Stock purchase updated successfully' : 'Stock purchase recorded successfully');
        document.getElementById('purchaseModal').classList.remove('show');
        loadAll();
    } catch (error) {
        console.error('Error saving purchase:', error);
        alert('Error saving purchase: ' + error.message);
    }
});

document.getElementById('addPurchaseBtn').addEventListener('click', openAddPurchaseModal);
document.getElementById('purchaseCancelBtn').addEventListener('click', () => {
    document.getElementById('purchaseModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('purchaseModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('purchaseModal');
    if (e.target === modal) modal.classList.remove('show');
});

document.addEventListener('DOMContentLoaded', loadAll);
