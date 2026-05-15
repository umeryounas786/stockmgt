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

async function loadProducts() {
    try {
        const response = await fetch('/api/products', { headers: getAuthHeaders() });
        if (response.status === 401) { window.location.href = '/login'; return; }
        if (!response.ok) throw new Error('Failed to load products');

        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error loading products: ' + error.message);
    }
}

function displayProducts(products) {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = '';

    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No products found. Use Stock Purchases to add one.</td></tr>';
        return;
    }

    products.forEach(product => {
        const status = product.stock_in_hand <= 0 ? 'critical' : 'ok';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(product.product_code)}</strong></td>
            <td>${escapeHtml(product.product_description) || '-'}</td>
            <td>${escapeHtml(product.supplier_name)}</td>
            <td>${product.product_packet_size}</td>
            <td>${product.total_purchase}</td>
            <td>${product.total_sale}</td>
            <td><span class="status-badge status-${status}">${product.stock_in_hand}</span></td>
            <td>${Number(product.stock_in_boxes)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editProduct(${product.product_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.product_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to load product');

        const product = await response.json();

        document.getElementById('productCode').value = product.product_code || '';
        document.getElementById('supplierName').value =
            `${product.supplier_name || ''} (${product.supplier_code || ''})`;
        document.getElementById('description').value = product.product_description || '';
        document.getElementById('packetSize').value = product.product_packet_size;

        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productForm').dataset.productId = productId;
        document.getElementById('productModal').classList.add('show');
    } catch (error) {
        console.error('Error editing product:', error);
        alert('Error loading product: ' + error.message);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Delete this product? Its stock purchases and sales records will also be removed.')) return;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to delete product');
            return;
        }

        alert('Product deleted successfully');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('productForm').dataset.productId;
    if (!productId) return;

    const data = {
        description: document.getElementById('description').value.trim(),
        packetSize: parseInt(document.getElementById('packetSize').value, 10)
    };

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(body.message || 'Failed to save product');
            return;
        }

        alert('Product updated successfully');
        document.getElementById('productModal').classList.remove('show');
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
    }
});

document.getElementById('productCancelBtn').addEventListener('click', () => {
    document.getElementById('productModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('productModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) modal.classList.remove('show');
});

document.addEventListener('DOMContentLoaded', loadProducts);
