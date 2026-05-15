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

let allSales = [];
let allProducts = [];
let allSuppliers = [];
let allCustomers = [];

async function fetchJson(url) {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
}

function productLabel(product) {
    return `${product.product_code} - ${product.product_description || ''} (in hand: ${product.stock_in_hand})`;
}

async function loadSuppliers() {
    try {
        allSuppliers = await fetchJson('/api/suppliers');
        ['filterSupplier', 'saleSupplier'].forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">All Suppliers</option>';
            allSuppliers.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.supplier_id;
                opt.textContent = `${s.supplier_name} (${s.supplier_code})`;
                select.appendChild(opt);
            });
        });
    } catch (error) {
        console.error('Error loading suppliers:', error);
        alert('Error loading suppliers: ' + error.message);
    }
}

async function loadCustomers() {
    try {
        allCustomers = await fetchJson('/api/customers');
        const filter = document.getElementById('filterCustomer');
        filter.innerHTML = '<option value="">All Customers</option>';
        const modalSelect = document.getElementById('customerId');
        modalSelect.innerHTML = '<option value="">-- (optional) --</option>';
        allCustomers.forEach(c => {
            const filterOpt = document.createElement('option');
            filterOpt.value = c.customer_id;
            filterOpt.textContent = c.customer_name;
            filter.appendChild(filterOpt);

            const modalOpt = document.createElement('option');
            modalOpt.value = c.customer_id;
            modalOpt.textContent = c.customer_name;
            modalSelect.appendChild(modalOpt);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
        alert('Error loading customers: ' + error.message);
    }
}

async function loadProducts() {
    try {
        allProducts = await fetchJson('/api/products');
        populateSaleProductSelect(document.getElementById('saleSupplier').value);
        populateProductFilter(document.getElementById('filterSupplier').value);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error loading products: ' + error.message);
    }
}

function productsForSupplier(supplierId) {
    if (!supplierId) return allProducts;
    return allProducts.filter(p => String(p.supplier_id) === String(supplierId));
}

function populateProductFilter(supplierId) {
    const select = document.getElementById('filterProduct');
    const products = productsForSupplier(supplierId);

    select.innerHTML = '<option value="">All Products</option>';
    products.forEach(product => {
        const opt = document.createElement('option');
        opt.value = product.product_id;
        opt.textContent = `${product.product_code} - ${product.product_description || ''}`;
        select.appendChild(opt);
    });
}

function populateSaleProductSelect(supplierId) {
    const select = document.getElementById('productId');
    const previous = select.value;
    const products = productsForSupplier(supplierId);

    select.innerHTML = '<option value="">-- Select Product --</option>';
    products.forEach(product => {
        const opt = document.createElement('option');
        opt.value = product.product_id;
        opt.textContent = productLabel(product);
        select.appendChild(opt);
    });

    if (previous && products.some(p => String(p.product_id) === String(previous))) {
        select.value = previous;
    }
}

function applyFilters() {
    const supplierId = document.getElementById('filterSupplier').value;
    const productId = document.getElementById('filterProduct').value;
    const customerId = document.getElementById('filterCustomer').value;

    let filtered = allSales;
    if (supplierId) {
        filtered = filtered.filter(s => String(s.supplier_id) === String(supplierId));
    }
    if (productId) {
        filtered = filtered.filter(s => String(s.product_id) === String(productId));
    }
    if (customerId) {
        filtered = filtered.filter(s => String(s.customer_id) === String(customerId));
    }
    displaySales(filtered);
}

async function loadSales() {
    try {
        allSales = await fetchJson('/api/sales');
        applyFilters();
    } catch (error) {
        console.error('Error loading sales:', error);
        alert('Error loading sales: ' + error.message);
    }
}

function displaySales(sales) {
    const tableBody = document.getElementById('saleTableBody');
    tableBody.innerHTML = '';

    if (!sales || sales.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No sales found</td></tr>';
        return;
    }

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.sale_id}</td>
            <td><strong>${escapeHtml(sale.product_code)}</strong></td>
            <td>${escapeHtml(sale.product_description) || '-'}</td>
            <td>${escapeHtml(sale.supplier_name) || '-'}</td>
            <td>${escapeHtml(sale.customer_name) || '-'}</td>
            <td>${formatDate(sale.sale_date)}</td>
            <td>${sale.sale_qty}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editSale(${sale.sale_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteSale(${sale.sale_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddSaleModal() {
    document.getElementById('saleForm').reset();
    document.getElementById('saleModalTitle').textContent = 'Record Sale';
    document.getElementById('saleForm').dataset.saleId = '';
    document.getElementById('saleSupplier').value = '';
    populateSaleProductSelect('');
    document.getElementById('saleDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('saleModal').classList.add('show');
}

async function editSale(saleId) {
    try {
        const sale = await fetchJson(`/api/sales/${saleId}`);

        // Preset the supplier filter to the product's supplier, if known.
        const product = allProducts.find(p => String(p.product_id) === String(sale.product_id));
        document.getElementById('saleSupplier').value = product ? product.supplier_id : '';
        populateSaleProductSelect(document.getElementById('saleSupplier').value);

        document.getElementById('productId').value = sale.product_id || '';
        document.getElementById('customerId').value = sale.customer_id || '';
        document.getElementById('saleDate').value = formatDate(sale.sale_date);
        document.getElementById('saleQty').value = sale.sale_qty;

        document.getElementById('saleModalTitle').textContent = 'Edit Sale';
        document.getElementById('saleForm').dataset.saleId = saleId;
        document.getElementById('saleModal').classList.add('show');
    } catch (error) {
        console.error('Error editing sale:', error);
        alert('Error loading sale: ' + error.message);
    }
}

async function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
        const response = await fetch(`/api/sales/${saleId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to delete sale');
            return;
        }

        alert('Sale deleted successfully');
        loadSales();
        loadProducts();
    } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale: ' + error.message);
    }
}

document.getElementById('saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const saleId = document.getElementById('saleForm').dataset.saleId;
    const productIdValue = document.getElementById('productId').value;
    if (!productIdValue) { alert('Please select a product'); return; }

    const data = {
        productId: parseInt(productIdValue, 10),
        customerId: document.getElementById('customerId').value || null,
        saleDate: document.getElementById('saleDate').value,
        saleQty: parseInt(document.getElementById('saleQty').value, 10)
    };

    try {
        const url = saleId ? `/api/sales/${saleId}` : '/api/sales';
        const method = saleId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to save sale');
            return;
        }

        alert(saleId ? 'Sale updated successfully' : 'Sale recorded successfully');
        document.getElementById('saleModal').classList.remove('show');
        loadSales();
        loadProducts();
    } catch (error) {
        console.error('Error saving sale:', error);
        alert('Error saving sale: ' + error.message);
    }
});

document.getElementById('addSaleBtn').addEventListener('click', openAddSaleModal);
document.getElementById('saleCancelBtn').addEventListener('click', () => {
    document.getElementById('saleModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('saleModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('saleModal');
    if (e.target === modal) modal.classList.remove('show');
});

document.getElementById('filterSupplier').addEventListener('change', (e) => {
    populateProductFilter(e.target.value);
    applyFilters();
});
document.getElementById('filterProduct').addEventListener('change', applyFilters);
document.getElementById('filterCustomer').addEventListener('change', applyFilters);

document.getElementById('saleSupplier').addEventListener('change', (e) => {
    populateSaleProductSelect(e.target.value);
});

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadSuppliers(), loadCustomers()]);
    await loadProducts();
    await loadSales();
});
