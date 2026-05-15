-- Create database
DROP DATABASE IF EXISTS stock_mgt;
CREATE DATABASE stock_mgt;
USE stock_mgt;

-- Users table (authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers
-- supplier_code is a short unique prefix used to derive product codes (e.g.
-- 'acme' -> 'acme1', 'acme2'). The full vendor profile (contact details,
-- address) lives here so every stock purchase can reference one supplier row.
CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_code VARCHAR(20) NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers
-- People/companies we sell to. Referenced by sales rows (optional).
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products
-- Each product belongs to one supplier and gets a unique product_code derived
-- from the supplier's supplier_code (e.g. supplier 'acme' -> 'acme1'). Stock
-- purchases (qty + price) live in stock_purchases.
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    product_description VARCHAR(255),
    product_packet_size INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT
);

-- Stock purchases
-- Each row is one purchase from a supplier for a given product. Quantity adds
-- to the product's available stock. The first row for a product is created
-- automatically when the product is added via the Stock Purchases page.
CREATE TABLE stock_purchases (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency ENUM('USD', 'PKR', 'GBP') NOT NULL DEFAULT 'USD',
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Sales
-- One row per sale event against a product. customer_id is optional (walk-in
-- sales / unknown customer).
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    customer_id INT NULL,
    sale_date DATE NOT NULL,
    sale_qty INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL
);

-- Convenience view: stock summary per product
-- total_purchase = SUM(stock_purchases.quantity)
-- total_sale     = SUM(sales.sale_qty)
-- stock_in_hand  = total_purchase - total_sale
-- stock_in_boxes = stock_in_hand / product_packet_size (2 decimals)
CREATE VIEW product_stock_summary AS
SELECT
    p.product_id,
    p.product_code,
    p.product_description,
    p.supplier_id,
    s.supplier_code,
    s.supplier_name,
    p.product_packet_size,
    COALESCE(pp.total_purchase, 0) AS total_purchase,
    COALESCE(ss.total_sale, 0) AS total_sale,
    COALESCE(pp.total_purchase, 0) - COALESCE(ss.total_sale, 0) AS stock_in_hand,
    ROUND((COALESCE(pp.total_purchase, 0) - COALESCE(ss.total_sale, 0)) / p.product_packet_size, 2) AS stock_in_boxes
FROM products p
JOIN suppliers s ON s.supplier_id = p.supplier_id
LEFT JOIN (
    SELECT product_id, SUM(quantity) AS total_purchase
    FROM stock_purchases
    GROUP BY product_id
) pp ON pp.product_id = p.product_id
LEFT JOIN (
    SELECT product_id, SUM(sale_qty) AS total_sale
    FROM sales
    GROUP BY product_id
) ss ON ss.product_id = p.product_id;

-- Sample data
INSERT INTO suppliers (supplier_code, supplier_name, contact_person, contact_email, contact_phone, address) VALUES
('sam', 'Samtajir Trading', 'Sam Khan', 'sam@samtajir.example', '+92-300-1234567', 'Hall Road, Lahore'),
('acme', 'Acme Imports', 'John Doe', 'john@acme.example', '+1-555-0100', '123 Market St');

INSERT INTO customers (customer_name, contact_person, contact_email, contact_phone, address) VALUES
('Retail Shop A', 'Ahmed Ali', 'shopa@example.com', '+92-301-7654321', 'Main Bazaar'),
('Wholesale Buyer B', 'Sara Khan', 'sarab@example.com', '+92-302-1112223', 'Industrial Area');

INSERT INTO products (supplier_id, product_code, product_description, product_packet_size) VALUES
(1, 'sam1', 'toys', 200);

INSERT INTO stock_purchases (product_id, quantity, unit_value, currency, purchase_date) VALUES
(1, 22800, 1.50, 'PKR', '2026-05-01');

INSERT INTO sales (product_id, customer_id, sale_date, sale_qty) VALUES
(1, 1, '2026-05-04', 450),
(1, 2, '2026-05-06', 550);

-- Indexes for query performance
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_purchases_product ON stock_purchases(product_id);
CREATE INDEX idx_purchases_date ON stock_purchases(purchase_date);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_username ON users(username);

SELECT 'Database initialized successfully!' AS status;
