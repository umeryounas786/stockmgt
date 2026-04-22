-- Create database
DROP DATABASE IF EXISTS stock_mgt;
CREATE DATABASE stock_mgt;
USE stock_mgt;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Accessories', 'Computer and device accessories'),
('Software', 'Software licenses and programs'),
('Hardware', 'Computer hardware components'),
('Other', 'Miscellaneous items');

-- Stock Items table
CREATE TABLE stock_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    description VARCHAR(255),
    sku VARCHAR(50) UNIQUE,
    supplier VARCHAR(100),
    reorder_level INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Stock Transactions table (for tracking additions/removals)
CREATE TABLE stock_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    notes VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES stock_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Email Alerts log table
CREATE TABLE email_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    alert_type VARCHAR(50),
    recipient_email VARCHAR(100),
    subject VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    FOREIGN KEY (item_id) REFERENCES stock_items(item_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_stock_quantity ON stock_items(quantity);
CREATE INDEX idx_stock_category ON stock_items(category_id);
CREATE INDEX idx_transactions_item ON stock_transactions(item_id);
CREATE INDEX idx_transactions_date ON stock_transactions(created_at);
CREATE INDEX idx_username ON users(username);

SELECT 'Database initialized successfully!' AS status;
