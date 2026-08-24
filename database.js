require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'swipe_user',
  password: process.env.DB_PASSWORD || 'swipe@123',
  database: process.env.DB_NAME || 'swipe_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

async function initDB() {
  try {
    console.log('Connected to the MySQL database.');

    // Create Tables
    await promisePool.query(`CREATE TABLE IF NOT EXISTS parties (
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
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      invoice VARCHAR(100),
      date VARCHAR(100),
      amount DECIMAL(15,2),
      status VARCHAR(50),
      by_user VARCHAR(100),
      hasWhatsapp INT
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      price VARCHAR(100),
      tag VARCHAR(100),
      discount VARCHAR(100)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS dashboard_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sales DECIMAL(15,2),
      purchases DECIMAL(15,2)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS product_details (
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
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS payments_timeline (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(100),
      type VARCHAR(50),
      amount DECIMAL(15,2),
      reference VARCHAR(100)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS gstr1_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gstin VARCHAR(100),
      receiver_name VARCHAR(255),
      tab_type VARCHAR(50),
      date VARCHAR(100)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS document_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      document_id INT,
      document_type VARCHAR(50),
      sn VARCHAR(10),
      hsn VARCHAR(50),
      description VARCHAR(255),
      qty VARCHAR(50),
      unit VARCHAR(50),
      val VARCHAR(50)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS eway_bills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      billNumber VARCHAR(100),
      amount DECIMAL(15,2),
      status VARCHAR(50)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS einvoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_number VARCHAR(100),
      status VARCHAR(50)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50)
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS company (
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
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS bank_accounts (
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
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS signatures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      type VARCHAR(100),
      data TEXT
    )`);

    await promisePool.query(`CREATE TABLE IF NOT EXISTS app_settings (
      \`key\` VARCHAR(100) PRIMARY KEY,
      value TEXT
    )`);

    // Seed Data
    const [parties] = await promisePool.query("SELECT COUNT(*) AS count FROM parties");
    if (parties[0].count === 0) {
      console.log('Seeding parties...');
      await promisePool.query("INSERT INTO parties (name, phone, due, type, initials, color, email, gstin, company_name, billing_address, shipping_address, tds, tcs, rcm_applicable, notes, tags, credit_limit, state, linked_customer_id) VALUES ?", [
        [
          ['Adarsh D', '9823664474', 10000.00, 'collect', 'AD', 'pink', 'adarsh@example.com', null, 'Adarsh Enterprises', null, null, 0, 0, 0, null, null, 0, null, null],
          ['AR ENTERPRISES', '', 25587.00, 'pay', 'AE', 'teal', null, '29XYZDE1234F1Z6', 'AR Enterprises', null, null, 0, 0, 0, null, null, 0, null, null],
          ['Jainam Shah', '8780767186', 763.00, 'pay', 'JS', 'green', null, null, null, null, null, 0, 0, 0, null, null, 0, null, null],
          ['Seemith', '8787878754', 8885.00, 'pay', 'S', 'indigo', null, null, null, null, null, 0, 0, 0, null, null, 0, null, null],
          ['Vibhav', '4252412211', 0.00, 'none', 'V', 'red', null, null, null, null, null, 0, 0, 0, null, null, 0, null, null]
        ]
      ]);
    }

    const [txs] = await promisePool.query("SELECT COUNT(*) AS count FROM transactions");
    if (txs[0].count === 0) {
      console.log('Seeding transactions...');
      await promisePool.query("INSERT INTO transactions (name, invoice, date, amount, status, by_user, hasWhatsapp) VALUES ?", [
        [
          ['SK TOOLS COPORTATION', 'FY-23-24/222', '24 Jul 2023', 15588, 'pending', 'rupa', 0],
          ['Meenakshi', 'FY-23-24/221', '24 Jul 2023', 1299, 'pending', 'rupa', 0],
          ['TALENT', 'FY-23-24/220', '24 Jul 2023', 2500, 'pending', 'rupa', 1]
        ]
      ]);
    }

    const [prods] = await promisePool.query("SELECT COUNT(*) AS count FROM products");
    if (prods[0].count === 0) {
      console.log('Seeding products...');
      await promisePool.query("INSERT INTO products (title, price, tag, discount) VALUES ?", [
        [
          ['Diwali Alpana Pack + Chocolates', '₹ 1200.00', 'DIWALI GIFTS', null],
          ['Diwali Special Box', '', 'DIWALI GIFTS', '5% OFF']
        ]
      ]);
    }

    const [stats] = await promisePool.query("SELECT COUNT(*) AS count FROM dashboard_stats");
    if (stats[0].count === 0) {
      console.log('Seeding stats...');
      await promisePool.query("INSERT INTO dashboard_stats (sales, purchases) VALUES (10000609000.00, 31200000.00)");
    }

    const [pDetails] = await promisePool.query("SELECT COUNT(*) AS count FROM product_details");
    if (pDetails[0].count === 0) {
      console.log('Seeding product_details...');
      await promisePool.query("INSERT INTO product_details (product_id, selling_price, tax_rate, purchase_price, quantity, unit, category, hsn_code, type, barcode, description) VALUES ?", [
        [
          [1, 100.00, 0.0, 0.00, 0.00, 'OTH', 'ADD', '00000000', 'Product', '00000000', 'Create your first invoice with ease using our sample product!']
        ]
      ]);
    }

    const [payments] = await promisePool.query("SELECT COUNT(*) AS count FROM payments_timeline");
    if (payments[0].count === 0) {
      console.log('Seeding payments_timeline...');
      await promisePool.query("INSERT INTO payments_timeline (date, type, amount, reference) VALUES ?", [
        [
          ['24 Jul 2026', 'received', 15000.00, 'INV-001'],
          ['25 Jul 2026', 'paid', 5000.00, 'EXP-001']
        ]
      ]);
    }

    const [gstr1] = await promisePool.query("SELECT COUNT(*) AS count FROM gstr1_records");
    if (gstr1[0].count === 0) {
      console.log('Seeding gstr1_records...');
      await promisePool.query("INSERT INTO gstr1_records (gstin, receiver_name, tab_type, date) VALUES ?", [
        [
          ['29ABCDE1234F1Z5', 'Acme Corp', 'B2B', '15-07-2026'],
          ['29XYZDE1234F1Z6', 'Globex Inc', 'B2B', '16-07-2026'],
          ['Unregistered', 'John Doe', 'B2CL', '17-07-2026']
        ]
      ]);
    }

    const [eways] = await promisePool.query("SELECT COUNT(*) AS count FROM eway_bills");
    if (eways[0].count === 0) {
      console.log('Seeding eway_bills...');
      await promisePool.query("INSERT INTO eway_bills (billNumber, amount, status) VALUES ?", [
        [
          ['1001', 50000.00, 'Generated'],
          ['1002', 125000.00, 'In Transit']
        ]
      ]);
    }

    const [einvs] = await promisePool.query("SELECT COUNT(*) AS count FROM einvoices");
    if (einvs[0].count === 0) {
      console.log('Seeding einvoices...');
      await promisePool.query("INSERT INTO einvoices (invoice_number, status) VALUES ?", [
        [
          ['INV-2026-001', 'IRN Generated'],
          ['INV-2026-002', 'IRN Generated']
        ]
      ]);
    }

    const [users] = await promisePool.query("SELECT COUNT(*) AS count FROM users");
    if (users[0].count === 0) {
      console.log('Seeding users...');
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('password123', 8);
      await promisePool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Admin User', 'admin@example.com', hash, 'admin']);
    }

    const [company] = await promisePool.query("SELECT COUNT(*) AS count FROM company");
    if (company[0].count === 0) {
      console.log("Seeding company...");
      await promisePool.query("INSERT INTO company (name, gst_number, phone, email, address, state, pan, alternate_phone, website, business_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['Swipe demo', '29ABCDE1234F1Z5', '9876543210', 'admin@swipedemo.com', 'Q-city, 2nd Floor Block A\nHyderabad, TELANGANA, 500032', 'Telangana', '', '', '', '']
      );
    }

    const [banks] = await promisePool.query("SELECT COUNT(*) AS count FROM bank_accounts");
    if (banks[0].count === 0) {
      console.log("Seeding bank accounts...");
      await promisePool.query("INSERT INTO bank_accounts (account_holder_name, account_no, ifsc_code, bank_name, branch_name, upi_id, upi_number, opening_balance, notes, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['Swipe Demo Acc', '1234567890', 'SBIN0001234', 'State Bank of India', 'Main Branch', 'swipedemo@ybl', '9876543210', 0.0, '', 1]
      );
    }

    const [settings] = await promisePool.query("SELECT COUNT(*) AS count FROM app_settings");
    if (settings[0].count === 0) {
      console.log("Seeding default settings...");
      await promisePool.query("INSERT INTO app_settings (\`key\`, value) VALUES ?", [
        [
          ['selected_template', 'Modern'],
          ['price_decimal_format', '2'],
          ['show_details', 'true']
        ]
      ]);
    }

  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

initDB();

module.exports = promisePool;
