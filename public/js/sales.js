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

function formatDate(value) {
    if (!value) return '-';
    return String(value).slice(0, 10);
}

let allSales = [];
let allProducts = [];

function productLabel(product) {
    return `${product.product_code} - ${product.product_description || ''} (in hand: ${product.stock_in_hand})`;
}

async function loadProductOptions() {
    try {
        const response = await fetch('/api/products', { headers: getAuthHeaders() });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (!response.ok) throw new Error('Failed to load products');

        allProducts = await response.json();

        populateSaleProductSelect(document.getElementById('saleCompany').value);
        populateProductFilter(document.getElementById('filterCompany').value);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error loading products: ' + error.message);
    }
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
        // Same company list feeds the page filter and the Record Sale modal.
        ['filterCompany', 'saleCompany'].forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">All Companies</option>';
            companies.forEach(company => {
                const opt = document.createElement('option');
                opt.value = company.company_id;
                opt.textContent = `${company.company_name} (${company.company_code})`;
                select.appendChild(opt);
            });
        });
    } catch (error) {
        console.error('Error loading companies:', error);
        alert('Error loading companies: ' + error.message);
    }
}

// Rebuilds the page-level product filter, optionally narrowed to a company.
function populateProductFilter(companyId) {
    const select = document.getElementById('filterProduct');
    const products = companyId
        ? allProducts.filter(p => String(p.company_id) === String(companyId))
        : allProducts;

    select.innerHTML = '<option value="">All Products</option>';
    products.forEach(product => {
        const opt = document.createElement('option');
        opt.value = product.product_id;
        opt.textContent = `${product.product_code} - ${product.product_description || ''}`;
        select.appendChild(opt);
    });
}

// Rebuilds the Record Sale modal's product select, optionally narrowed to a
// company. Keeps the current product selected if it is still in the list.
function populateSaleProductSelect(companyId) {
    const select = document.getElementById('productId');
    const previous = select.value;
    const products = companyId
        ? allProducts.filter(p => String(p.company_id) === String(companyId))
        : allProducts;

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
    const companyId = document.getElementById('filterCompany').value;
    const productId = document.getElementById('filterProduct').value;

    let filtered = allSales;
    if (companyId) {
        filtered = filtered.filter(s => String(s.company_id) === String(companyId));
    }
    if (productId) {
        filtered = filtered.filter(s => String(s.product_id) === String(productId));
    }
    displaySales(filtered);
}

async function loadSales() {
    try {
        const response = await fetch('/api/sales', { headers: getAuthHeaders() });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (!response.ok) throw new Error('Failed to load sales');

        allSales = await response.json();
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
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No sales found</td></tr>';
        return;
    }

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.sale_id}</td>
            <td><strong>${escapeHtml(sale.product_code)}</strong></td>
            <td>${escapeHtml(sale.product_description) || '-'}</td>
            <td>${escapeHtml(sale.product_sale_to) || '-'}</td>
            <td>${formatDate(sale.product_sale_date)}</td>
            <td>${sale.product_sale_qty}</td>
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
    document.getElementById('saleCompany').value = '';
    populateSaleProductSelect('');
    document.getElementById('saleModal').classList.add('show');
}

async function editSale(saleId) {
    try {
        const response = await fetch(`/api/sales/${saleId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to load sale');

        const sale = await response.json();

        // Preset the company filter to the sold product's company, if known.
        const product = allProducts.find(p => String(p.product_id) === String(sale.product_id));
        document.getElementById('saleCompany').value = product ? product.company_id : '';
        populateSaleProductSelect(document.getElementById('saleCompany').value);

        document.getElementById('productId').value = sale.product_id || '';
        document.getElementById('saleTo').value = sale.product_sale_to || '';
        document.getElementById('saleDate').value = formatDate(sale.product_sale_date);
        document.getElementById('saleQty').value = sale.product_sale_qty;

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
        loadProductOptions();
    } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale: ' + error.message);
    }
}

document.getElementById('saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const saleId = document.getElementById('saleForm').dataset.saleId;
    const productIdValue = document.getElementById('productId').value;
    if (!productIdValue) {
        alert('Please select a product');
        return;
    }

    const data = {
        productId: parseInt(productIdValue, 10),
        saleTo: document.getElementById('saleTo').value.trim(),
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
        loadProductOptions();
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
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

document.getElementById('filterCompany').addEventListener('change', (e) => {
    populateProductFilter(e.target.value);
    applyFilters();
});
document.getElementById('filterProduct').addEventListener('change', applyFilters);

document.getElementById('saleCompany').addEventListener('change', (e) => {
    populateSaleProductSelect(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
    loadCompanies();
    loadProductOptions();
    loadSales();
});
