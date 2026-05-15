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

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

// A small repeating palette for chart slices/bars.
const PALETTE = [
    '#667eea', '#764ba2', '#22c55e', '#f59e0b', '#ef4444',
    '#0ea5e9', '#a855f7', '#14b8a6', '#f43f5e', '#84cc16'
];

function colorsFor(count) {
    const out = [];
    for (let i = 0; i < count; i++) out.push(PALETTE[i % PALETTE.length]);
    return out;
}

let chartInstance = null;
let allProducts = [];
let allSales = [];

async function fetchJson(url) {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
}

async function loadData() {
    [allProducts, allSales] = await Promise.all([
        fetchJson('/api/products'),
        fetchJson('/api/sales')
    ]);
}

function renderTable(headers, rows) {
    document.getElementById('reportTableHead').innerHTML =
        '<tr>' + headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';

    const body = document.getElementById('reportTableBody');
    if (!rows.length) {
        body.innerHTML = `<tr><td colspan="${headers.length}" style="text-align:center;padding:20px;">No data</td></tr>`;
        return;
    }
    body.innerHTML = rows
        .map(row => '<tr>' + row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('') + '</tr>')
        .join('');
}

function drawChart(config) {
    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('reportChart').getContext('2d');
    chartInstance = new Chart(ctx, config);
}

// ---- Reports ----

function reportStockInHand() {
    const rows = allProducts
        .map(p => ({
            code: p.product_code,
            description: p.product_description || '',
            supplier: p.supplier_name,
            purchased: num(p.total_purchase),
            sold: num(p.total_sale),
            inHand: num(p.stock_in_hand),
            boxes: num(p.stock_in_boxes)
        }))
        .sort((a, b) => b.inHand - a.inHand);

    drawChart({
        type: 'bar',
        data: {
            labels: rows.map(r => r.code),
            datasets: [{
                label: 'Stock in hand',
                data: rows.map(r => r.inHand),
                backgroundColor: rows.map(r => r.inHand <= 0 ? '#ef4444' : '#22c55e')
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    renderTable(
        ['Product', 'Description', 'Supplier', 'Purchased', 'Sold', 'In Hand', 'In Boxes'],
        rows.map(r => [r.code, r.description, r.supplier, r.purchased, r.sold, r.inHand, r.boxes])
    );
}

function reportPurchaseVsSold() {
    const rows = allProducts
        .map(p => ({
            code: p.product_code,
            description: p.product_description || '',
            purchased: num(p.total_purchase),
            sold: num(p.total_sale),
            leftover: num(p.stock_in_hand)
        }))
        .sort((a, b) => b.purchased - a.purchased);

    drawChart({
        type: 'bar',
        data: {
            labels: rows.map(r => r.code),
            datasets: [
                { label: 'Purchased', data: rows.map(r => r.purchased), backgroundColor: '#667eea' },
                { label: 'Sold', data: rows.map(r => r.sold), backgroundColor: '#f59e0b' }
            ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    renderTable(
        ['Product', 'Description', 'Purchased', 'Sold', 'Leftover'],
        rows.map(r => [r.code, r.description, r.purchased, r.sold, r.leftover])
    );
}

function reportSalesByProduct() {
    const rows = allProducts
        .map(p => ({
            code: p.product_code,
            description: p.product_description || '',
            supplier: p.supplier_name,
            sold: num(p.total_sale)
        }))
        .filter(r => r.sold > 0)
        .sort((a, b) => b.sold - a.sold);

    drawChart({
        type: 'bar',
        data: {
            labels: rows.map(r => r.code),
            datasets: [{
                label: 'Units sold',
                data: rows.map(r => r.sold),
                backgroundColor: '#0ea5e9'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    renderTable(
        ['Product', 'Description', 'Supplier', 'Units Sold'],
        rows.map(r => [r.code, r.description, r.supplier, r.sold])
    );
}

function reportSalesBySupplier() {
    const totals = new Map();
    for (const sale of allSales) {
        const key = sale.supplier_name || '—';
        totals.set(key, (totals.get(key) || 0) + num(sale.sale_qty));
    }

    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const grandTotal = entries.reduce((sum, [, v]) => sum + v, 0);

    drawChart({
        type: 'pie',
        data: {
            labels: entries.map(([k]) => k),
            datasets: [{
                data: entries.map(([, v]) => v),
                backgroundColor: colorsFor(entries.length)
            }]
        },
        options: { responsive: true }
    });

    renderTable(
        ['Supplier', 'Units Sold', 'Share'],
        entries.map(([k, v]) => [k, v, grandTotal ? `${((v / grandTotal) * 100).toFixed(1)}%` : '0%'])
    );
}

function reportSalesByCustomer() {
    const totals = new Map();
    for (const sale of allSales) {
        const key = sale.customer_name || 'Unknown';
        totals.set(key, (totals.get(key) || 0) + num(sale.sale_qty));
    }

    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const grandTotal = entries.reduce((sum, [, v]) => sum + v, 0);

    drawChart({
        type: 'pie',
        data: {
            labels: entries.map(([k]) => k),
            datasets: [{
                data: entries.map(([, v]) => v),
                backgroundColor: colorsFor(entries.length)
            }]
        },
        options: { responsive: true }
    });

    renderTable(
        ['Customer', 'Units Sold', 'Share'],
        entries.map(([k, v]) => [k, v, grandTotal ? `${((v / grandTotal) * 100).toFixed(1)}%` : '0%'])
    );
}

function reportSalesOverTime() {
    const totals = new Map();
    for (const sale of allSales) {
        const date = String(sale.sale_date || '').slice(0, 10);
        if (!date) continue;
        totals.set(date, (totals.get(date) || 0) + num(sale.sale_qty));
    }

    const sorted = [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    drawChart({
        type: 'line',
        data: {
            labels: sorted.map(([k]) => k),
            datasets: [{
                label: 'Units sold',
                data: sorted.map(([, v]) => v),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                tension: 0.25,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    renderTable(
        ['Date', 'Units Sold'],
        sorted.map(([k, v]) => [k, v])
    );
}

const REPORTS = {
    'stock-in-hand': {
        title: 'Stock in hand by product',
        description: 'Current stock_in_hand (purchase − total sold) per product. Bars in red are out of stock.',
        run: reportStockInHand
    },
    'purchase-vs-sold': {
        title: 'Purchase vs Sold per product',
        description: 'Side-by-side comparison of units purchased and units sold for each product. The gap is the leftover stock.',
        run: reportPurchaseVsSold
    },
    'sales-by-product': {
        title: 'Sales by product',
        description: 'Total units sold per product across all time. Products with no sales are omitted.',
        run: reportSalesByProduct
    },
    'sales-by-supplier': {
        title: 'Sales by supplier',
        description: 'Share of total sale quantity attributed to each supplier (via the product\'s supplier).',
        run: reportSalesBySupplier
    },
    'sales-by-customer': {
        title: 'Sales by customer',
        description: 'Share of total sale quantity attributed to each customer.',
        run: reportSalesByCustomer
    },
    'sales-over-time': {
        title: 'Sales over time',
        description: 'Daily total of units sold across all products.',
        run: reportSalesOverTime
    }
};

function renderReport(reportKey) {
    const report = REPORTS[reportKey];
    if (!report) return;
    document.getElementById('reportTitle').textContent = report.title;
    document.getElementById('reportDescription').textContent = report.description;
    report.run();
}

document.getElementById('reportType').addEventListener('change', (e) => {
    renderReport(e.target.value);
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        renderReport(document.getElementById('reportType').value);
    } catch (error) {
        console.error('Error loading report data:', error);
        if (error.message !== 'Unauthorized') {
            alert('Error loading report data: ' + error.message);
        }
    }
});
