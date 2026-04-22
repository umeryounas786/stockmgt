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

async function loadCategories() {
    try {
        const response = await fetch('/api/categories', { headers: getAuthHeaders() });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        if (!response.ok) throw new Error('Failed to load categories');

        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Error loading categories: ' + error.message);
    }
}

function displayCategories(categories) {
    const tableBody = document.getElementById('categoryTableBody');
    tableBody.innerHTML = '';

    if (!categories || categories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No categories found</td></tr>';
        return;
    }

    categories.forEach(cat => {
        const count = cat.usage_count;
        const knownCount = count !== null && count !== undefined;
        const canDelete = !knownCount || count === 0;
        const deleteBtn = canDelete
            ? `<button class="btn btn-danger" onclick="deleteCategory(${cat.category_id})">Delete</button>`
            : `<button class="btn btn-danger" disabled title="Category is used by ${count} item(s)" style="opacity:0.5;cursor:not-allowed;">Delete</button>`;

        const countDisplay = knownCount ? count : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cat.category_id}</td>
            <td><strong>${escapeHtml(cat.category_name)}</strong></td>
            <td>${escapeHtml(cat.description) || '-'}</td>
            <td>${countDisplay}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editCategory(${cat.category_id})">Edit</button>
                    ${deleteBtn}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddCategoryModal() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    document.getElementById('categoryForm').dataset.categoryId = '';
    document.getElementById('categoryModal').classList.add('show');
}

async function editCategory(categoryId) {
    try {
        const response = await fetch(`/api/categories/${categoryId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to load category');

        const category = await response.json();

        document.getElementById('categoryName').value = category.category_name || '';
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryForm').dataset.categoryId = categoryId;
        document.getElementById('categoryModal').classList.add('show');
    } catch (error) {
        console.error('Error editing category:', error);
        alert('Error loading category: ' + error.message);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const response = await fetch(`/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            alert(body.message || 'Failed to delete category');
            return;
        }

        alert('Category deleted successfully');
        loadCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category: ' + error.message);
    }
}

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const categoryId = document.getElementById('categoryForm').dataset.categoryId;
    const data = {
        categoryName: document.getElementById('categoryName').value.trim(),
        description: document.getElementById('categoryDescription').value.trim()
    };

    if (!data.categoryName) {
        alert('Category name is required');
        return;
    }

    try {
        const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories';
        const method = categoryId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            alert(body.message || 'Failed to save category');
            return;
        }

        alert(categoryId ? 'Category updated successfully' : 'Category created successfully');
        document.getElementById('categoryModal').classList.remove('show');
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category: ' + error.message);
    }
});

document.getElementById('addCategoryBtn').addEventListener('click', openAddCategoryModal);
document.getElementById('categoryCancelBtn').addEventListener('click', () => {
    document.getElementById('categoryModal').classList.remove('show');
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('categoryModal').classList.remove('show');
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('categoryModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', loadCategories);
