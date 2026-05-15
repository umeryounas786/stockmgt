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

-- Company table
-- company_id is the incremental primary key; company_code is a short prefix
-- (e.g. 'sam') used to build product codes; company_name is the full name.
CREATE TABLE company (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    company_code VARCHAR(20) NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stock table (products)
-- Each product belongs to a company and has a unique product_code
-- (e.g. 'sam1', 'sam4'). product_stock_purchase is the total units purchased;
-- product_packet_size is how many units make one box/packet.
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    product_description VARCHAR(255),
    product_packet_size INT NOT NULL DEFAULT 1,
    product_stock_purchase INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
);

-- Sale table
-- Each row is one sale event against a product. product_sale_to (customer)
-- is optional. Stock-in-hand is derived: purchase minus the sum of sale qty.
CREATE TABLE sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    product_sale_to VARCHAR(100),
    product_sale_date DATE NOT NULL,
    product_sale_qty INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Convenience view: stock in hand per product
-- total_sale       = SUM of all sale quantities
-- stock_in_hand    = product_stock_purchase - total_sale
-- stock_in_boxes   = stock_in_hand / product_packet_size (rounded to 2 decimals,
--                    so a partial box shows e.g. 44.8 rather than being floored)
CREATE VIEW product_stock_summary AS
SELECT
    p.product_id,
    p.product_code,
    p.product_description,
    p.company_id,
    c.company_code,
    c.company_name,
    p.product_packet_size,
    p.product_stock_purchase,
    COALESCE(SUM(s.product_sale_qty), 0) AS total_sale,
    p.product_stock_purchase - COALESCE(SUM(s.product_sale_qty), 0) AS stock_in_hand,
    ROUND((p.product_stock_purchase - COALESCE(SUM(s.product_sale_qty), 0)) / p.product_packet_size, 2) AS stock_in_boxes
FROM products p
JOIN company c ON c.company_id = p.company_id
LEFT JOIN sales s ON s.product_id = p.product_id
GROUP BY p.product_id, p.product_code, p.product_description, p.company_id,
         c.company_code, c.company_name, p.product_packet_size, p.product_stock_purchase;

-- Sample data matching the worked example
INSERT INTO company (company_code, company_name) VALUES
('sam', 'samtajir');

INSERT INTO products (company_id, product_code, product_description, product_packet_size, product_stock_purchase) VALUES
(1, 'sam4', 'toys', 200, 22800);

INSERT INTO sales (product_id, product_code, product_sale_to, product_sale_date, product_sale_qty) VALUES
(1, 'sam4', NULL, '2026-05-04', 450),
(1, 'sam4', NULL, '2026-05-06', 550);

-- Indexes for query performance
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_date ON sales(product_sale_date);
CREATE INDEX idx_username ON users(username);

SELECT 'Database initialized successfully!' AS status;
