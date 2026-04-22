// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Set token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Get auth headers
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Load categories into the dropdown
async function loadCategoryOptions() {
    try {
        const response = await fetch('/api/categories', { headers: getAuthHeaders() });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        if (!response.ok) throw new Error('Failed to load categories');

        const categories = await response.json();
        const select = document.getElementById('categoryId');
        // Preserve the placeholder, drop any prior options
        select.innerHTML = '<option value="">-- Select Category --</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.category_id;
            opt.textContent = cat.category_name;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Error loading categories: ' + error.message);
    }
}

// Load stock items
async function loadStockItems() {
    try {
        const response = await fetch('/api/stock', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to load stock items');
        }

        const items = await response.json();
        displayStockItems(items);
    } catch (error) {
        console.error('Error loading stock items:', error);
        alert('Error loading stock items: ' + error.message);
    }
}

// Display stock items in table
function displayStockItems(items) {
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = '';

    if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No stock items found</td></tr>';
        return;
    }

    items.forEach(item => {
        const status = getStockStatus(item.quantity);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.item_id}</td>
            <td><strong>${item.item_name}</strong></td>
            <td>${item.sku || '-'}</td>
            <td>${item.quantity}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.category_name || '-'}</td>
            <td>${item.supplier || '-'}</td>
            <td><span class="status-badge status-${status}">${status === 'critical' ? 'CRITICAL' : status === 'low' ? 'LOW STOCK' : 'OK'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editStock(${item.item_id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteStock(${item.item_id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get stock status
function getStockStatus(quantity) {
    const threshold = 5;
    if (quantity === 0) return 'critical';
    if (quantity <= threshold) return 'low';
    return 'ok';
}

// Open add stock modal
function openAddStockModal() {
    document.getElementById('stockForm').reset();
    document.getElementById('modalTitle').textContent = 'Add Stock Item';
    document.getElementById('stockForm').dataset.itemId = '';
    document.getElementById('stockModal').classList.add('show');
}

// Edit stock item
async function editStock(itemId) {
    try {
        const response = await fetch(`/api/stock/${itemId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load item');

        const item = await response.json();
        
        document.getElementById('itemName').value = item.item_name;
        document.getElementById('sku').value = item.sku || '';
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('price').value = item.price;
        document.getElementById('categoryId').value = item.category_id || '';
        document.getElementById('supplier').value = item.supplier || '';
        document.getElementById('reorderLevel').value = item.reorder_level || 5;
        document.getElementById('description').value = item.description || '';

        document.getElementById('modalTitle').textContent = 'Edit Stock Item';
        document.getElementById('stockForm').dataset.itemId = itemId;
        document.getElementById('stockModal').classList.add('show');
    } catch (error) {
        console.error('Error editing stock:', error);
        alert('Error loading item: ' + error.message);
    }
}

// Delete stock item
async function deleteStock(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`/api/stock/${itemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to delete item');

        alert('Item deleted successfully');
        loadStockItems();
    } catch (error) {
        console.error('Error deleting stock:', error);
        alert('Error deleting item: ' + error.message);
    }
}

// Handle form submission
document.getElementById('stockForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemId = document.getElementById('stockForm').dataset.itemId;
    const categoryIdValue = document.getElementById('categoryId').value;
    if (!categoryIdValue) {
        alert('Please select a category');
        return;
    }

    const data = {
        itemName: document.getElementById('itemName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value),
        categoryId: parseInt(categoryIdValue),
        description: document.getElementById('description').value || '',
        sku: document.getElementById('sku').value,
        supplier: document.getElementById('supplier').value
    };

    try {
        let response;
        if (itemId) {
            // Update existing item
            response = await fetch(`/api/stock/${itemId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            // Create new item
            response = await fetch('/api/stock', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }

        if (!response.ok) throw new Error('Failed to save item');

        alert(itemId ? 'Item updated successfully' : 'Item created successfully');
        document.getElementById('stockModal').classList.remove('show');
        loadStockItems();
    } catch (error) {
        console.error('Error saving stock:', error);
        alert('Error saving item: ' + error.message);
    }
});

// Modal controls
document.getElementById('addStockBtn').addEventListener('click', openAddStockModal);

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('stockModal').classList.remove('show');
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('stockModal').classList.remove('show');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('stockModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Load stock items on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategoryOptions();
    loadStockItems();
});
