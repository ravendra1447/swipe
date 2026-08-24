-- Create Database
CREATE DATABASE IF NOT EXISTS swipe_db;
USE swipe_db;

-- -----------------------------------------------------
-- Table parties
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  due DECIMAL(10,2),
  type VARCHAR(50),
  initials VARCHAR(10),
  color VARCHAR(50),
  email VARCHAR(255),
  gstin VARCHAR(50),
  company_name VARCHAR(255),
  billing_address TEXT,
  shipping_address TEXT,
  tds DECIMAL(10,2),
  tcs DECIMAL(10,2),
  rcm_applicable INT,
  notes TEXT,
  tags TEXT,
  credit_limit DECIMAL(10,2),
  state VARCHAR(100),
  linked_customer_id INT
);

-- -----------------------------------------------------
-- Table transactions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  invoice VARCHAR(100),
  date VARCHAR(100),
  amount DECIMAL(15,2),
  status VARCHAR(50),
  by_user VARCHAR(100),
  hasWhatsapp INT
);

-- -----------------------------------------------------
-- Table products
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  price VARCHAR(100),
  tag VARCHAR(100),
  discount VARCHAR(100)
);

-- -----------------------------------------------------
-- Table dashboard_stats
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sales DECIMAL(15,2),
  purchases DECIMAL(15,2)
);

-- -----------------------------------------------------
-- Table product_details
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS product_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  selling_price DECIMAL(10,2),
  tax_rate DECIMAL(10,2),
  purchase_price DECIMAL(10,2),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  category VARCHAR(100),
  hsn_code VARCHAR(100),
  type VARCHAR(50),
  barcode VARCHAR(100),
  description TEXT
);

-- -----------------------------------------------------
-- Table payments_timeline
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payments_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(100),
  type VARCHAR(50),
  amount DECIMAL(15,2),
  reference VARCHAR(100)
);

-- -----------------------------------------------------
-- Table gstr1_records
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS gstr1_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gstin VARCHAR(100),
  receiver_name VARCHAR(255),
  tab_type VARCHAR(50),
  date VARCHAR(100)
);

-- -----------------------------------------------------
-- Table eway_bills
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eway_bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  billNumber VARCHAR(100),
  amount DECIMAL(15,2),
  status VARCHAR(50)
);

-- -----------------------------------------------------
-- Table einvoices
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS einvoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(100),
  status VARCHAR(50)
);

-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50)
);

-- -----------------------------------------------------
-- Table company
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS company (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  logo TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  gst_number VARCHAR(100),
  pan VARCHAR(100),
  state VARCHAR(100),
  alternate_phone VARCHAR(50),
  website VARCHAR(255),
  business_type VARCHAR(100)
);

-- -----------------------------------------------------
-- Table bank_accounts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_holder_name VARCHAR(255),
  account_no VARCHAR(100),
  ifsc_code VARCHAR(50),
  bank_name VARCHAR(255),
  branch_name VARCHAR(255),
  upi_id VARCHAR(100),
  upi_number VARCHAR(100),
  opening_balance DECIMAL(15,2),
  notes TEXT,
  is_default INT
);

-- -----------------------------------------------------
-- Table signatures
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS signatures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(100),
  data TEXT
);

-- -----------------------------------------------------
-- Table app_settings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
  `key` VARCHAR(100) PRIMARY KEY,
  value TEXT
);


-- =====================================================
-- Seed Data
-- =====================================================

INSERT IGNORE INTO parties (id, name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id) VALUES
(1, 'Adarsh D', '9823664474', 10000.00, 'collect', 'AD', 'pink', 'adarsh@example.com', NULL, 'Adarsh Enterprises', NULL, NULL, 0.00, 0.00, 0, NULL, NULL, 0.00, NULL, NULL),
(2, 'AR ENTERPRISES', '', 25587.00, 'pay', 'AE', 'teal', NULL, '29XYZDE1234F1Z6', 'AR Enterprises', NULL, NULL, 0.00, 0.00, 0, NULL, NULL, 0.00, NULL, NULL),
(3, 'Jainam Shah', '8780767186', 763.00, 'pay', 'JS', 'green', NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0, NULL, NULL, 0.00, NULL, NULL),
(4, 'Seemith', '8787878754', 8885.00, 'pay', 'S', 'indigo', NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0, NULL, NULL, 0.00, NULL, NULL),
(5, 'Vibhav', '4252412211', 0.00, 'none', 'V', 'red', NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0, NULL, NULL, 0.00, NULL, NULL);

INSERT IGNORE INTO transactions (id, name, invoice, date, amount, status, by_user, hasWhatsapp) VALUES
(1, 'SK TOOLS COPORTATION', 'FY-23-24/222', '24 Jul 2023', 15588.00, 'pending', 'rupa', 0),
(2, 'Meenakshi', 'FY-23-24/221', '24 Jul 2023', 1299.00, 'pending', 'rupa', 0),
(3, 'TALENT', 'FY-23-24/220', '24 Jul 2023', 2500.00, 'pending', 'rupa', 1);

INSERT IGNORE INTO products (id, title, price, tag, discount) VALUES
(1, 'Diwali Alpana Pack + Chocolates', '₹ 1200.00', 'DIWALI GIFTS', NULL),
(2, 'Diwali Special Box', '', 'DIWALI GIFTS', '5% OFF');

INSERT IGNORE INTO dashboard_stats (id, sales, purchases) VALUES
(1, 10000609000.00, 31200000.00);

INSERT IGNORE INTO product_details (id, product_id, selling_price, tax_rate, purchase_price, quantity, unit, category, hsn_code, type, barcode, description) VALUES
(1, 1, 100.00, 0.00, 0.00, 0.00, 'OTH', 'ADD', '00000000', 'Product', '00000000', 'Create your first invoice with ease using our sample product!');

INSERT IGNORE INTO payments_timeline (id, date, type, amount, reference) VALUES
(1, '24 Jul 2026', 'received', 15000.00, 'INV-001'),
(2, '25 Jul 2026', 'paid', 5000.00, 'EXP-001');

INSERT IGNORE INTO gstr1_records (id, gstin, receiver_name, tab_type, date) VALUES
(1, '29ABCDE1234F1Z5', 'Acme Corp', 'B2B', '15-07-2026'),
(2, '29XYZDE1234F1Z6', 'Globex Inc', 'B2B', '16-07-2026'),
(3, 'Unregistered', 'John Doe', 'B2CL', '17-07-2026');

INSERT IGNORE INTO eway_bills (id, billNumber, amount, status) VALUES
(1, '1001', 50000.00, 'Generated'),
(2, '1002', 125000.00, 'In Transit');

INSERT IGNORE INTO einvoices (id, invoice_number, status) VALUES
(1, 'INV-2026-001', 'IRN Generated'),
(2, 'INV-2026-002', 'IRN Generated');


-- Password is 'password123' hashed with bcrypt
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@example.com', '$2a$08$U3E2Lz/G242wWbY6L1J9mOoOqY7Q.H8m3k27L7eP2b.nJj3zI86cO', 'admin');

INSERT IGNORE INTO company (id, name, logo, phone, email, address, gst_number, pan, state, alternate_phone, website, business_type) VALUES
(1, 'Swipe demo', NULL, '9876543210', 'admin@swipedemo.com', 'Q-city, 2nd Floor Block A\nHyderabad, TELANGANA, 500032', '29ABCDE1234F1Z5', '', 'Telangana', '', '', '');

INSERT IGNORE INTO bank_accounts (id, account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default) VALUES
(1, 'Swipe Demo Acc', '1234567890', 'SBIN0001234', 'State Bank of India', 'Main Branch', 'swipedemo@ybl', '9876543210', 0.00, '', 1);

INSERT IGNORE INTO app_settings (`key`, value) VALUES
('selected_template', 'Modern'),
('price_decimal_format', '2'),
('show_details', 'true');
